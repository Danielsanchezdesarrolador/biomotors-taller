"""Offline metadata/transport tests. Never contacts Drive or starts PostgreSQL."""
import copy
import io
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch
import sys
from urllib.error import HTTPError

import drive_destination as drive
import verify_cloud_restore as verifier

BACKUP = 'bytetorque-20261116T000000Z-' + 'a' * 32
DIRECTORY = 'offline_directory_12345'
OBJECT = 'offline_object_123456'


def config(extra=''):
    return ('[bytetorque_backup]\ntype=drive\nscope=drive.file\n'
            'token={"access_token":"OFFLINE","refresh_token":"OFFLINE"}\n' + extra)


def metadata(identifier, name, parent=None, folder=True):
    return {'id': identifier, 'name': name, 'parents': [parent] if parent else ['offline_root_12345'],
            'mimeType': drive.MIME_FOLDER if folder else 'application/octet-stream',
            'trashed': False, 'ownedByMe': True}


class OfflineDriveTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.path = Path(self.temp.name) / 'oauth-offline'
        self.path.write_text(config())
        self.path.chmod(0o600)
        self.listing = [{'Name': drive.FOLDER_NAME, 'Path': drive.FOLDER_NAME,
                         'IsDir': True, 'ID': drive.FOLDER_ID}]
        self.root = metadata(drive.FOLDER_ID, drive.FOLDER_NAME)
        self.permissions = {'permissions': [{'id': 'offline-owner', 'type': 'user', 'role': 'owner'}]}
        self.rows = {drive.FOLDER_ID: self.root,
                     DIRECTORY: metadata(DIRECTORY, BACKUP, drive.FOLDER_ID),
                     OBJECT: metadata(OBJECT, 'manifest.json', DIRECTORY, folder=False)}
        self.requests = []
        # Any unmocked HTTP access is a test failure, including with dummy OAuth.
        self.network = patch.object(drive.PrivateDrive, '_open', side_effect=AssertionError('Network forbidden'))
        self.network.start()
        self.addCleanup(self.network.stop)

    def api(self, instance, resource, params=None, body=None, data=None, headers=None, upload=False):
        self.requests.append((resource, params, body, upload))
        if resource.endswith('/permissions'):
            return copy.deepcopy(self.permissions)
        if resource.startswith('files/'):
            return copy.deepcopy(self.rows[resource.split('/')[1]])
        if resource == 'files' and body:
            self.assertEqual(body['parents'], [drive.FOLDER_ID])
            self.assertEqual(body['name'], BACKUP)
            return {'id': DIRECTORY}
        return {'files': []}

    def connect(self):
        result = subprocess.CompletedProcess([], 0, stdout=json.dumps(self.listing))
        resolved = subprocess.CompletedProcess([], 0, stdout=json.dumps(self.listing[0] if self.listing else {}))
        with patch.object(drive.subprocess, 'run', side_effect=[result, resolved]) as runner:
            destination = drive.PrivateDrive(self.path, drive.REMOTE, drive.FOLDER_ID)
            args = runner.call_args_list[0]
            self.assertEqual(args.args[0][-3:], ['lsjson', '--dirs-only', 'bytetorque_backup:'])
            self.assertFalse(any(k.startswith('RCLONE_') for k in args.kwargs['env']))
            self.assertEqual(runner.call_args.args[0][-1], 'bytetorque_backup:Respaldos ByteTorque')
        return destination

    def mocked_api(self):
        return patch.object(drive.PrivateDrive, '_json', autospec=True, side_effect=self.api)

    def test_valid_unrooted_config_and_destination(self):
        self.assertEqual(drive.validate_config(config()), 'OFFLINE')
        with self.mocked_api():
            self.connect()

    def test_root_full_scope_and_custom_endpoint_rejected(self):
        for content in (config('root_folder_id=' + drive.FOLDER_ID),
                        config().replace('drive.file', 'drive'),
                        config('token_url=https://unapproved.invalid'),
                        config('\n[other]\ntype=drive')):
            with self.subTest(content=content), self.assertRaises(RuntimeError):
                drive.validate_config(content)

    def test_wrong_requested_destination_rejected_before_rclone(self):
        with patch.object(drive.subprocess, 'run') as runner:
            with self.assertRaises(RuntimeError):
                drive.PrivateDrive(self.path, drive.REMOTE, 'unapproved_folder_12345')
            runner.assert_not_called()

    def test_missing_duplicate_wrong_id_and_shortcut_rejected_before_api(self):
        valid = copy.deepcopy(self.listing[0])
        for listing in ([], [valid, valid], [dict(valid, ID='unapproved_folder_12345')],
                        [dict(valid, IsDir=False)], [dict(valid, Path='another path')]):
            self.listing = listing
            with self.subTest(listing=listing), self.mocked_api() as api, self.assertRaises(RuntimeError):
                self.connect()
            api.assert_not_called()

    def test_functional_path_cannot_resolve_to_another_id(self):
        listed = subprocess.CompletedProcess([], 0, stdout=json.dumps(self.listing))
        resolved = subprocess.CompletedProcess([], 0, stdout=json.dumps(dict(self.listing[0], ID='unapproved_folder_12345')))
        with patch.object(drive.subprocess, 'run', side_effect=[listed, resolved]), self.mocked_api() as api, self.assertRaises(RuntimeError):
            drive.PrivateDrive(self.path, drive.REMOTE, drive.FOLDER_ID)
        api.assert_not_called()

    def test_metadata_missing_wrong_name_trashed_or_unowned_rejected(self):
        for mutation in ({'name': 'Other'}, {'mimeType': 'application/vnd.google-apps.shortcut'},
                         {'trashed': True}, {'trashed': None}, {'ownedByMe': False}):
            self.rows[drive.FOLDER_ID] = dict(self.root, **mutation)
            with self.subTest(mutation=mutation), self.mocked_api(), self.assertRaises(RuntimeError):
                self.connect()

    def test_public_domain_group_missing_or_unknown_permissions_rejected(self):
        for permissions in ({}, {'permissions': []},
                            {'permissions': [{'id': 'x', 'role': 'owner', 'type': 'anyone'}]},
                            {'permissions': [{'id': 'x', 'role': 'owner', 'type': 'domain'}]},
                            {'permissions': [{'id': 'x', 'role': 'owner', 'type': 'group'}]},
                            {'permissions': [{'id': 'x', 'role': 'reader', 'type': 'user'}]}):
            self.permissions = permissions
            with self.subTest(permissions=permissions), self.mocked_api(), self.assertRaises(RuntimeError):
                self.connect()

    def test_public_permission_on_second_page_rejected(self):
        def paginated(instance, resource, params=None, **kwargs):
            if resource.endswith('/permissions'):
                if params.get('pageToken'):
                    return {'permissions': [{'id': 'public', 'type': 'anyone', 'role': 'reader'}]}
                return dict(self.permissions, nextPageToken='NEXT')
            return self.api(instance, resource, params, **kwargs)
        with patch.object(drive.PrivateDrive, '_json', autospec=True, side_effect=paginated), self.assertRaises(RuntimeError):
            self.connect()

    def test_pagination_loop_fails_closed(self):
        self.permissions['nextPageToken'] = 'REPEATED'
        with self.mocked_api(), self.assertRaises(RuntimeError):
            self.connect()

    def test_create_is_parent_pinned_and_path_injection_rejected(self):
        with self.mocked_api():
            destination = self.connect()
            self.assertEqual(destination.backup_directory(BACKUP, create=True), BACKUP)
            with self.assertRaises(RuntimeError):
                destination.backup_directory('../arbitrary', create=True)

    def test_root_becoming_public_blocks_before_create(self):
        with self.mocked_api():
            destination = self.connect()
            self.permissions['permissions'].append({'id': 'public', 'type': 'anyone', 'role': 'reader'})
            with self.assertRaises(RuntimeError):
                destination.backup_directory(BACKUP, create=True)
            self.assertFalse(any(body for _, _, body, _ in self.requests))

    def test_missing_backup_never_created_during_restore(self):
        with self.mocked_api():
            destination = self.connect()
            with self.assertRaises(RuntimeError):
                destination.backup_directory(BACKUP)
            self.assertFalse(any(body for _, _, body, _ in self.requests))

    def test_changed_parent_blocks_before_upload(self):
        with self.mocked_api():
            destination = self.connect()
            destination.backup_directory(BACKUP, create=True)
            self.rows[DIRECTORY]['parents'] = ['unapproved_parent_1234']
            with self.assertRaises(RuntimeError):
                destination.upload_verify(BACKUP, [Path('manifest.json')], Path(self.temp.name))
            self.assertFalse(any(upload for _, _, _, upload in self.requests))

    def test_pinned_upload_and_integrity_mismatch(self):
        with self.mocked_api():
            destination = self.connect()
            destination.backup_directory(BACKUP, create=True)
            artifact = Path(self.temp.name) / 'manifest.json'
            artifact.write_text('{"offline_transport_test":true}')
            def readback(directory, filename, path, expected_id=None):
                self.assertEqual(expected_id, OBJECT)
                path.write_bytes(b'CHANGED')
            with patch.object(destination, '_upload', return_value={'id': OBJECT}) as upload, patch.object(destination, '_file', return_value=OBJECT), patch.object(destination, 'download', side_effect=readback):
                with self.assertRaisesRegex(RuntimeError, 'integrity mismatch'):
                    destination.upload_verify(BACKUP, [artifact], Path(self.temp.name))
                self.assertEqual(upload.call_args.args[1], DIRECTORY)

    def test_readback_success_and_no_overwrite(self):
        with self.mocked_api():
            destination = self.connect()
            destination.backup_directory(BACKUP, create=True)
            artifact = Path(self.temp.name) / 'manifest.json'
            artifact.write_text('{"offline_transport_test":true}')
            def readback(directory, filename, path, expected_id=None):
                path.write_bytes(artifact.read_bytes())
            with patch.object(destination, '_upload', return_value={'id': OBJECT}), patch.object(destination, '_file', return_value=OBJECT), patch.object(destination, 'download', side_effect=readback):
                destination.upload_verify(BACKUP, [artifact], Path(self.temp.name))
            self.assertFalse((Path(self.temp.name) / 'readback-manifest.json').exists())
            with patch.object(destination, '_find', return_value=[{'id': OBJECT}]), self.assertRaises(RuntimeError):
                destination.upload_verify(BACKUP, [artifact], Path(self.temp.name))

    def test_download_rejects_changed_identity_before_http(self):
        with self.mocked_api():
            destination = self.connect()
            destination.backup_directory(BACKUP, create=True)
            with patch.object(destination, '_file', return_value=OBJECT), self.assertRaises(RuntimeError):
                destination.download(BACKUP, 'manifest.json', Path(self.temp.name) / 'result', expected_id='different_id_123456')

    def test_redirect_refused_without_following_oauth(self):
        with self.assertRaises(RuntimeError):
            drive.NoRedirect().redirect_request(None, None, 302, '', {}, 'https://unapproved.invalid')

    def test_real_request_shape_is_https_pinned_and_streamed(self):
        destination = object.__new__(drive.PrivateDrive)
        destination._token = 'OFFLINE'
        response = io.BytesIO(b'{"id":"offline_object_123456"}')
        with patch.object(destination, '_open', return_value=response) as opened:
            result = destination._json('files', {'uploadType': 'multipart'}, data=iter([b'OFFLINE']),
                                       headers={'Content-Length': '7'}, upload=True)
        request = opened.call_args.args[0]
        self.assertEqual(request.full_url, 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart')
        self.assertEqual(request.get_method(), 'POST')
        self.assertEqual(b''.join(request.data), b'OFFLINE')
        self.assertEqual(result['id'], OBJECT)

    def test_resumable_upload_pins_parent_and_verifies_chunk_acknowledgement(self):
        destination = object.__new__(drive.PrivateDrive)
        destination._token = 'OFFLINE'
        artifact = Path(self.temp.name) / 'manifest.json'
        artifact.write_bytes(b'A' * (8 * 1024 * 1024 + 1))
        session = 'https://www.googleapis.com/upload/drive/v3/files?upload_id=OFFLINE'
        initial = io.BytesIO()
        initial.headers = {'Location': session}
        incomplete = HTTPError(session, 308, 'Resume Incomplete', {'Range': 'bytes=0-8388607'}, io.BytesIO())
        with patch.object(destination, '_open', side_effect=[initial, incomplete, io.BytesIO(json.dumps({'id': OBJECT}).encode())]) as opened:
            self.assertEqual(destination._upload(artifact, DIRECTORY), {'id': OBJECT})
        create, first, last = [call.args[0] for call in opened.call_args_list]
        self.assertEqual(json.loads(create.data)['parents'], [DIRECTORY])
        self.assertEqual(first.get_method(), 'PUT')
        self.assertEqual(first.get_header('Content-range'), 'bytes 0-8388607/8388609')
        self.assertEqual(last.get_header('Content-range'), 'bytes 8388608-8388608/8388609')

    def test_upload_session_cannot_redirect_oauth_to_another_host(self):
        destination = object.__new__(drive.PrivateDrive)
        destination._token = 'OFFLINE'
        artifact = Path(self.temp.name) / 'manifest.json'
        artifact.write_bytes(b'OFFLINE')
        response = io.BytesIO()
        response.headers = {'Location': 'https://unapproved.invalid/upload'}
        with patch.object(destination, '_open', return_value=response) as opened, self.assertRaises(RuntimeError):
            destination._upload(artifact, DIRECTORY)
        self.assertEqual(opened.call_count, 1)

    def test_incorrect_chunk_acknowledgement_blocks_completion(self):
        destination = object.__new__(drive.PrivateDrive)
        destination._token = 'OFFLINE'
        artifact = Path(self.temp.name) / 'manifest.json'
        artifact.write_bytes(b'A' * (8 * 1024 * 1024 + 1))
        session = 'https://www.googleapis.com/upload/drive/v3/files?upload_id=OFFLINE'
        response = io.BytesIO()
        response.headers = {'Location': session}
        incorrect = HTTPError(session, 308, 'Resume Incomplete', {'Range': 'bytes=0-7'}, io.BytesIO())
        with patch.object(destination, '_open', side_effect=[response, incorrect]) as opened, self.assertRaises(RuntimeError):
            destination._upload(artifact, DIRECTORY)
        self.assertEqual(opened.call_count, 2)

    def test_download_checks_identity_and_permissions_after_readback(self):
        with self.mocked_api():
            destination = self.connect()
            destination.backup_directory(BACKUP, create=True)
            with patch.object(destination, '_file', return_value=OBJECT), patch.object(destination, '_open', return_value=io.BytesIO(b'OFFLINE_METADATA')):
                target = Path(self.temp.name) / 'metadata-only'
                destination.download(BACKUP, 'manifest.json', target)
                self.assertEqual(target.read_bytes(), b'OFFLINE_METADATA')

    def test_restore_uses_approved_directory_and_manifest_identity(self):
        argv = ['verify', '--drive-remote', drive.REMOTE, '--drive-folder-id', drive.FOLDER_ID,
                '--backup-id', BACKUP]
        for expected_folder in (drive.FOLDER_ID, 'unapproved_folder_12345'):
            with self.subTest(folder=expected_folder):
                from unittest.mock import Mock
                destination = Mock()
                destination.backup_directory.return_value = BACKUP
                def download(directory, filename, target):
                    # No database bytes, encryption, Docker or actual restoration.
                    if filename == 'manifest.json':
                        target.write_text(json.dumps({'backup_id': BACKUP, 'drive_folder_id': expected_folder}))
                destination.download.side_effect = download
                with patch.object(sys, 'argv', argv), \
                        patch.dict(os.environ, {'BT_RESTORE_GNUPGHOME': self.temp.name}), \
                        patch.object(verifier, 'required_file', return_value=str(self.path)), \
                        patch.object(verifier, 'inspect_drive', return_value=destination), \
                        patch.object(verifier, 'restore', return_value={'full_project_backup': False}) as restore, \
                        patch.object(verifier, 'upload_verify') as upload, \
                        patch('builtins.print'):
                    if expected_folder == drive.FOLDER_ID:
                        verifier.main()
                        restore.assert_called_once()
                        self.assertIs(upload.call_args.args[0], destination)
                        self.assertEqual(upload.call_args.args[1], BACKUP)
                    else:
                        with self.assertRaises(RuntimeError):
                            verifier.main()
                        restore.assert_not_called()
                        upload.assert_not_called()


if __name__ == '__main__':
    unittest.main()
