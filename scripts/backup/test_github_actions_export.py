"""Offline validation only: no export, database, Drive, key generation or restore."""
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location('gha_export', Path(__file__).with_name('github_actions_export.py'))
export = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(export)


def bindings():
    # Nonfunctional in-memory placeholders only; never used for an operation.
    return {
        'BT_BACKUP_PGPASS_CONTENT': f'{export.HOST}:5432:postgres:postgres.{export.PROJECT}:NOT_A_CREDENTIAL',
        'BT_BACKUP_DRIVE_CONFIG_CONTENT': (
            '[bytetorque_backup]\ntype=drive\nscope=drive.file\n'
            'token={"access_token":"OFFLINE","refresh_token":"OFFLINE"}\n'),
        'BT_BACKUP_RECIPIENT_CONTENT': '-----BEGIN PGP PUBLIC KEY BLOCK-----\nOFFLINE\n-----END PGP PUBLIC KEY BLOCK-----',
        'BT_BACKUP_RECIPIENT_FINGERPRINT': 'A' * 40,
        'BT_BACKUP_PG_CA_PEM': '-----BEGIN CERTIFICATE-----\nOFFLINE\n-----END CERTIFICATE-----',
    }


class OfflineSafetyTests(unittest.TestCase):
    def validate(self, values):
        # Invalid CA material is tested separately without replacing the SSL parser.
        with patch.object(export.ssl, 'create_default_context'):
            return export.validate_bindings(values)

    def test_expected_binding_shape(self):
        self.assertEqual(self.validate(bindings()), 'A' * 40)

    def test_missing_secrets_fail_closed(self):
        for name in export.SECRET_NAMES:
            values = bindings()
            values[name] = ''
            with self.subTest(name=name), self.assertRaises((ValueError, RuntimeError)):
                self.validate(values)

    def test_wrong_pgpass_host_wildcard_and_multiple_entries_rejected(self):
        for value in ('*:5432:postgres:user:OFFLINE',
                      bindings()['BT_BACKUP_PGPASS_CONTENT'].replace(export.HOST, 'unapproved.invalid'),
                      bindings()['BT_BACKUP_PGPASS_CONTENT'] + '\nEXTRA'):
            values = bindings()
            values['BT_BACKUP_PGPASS_CONTENT'] = value
            with self.subTest(value=value), self.assertRaises((ValueError, RuntimeError)):
                self.validate(values)

    def test_private_key_and_short_fingerprint_rejected(self):
        for name, value in (
            ('BT_BACKUP_RECIPIENT_CONTENT', '-----BEGIN PGP PRIVATE KEY BLOCK-----'),
            ('BT_BACKUP_RECIPIENT_FINGERPRINT', 'A' * 16),
            ('BT_BACKUP_PG_CA_PEM', '-----BEGIN PRIVATE KEY-----'),
        ):
            values = bindings()
            values[name] = value
            with self.subTest(name=name), self.assertRaises((ValueError, RuntimeError)):
                self.validate(values)

    def test_wrong_folder_extra_remotes_and_custom_endpoints_rejected(self):
        original = bindings()['BT_BACKUP_DRIVE_CONFIG_CONTENT']
        for value in (original + '\nroot_folder_id=UNAPPROVED_FOLDER\n',
                      original + '\n[other]\ntype=drive\n',
                      original + '\ntoken_url=https://unapproved.invalid\n',
                      original.replace('scope=drive.file', 'scope=unknown')):
            values = bindings()
            values['BT_BACKUP_DRIVE_CONFIG_CONTENT'] = value
            with self.subTest(value=value), self.assertRaises((ValueError, RuntimeError)):
                self.validate(values)

    def test_ca_parser_rejects_invalid_pem_without_network(self):
        with self.assertRaises(Exception):
            export.validate_bindings(bindings())

    def test_key_mismatch_or_secret_material_never_accepted(self):
        for output in ('pub:::::::::\nfpr:::::::::BBBB:\n',
                       'sec:::::::::\nfpr:::::::::' + 'A' * 40 + ':\n'):
            with tempfile.TemporaryDirectory() as directory:
                result = subprocess.CompletedProcess([], 0, stdout=output)
                with patch.object(export.subprocess, 'run', return_value=result), self.assertRaises((ValueError, RuntimeError)):
                    export.check_public_key(Path(directory), 'OFFLINE', 'A' * 40)

    def test_private_file_permissions(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'nonsecret-test'
            export.write_private(path, 'OFFLINE')
            self.assertEqual(path.stat().st_mode & 0o777, 0o600)

    def test_receipt_allowlist_drops_extra_data(self):
        receipt = {'backup_id': 'bytetorque-20261116T000000Z-' + 'a' * 32,
                   'encrypted_external_readback_verified': True,
                   'restoration_verified': False, 'full_project_backup': False,
                   'unexpected_private_data': 'MUST_NOT_APPEAR'}
        result = export.safe_receipt(json.dumps(receipt))
        self.assertNotIn('MUST_NOT_APPEAR', json.dumps(result))
        self.assertEqual(len(result), 4)
        receipt['restoration_verified'] = True
        with self.assertRaises((ValueError, RuntimeError)):
            export.safe_receipt(json.dumps(receipt))

    def test_raw_errors_are_never_promoted_to_receipts(self):
        with self.assertRaises((ValueError, RuntimeError)):
            export.safe_receipt('PROVIDER_ERROR_WITH_SENSITIVE_CONTENT')

    def test_non_manual_environment_cannot_reach_bindings_or_bridge(self):
        with patch.dict(os.environ, {}, clear=True), patch.object(export, 'run_bridge') as bridge:
            with self.assertRaises((ValueError, RuntimeError)):
                export.main()
            bridge.assert_not_called()

    def test_diagnostics_for_invalid_local_bindings_are_fixed_and_safe(self):
        cases = (
            ('BT_BACKUP_PGPASS_CONTENT', '', 'SECRET_MISSING_BT_BACKUP_PGPASS_CONTENT'),
            ('BT_BACKUP_RECIPIENT_FINGERPRINT', 'BAD', 'GPG_FINGERPRINT_FORMAT'),
            ('BT_BACKUP_RECIPIENT_CONTENT', '-----BEGIN PGP PRIVATE KEY BLOCK-----', 'GPG_PUBLIC_ARMOR'),
            ('BT_BACKUP_PG_CA_PEM', '-----BEGIN PRIVATE KEY-----', 'POSTGRES_CA_FORMAT'),
            ('BT_BACKUP_PGPASS_CONTENT', 'WRONG_SECRET_VALUE', 'POSTGRES_PGPASS_FORMAT'),
            ('BT_BACKUP_DRIVE_CONFIG_CONTENT',
             bindings()['BT_BACKUP_DRIVE_CONFIG_CONTENT'] + 'root_folder_id=UNAPPROVED\\n',
             'DRIVE_CONFIG_FORMAT'),
        )
        for name, bad, expected in cases:
            values = bindings()
            values[name] = bad
            with self.subTest(stage=expected), self.assertRaises(export.BackupStageError) as error:
                self.validate(values)
            self.assertEqual(str(error.exception), expected)
            self.assertNotIn('WRONG_SECRET_VALUE', str(error.exception))
            self.assertNotIn('UNAPPROVED', str(error.exception))

    def test_ca_parser_failure_has_only_safe_code(self):
        with self.assertRaises(export.BackupStageError) as error:
            export.validate_bindings(bindings())
        self.assertEqual(str(error.exception), 'POSTGRES_CA_PARSE')

    def test_unknown_diagnostic_code_is_sanitized(self):
        self.assertEqual(str(export.BackupStageError('SENSITIVE_PROVIDER_DATA')), 'UNCLASSIFIED')

    def test_downstream_failure_markers_are_fixed_and_safe(self):
        # A malicious child must not be able to select arbitrary log content.
        from unittest.mock import MagicMock
        safe = subprocess.CompletedProcess([], 1, stdout='BACKUP_STAGE_FAILURE:POSTGRES_TLS_CONNECT' + chr(10))
        unsafe = subprocess.CompletedProcess([], 1, stdout='BACKUP_STAGE_FAILURE:SECRET_VALUE_FROM_PROVIDER' + chr(10))
        for response, expected in ((safe, 'POSTGRES_TLS_CONNECT'), (unsafe, 'EXPORT_BRIDGE')):
            with self.subTest(expected=expected):
                child = MagicMock()
                child.communicate.return_value = (response.stdout, '')
                child.returncode = response.returncode
                with patch.object(export.subprocess, 'Popen', return_value=child):
                    with self.assertRaises(export.BackupStageError) as raised:
                        # Main wraps unapproved subprocess output as EXPORT_BRIDGE;
                        # test the bridge itself only for the allowlisted case.
                        if expected == 'POSTGRES_TLS_CONNECT':
                            export.run_bridge(['OFFLINE'], {})
                        else:
                            try:
                                export.run_bridge(['OFFLINE'], {})
                            except RuntimeError:
                                raise export.BackupStageError('EXPORT_BRIDGE') from None
                self.assertEqual(str(raised.exception), expected)

    def test_entrypoint_failure_emits_only_safe_stage(self):
        env = {key: value for key, value in os.environ.items() if not key.startswith('GITHUB_')}
        result = subprocess.run([sys.executable, '-B', str(Path(export.__file__))],
                                env=env, capture_output=True, text=True, check=False)
        self.assertEqual(result.returncode, 1)
        self.assertEqual(result.stderr, '')
        self.assertEqual(result.stdout, 'BACKUP_NOT_COMPLETE: WORKFLOW_GUARD\n')


if __name__ == '__main__':
    unittest.main()
