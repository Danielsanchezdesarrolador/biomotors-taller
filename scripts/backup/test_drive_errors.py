"""Offline evidence classification, owner comparison and secret-safe entrypoint."""
import contextlib
import io
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch
from urllib.error import HTTPError
import drive_errors as errors
import drive_destination as drive
import readonly_drive_probe as probe
from test_drive_destination import config, metadata

class DiagnosticsTests(unittest.TestCase):
    def test_provider_classification_is_finite_and_secret_safe(self):
        cases = {
            'invalid_grant': 'DRIVE_OAUTH_GRANT_REJECTED',
            'invalid_client': 'DRIVE_OAUTH_CLIENT_REJECTED',
            'insufficientPermissions': 'DRIVE_SCOPE_INSUFFICIENT',
            'accessNotConfigured': 'DRIVE_API_DISABLED',
            'rateLimitExceeded': 'DRIVE_RATE_LIMITED',
            'x509: certificate': 'DRIVE_TLS_FAILED',
            'dial tcp': 'DRIVE_NETWORK_FAILED',
            'Invalid Credentials': 'DRIVE_HTTP_UNAUTHENTICATED',
            'unknown flag:': 'DRIVE_RCLONE_CONFIG_REJECTED',
            'unrecognized': 'DRIVE_RCLONE_EXECUTION_FAILED',
        }
        for message, expected in cases.items():
            with self.subTest(expected=expected):
                result = subprocess.CompletedProcess([], 1, '', message + ' PRIVATE_TOKEN private@example.test')
                with patch.object(errors.subprocess, 'run', return_value=result):
                    with self.assertRaises(errors.DriveFailure) as caught:
                        errors.rclone_json(['rclone'], {})
                self.assertEqual(str(caught.exception), expected)
                self.assertNotIn('PRIVATE', str(caught.exception))

    def test_launch_timeout_and_invalid_json(self):
        for exception, expected in ((FileNotFoundError('PRIVATE'), 'DRIVE_RCLONE_MISSING'),
                                    (OSError('PRIVATE'), 'DRIVE_RCLONE_LAUNCH_FAILED'),
                                    (subprocess.TimeoutExpired('PRIVATE', 45, stderr='PRIVATE'), 'DRIVE_RCLONE_TIMEOUT')):
            with patch.object(errors.subprocess, 'run', side_effect=exception), self.assertRaises(errors.DriveFailure) as caught:
                errors.rclone_json(['rclone'], {})
            self.assertEqual(str(caught.exception), expected)
        with patch.object(errors.subprocess, 'run', return_value=subprocess.CompletedProcess([], 0, 'PRIVATE', '')):
            with self.assertRaisesRegex(errors.DriveFailure, '^DRIVE_LIST_JSON_INVALID$'):
                errors.rclone_json(['rclone'], {})

    def test_http_status_does_not_claim_scope_or_account(self):
        for status, expected in ((401, 'DRIVE_HTTP_UNAUTHENTICATED'), (403, 'DRIVE_HTTP_FORBIDDEN'),
                                 (404, 'DRIVE_FOLDER_INACCESSIBLE'), (429, 'DRIVE_RATE_LIMITED')):
            self.assertEqual(str(errors.http_failure(HTTPError('PRIVATE', status, 'PRIVATE', {}, None))), expected)

    def test_structured_http_reason_is_safe(self):
        body = io.BytesIO(json.dumps({'error': {'errors': [{'reason': 'insufficientPermissions', 'message': 'PRIVATE'}]}}).encode())
        error = HTTPError('PRIVATE', 403, 'PRIVATE', {}, body)
        self.assertEqual(str(errors.http_failure(error)), 'DRIVE_SCOPE_INSUFFICIENT')

    def test_same_account_and_hidden_folder_are_distinguished(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'rclone.conf'
            path.write_text(config()); path.chmod(0o600)
            for actual, expected, code in (
                ('other@example.test', 'owner@example.test', 'DRIVE_OWNER_MISMATCH'),
                ('owner@example.test', 'owner@example.test', 'DRIVE_FOLDER_INACCESSIBLE'),
            ):
                def api(instance, resource, params=None, **kwargs):
                    if resource == 'about':
                        return {'user': {'emailAddress': actual}}
                    raise errors.DriveFailure('DRIVE_FOLDER_INACCESSIBLE')
                stages = []
                with patch.object(errors.subprocess, 'run', return_value=subprocess.CompletedProcess([], 0, '[]', '')), patch.object(drive.PrivateDrive, '_json', autospec=True, side_effect=api), self.assertRaises(errors.DriveFailure) as caught:
                    drive.PrivateDrive(path, drive.REMOTE, drive.FOLDER_ID, expected_owner=expected, stage_hook=stages.append)
                self.assertEqual(caught.exception.code, code)
                self.assertEqual('DRIVE_OWNER_MATCHED' in stages, actual == expected)

    def test_visible_by_id_but_not_in_root_does_not_bypass_guard(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'rclone.conf'
            path.write_text(config()); path.chmod(0o600)
            with patch.object(errors.subprocess, 'run', return_value=subprocess.CompletedProcess([], 0, '[]', '')), patch.object(drive.PrivateDrive, '_json', return_value=metadata(drive.FOLDER_ID, drive.FOLDER_NAME)) as api, self.assertRaisesRegex(errors.DriveFailure, '^DRIVE_FOLDER_NOT_LISTED$'):
                drive.PrivateDrive(path, drive.REMOTE, drive.FOLDER_ID)
            self.assertEqual(api.call_args.args[0], 'files/' + drive.FOLDER_ID)

    def test_readonly_entrypoint_never_emits_provider_or_owner(self):
        env = {'GITHUB_ACTIONS':'true','GITHUB_EVENT_NAME':'workflow_dispatch',
               'GITHUB_REF':'refs/heads/main','GITHUB_REPOSITORY':'Danielsanchezdesarrolador/biomotors-taller',
               'GITHUB_ACTOR':'Danielsanchezdesarrolador','BT_BACKUP_DRIVE_CONFIG_CONTENT': config(),
               'BT_BACKUP_DRIVE_EXPECTED_OWNER':'owner@example.test'}
        for exception, expected in ((errors.DriveFailure('DRIVE_OAUTH_GRANT_REJECTED'), 'DRIVE_OAUTH_GRANT_REJECTED'),
                                    (RuntimeError('PRIVATE_TOKEN'), 'DRIVE_DESTINATION_VALIDATE_FAILED')):
            output = io.StringIO()
            with patch.dict(os.environ, env, clear=True), patch.object(probe, 'PrivateDrive', side_effect=exception), contextlib.redirect_stdout(output):
                self.assertEqual(probe.main(), 1)
            self.assertEqual(output.getvalue(), 'DRIVE_READONLY_DIAG: ' + expected + '\n')

    def test_unknown_error_cannot_be_printed(self):
        self.assertEqual(str(errors.DriveFailure('PRIVATE_TOKEN')), 'DRIVE_UNCLASSIFIED')

if __name__ == '__main__':
    unittest.main()
