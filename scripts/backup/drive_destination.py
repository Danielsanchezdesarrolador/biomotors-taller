"""Pinned private Drive destination. No root_folder_id and no path-based writes.

rclone refreshes OAuth without selecting a destination by name. The approved
ID, ownership, root parent and private permissions authorize all transfers.
"""
import configparser
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
from urllib.parse import urlencode, urlsplit
from urllib.request import Request, HTTPRedirectHandler, build_opener
from urllib.error import HTTPError
from drive_errors import DriveFailure, rclone_json, http_failure

REMOTE = 'bytetorque_backup'
FOLDER_NAME = 'Respaldos ByteTorque'
FOLDER_ID = '1FPD-Bnfbf8m0vxnYCOtT0yald7mCi9pT'
MIME_FOLDER = 'application/vnd.google-apps.folder'
BACKUP_PATTERN = r'bytetorque-[0-9]{8}T[0-9]{6}Z-[a-f0-9]{32}'
FILES = {'database.dump.gpg', 'roles.sql.gpg', 'manifest.json', 'restore-receipt.json'}


def validate_config(content):
    config = configparser.ConfigParser(interpolation=None)
    config.read_string(content)
    allowed = {'type', 'client_id', 'client_secret', 'scope', 'token', 'root_folder_id'}
    if config.defaults() or config.sections() != [REMOTE]:
        raise RuntimeError('One approved Drive remote required')
    section = config[REMOTE]
    if (set(section) - allowed or section.get('type') != 'drive' or
            section.get('root_folder_id', '') or section.get('scope') != 'drive.file'):
        raise RuntimeError('Unrooted drive.file configuration required')
    token = json.loads(section.get('token', '{}'))
    if not isinstance(token, dict) or not token.get('access_token') or not token.get('refresh_token'):
        raise RuntimeError('Refreshable OAuth required')
    return token['access_token']


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise RuntimeError('Drive redirect refused')


class PrivateDrive:
    def __init__(self, config_path, remote, folder, *, stage_hook=None, expected_owner=None):
        # Optional fixed-code stage callback for read-only diagnosis. No secrets passed.
        self._preflight_stage_hook = stage_hook
        self._mark_preflight('DRIVE_DESTINATION_VALIDATE')
        if remote != REMOTE or folder != FOLDER_ID:
            raise RuntimeError('Unapproved Drive destination')
        config_path = Path(config_path)
        if config_path.stat().st_mode & 0o077:
            raise RuntimeError('Owner-only Drive binding required')
        self._mark_preflight('DRIVE_CONFIG_VALIDATE')
        validate_config(config_path.read_text())
        self._mark_preflight('DRIVE_ROOT_LIST')
        # Read only. Never create a missing path or set --drive-root-folder-id.
        entries = rclone_json(
            ['rclone', '--config', str(config_path), 'lsjson', '--dirs-only', REMOTE + ':'],
            env={k: v for k, v in os.environ.items() if not k.startswith(('RCLONE_', 'BT_BACKUP_', 'BT_RESTORE_'))})
        if not isinstance(entries, list) or any(not isinstance(row, dict) for row in entries):
            raise DriveFailure('DRIVE_LIST_SCHEMA_INVALID')
        # Optional owner assertion is supplied privately, never logged or persisted.
        # Use the token after rclone has refreshed it with its original OAuth client.
        self._token = validate_config(config_path.read_text())
        if expected_owner is not None:
            if not isinstance(expected_owner, str) or not re.fullmatch(r'[^\s@]+@[^\s@]+', expected_owner):
                raise DriveFailure('DRIVE_OWNER_INPUT_INVALID')
            self._mark_preflight('DRIVE_OAUTH_IDENTITY')
            identity = self._json('about', {'fields': 'user(emailAddress)'})
            actual = identity.get('user', {}).get('emailAddress') if isinstance(identity, dict) else None
            if not isinstance(actual, str) or not actual:
                raise DriveFailure('DRIVE_OWNER_UNAVAILABLE')
            if actual.casefold() != expected_owner.casefold():
                raise DriveFailure('DRIVE_OWNER_MISMATCH')
            self._mark_preflight('DRIVE_OWNER_MATCHED')
        # Names are not identities. Root listing is used ONLY to refresh OAuth;
        # empty lists, homonyms and shortcut IDs cannot select a destination.
        self._directories = {}
        self.check_root()

    def _mark_preflight(self, stage):
        if self._preflight_stage_hook is not None:
            self._preflight_stage_hook(stage)

    def _open(self, request):
        # Normal system CA validation and inherited proxy; never follow redirects
        # carrying OAuth headers. Exceptions are sanitized at the entry points.
        return build_opener(NoRedirect()).open(request, timeout=30)

    def _json(self, resource, params=None, body=None, data=None, headers=None, upload=False):
        base = 'https://www.googleapis.com/' + ('upload/' if upload else '') + 'drive/v3/'
        url = base + resource + ('?' + urlencode(params) if params else '')
        request_headers = {'Authorization': 'Bearer ' + self._token}
        if headers:
            request_headers.update(headers)
        if body is not None:
            data = json.dumps(body).encode()
            request_headers['Content-Type'] = 'application/json'
        request = Request(url, data=data, headers=request_headers,
                          method='POST' if data is not None else 'GET')
        try:
            with self._open(request) as response:
                return json.load(response)
        except HTTPError as error:
            failure = http_failure(error)
            error.close()
            raise failure from None

    def _metadata(self, identifier):
        if not re.fullmatch(r'[A-Za-z0-9_-]{10,120}', identifier):
            raise RuntimeError('Invalid Drive object identity')
        return self._json('files/' + identifier, {'fields': 'id,name,mimeType,trashed,ownedByMe,parents'})

    def _private(self, identifier):
        # Enumerate all pages; missing/incomplete/unknown permissions fail closed.
        params = {'fields': 'nextPageToken,permissions(id,type,role,deleted)', 'pageSize': 100}
        permissions, seen = [], set()
        for _ in range(20):
            result = self._json('files/' + identifier + '/permissions', params)
            rows = result.get('permissions')
            if not isinstance(rows, list):
                raise RuntimeError('Drive permissions unavailable')
            permissions.extend(rows)
            token = result.get('nextPageToken')
            if not token:
                break
            if token in seen:
                raise RuntimeError('Incomplete Drive permissions')
            seen.add(token)
            params['pageToken'] = token
        else:
            raise RuntimeError('Incomplete Drive permissions')
        if (not permissions or not any(p.get('role') == 'owner' for p in permissions) or
                any(not p.get('id') or p.get('deleted') or p.get('type') != 'user' or
                    p.get('role') not in ('owner', 'writer', 'reader', 'commenter') for p in permissions)):
            raise RuntimeError('Private individual-only Drive permissions required')

    def check_root(self):
        self._mark_preflight('DRIVE_ROOT_METADATA')
        row = self._metadata(FOLDER_ID)
        if (row.get('id') != FOLDER_ID or row.get('name') != FOLDER_NAME or
                row.get('mimeType') != MIME_FOLDER or row.get('trashed') is not False or
                row.get('ownedByMe') is not True):
            raise RuntimeError('Approved Drive folder metadata not verified')
        self._mark_preflight('DRIVE_ROOT_LOCATION')
        root = self._json('files/root', {'fields': 'id,mimeType,ownedByMe,trashed'})
        if (not isinstance(root, dict) or
                not re.fullmatch(r'[A-Za-z0-9_-]{10,120}', root.get('id', '')) or
                root.get('mimeType') != MIME_FOLDER or root.get('ownedByMe') is not True or
                root.get('trashed') is not False):
            raise DriveFailure('DRIVE_ROOT_LOCATION_UNVERIFIED')
        if row.get('parents') != [root['id']]:
            raise DriveFailure('DRIVE_FOLDER_LOCATION_MISMATCH')
        self._mark_preflight('DRIVE_ROOT_PERMISSIONS')
        self._private(FOLDER_ID)

    def _find(self, parent, name):
        params = {'q': f"'{parent}' in parents and name = '{name}' and trashed = false",
                  'fields': 'nextPageToken,incompleteSearch,files(id,name,mimeType,parents)', 'pageSize': 100}
        result = self._json('files', params)
        if result.get('nextPageToken') or result.get('incompleteSearch') or not isinstance(result.get('files'), list):
            raise RuntimeError('Ambiguous Drive listing')
        return result['files']

    def backup_directory(self, name, create=False):
        if not re.fullmatch(BACKUP_PATTERN, name):
            raise RuntimeError('Invalid backup identity')
        self.check_root()
        found = self._find(FOLDER_ID, name)
        if create:
            if found:
                raise RuntimeError('Backup already exists; overwrite refused')
            row = self._json('files', {'fields': 'id'},
                             body={'name': name, 'mimeType': MIME_FOLDER, 'parents': [FOLDER_ID]})
        else:
            if len(found) != 1:
                raise RuntimeError('Backup folder missing or ambiguous')
            row = found[0]
        identifier = row.get('id', '')
        self._check_child(identifier, FOLDER_ID, name, folder=True)
        self._directories[name] = identifier
        return name

    def _check_child(self, identifier, parent, name, folder=False):
        row = self._metadata(identifier)
        if (row.get('id') != identifier or row.get('name') != name or
                row.get('parents') != [parent] or row.get('trashed') is not False or
                row.get('ownedByMe') is not True or
                (row.get('mimeType') != MIME_FOLDER if folder else
                 row.get('mimeType') != 'application/octet-stream')):
            raise RuntimeError('Drive object parent or metadata mismatch')
        self._private(identifier)

    def _directory(self, name):
        self.check_root()
        identifier = self._directories.get(name)
        if not identifier:
            raise RuntimeError('Unvalidated backup directory')
        self._check_child(identifier, FOLDER_ID, name, folder=True)
        return identifier

    def _file(self, parent, name):
        if name not in FILES:
            raise RuntimeError('Unapproved backup filename')
        found = self._find(parent, name)
        if len(found) != 1:
            raise RuntimeError('Backup file missing or ambiguous')
        identifier = found[0].get('id', '')
        self._check_child(identifier, parent, name)
        return identifier

    def download(self, directory, name, destination, expected_id=None):
        parent = self._directory(directory)
        identifier = self._file(parent, name)
        if expected_id is not None and identifier != expected_id:
            raise RuntimeError('Uploaded Drive identity changed')
        request = Request('https://www.googleapis.com/drive/v3/files/' + identifier + '?alt=media',
                          headers={'Authorization': 'Bearer ' + self._token})
        with self._open(request) as response, open(destination, 'xb') as output:
            for chunk in iter(lambda: response.read(1024 * 1024), b''):
                output.write(chunk)
        # Detect changed parents/permissions before accepting the downloaded bytes.
        self._directory(directory)
        self._check_child(identifier, parent, name)

    def _upload(self, path, parent):
        # Resumable upload supports database ciphertext larger than 5 MiB. No
        # automatic retry: ambiguous acknowledgements fail without a success receipt.
        total = path.stat().st_size
        if total <= 0:
            raise RuntimeError('Empty backup artifact refused')
        metadata = json.dumps({'name': path.name, 'parents': [parent]}).encode()
        request = Request('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id',
                          data=metadata, method='POST', headers={
                              'Authorization': 'Bearer ' + self._token,
                              'Content-Type': 'application/json',
                              'X-Upload-Content-Type': 'application/octet-stream',
                              'X-Upload-Content-Length': str(total)})
        with self._open(request) as response:
            session = response.headers.get('Location', '')
        target = urlsplit(session)
        if (target.scheme != 'https' or target.hostname != 'www.googleapis.com' or
                target.port not in (None, 443) or target.username is not None or
                target.path != '/upload/drive/v3/files' or target.fragment):
            raise RuntimeError('Unapproved Drive upload session')
        offset = 0
        with path.open('rb') as stream:
            for chunk in iter(lambda: stream.read(8 * 1024 * 1024), b''):
                end = offset + len(chunk) - 1
                if end >= total:
                    raise RuntimeError('Backup artifact changed during upload')
                request = Request(session, data=chunk, method='PUT', headers={
                    'Authorization': 'Bearer ' + self._token,
                    'Content-Type': 'application/octet-stream',
                    'Content-Length': str(len(chunk)),
                    'Content-Range': f'bytes {offset}-{end}/{total}'})
                try:
                    with self._open(request) as response:
                        if end + 1 != total:
                            raise RuntimeError('Premature Drive upload completion')
                        result = json.load(response)
                    if stream.read(1):
                        raise RuntimeError('Backup artifact changed during upload')
                    return result
                except HTTPError as error:
                    if (error.code != 308 or end + 1 == total or
                            error.headers.get('Range') != f'bytes=0-{end}'):
                        raise RuntimeError('Drive upload acknowledgement failed') from None
                    error.close()
                offset = end + 1
        raise RuntimeError('Incomplete Drive upload')

    def upload_verify(self, directory, paths, temp):
        for path in paths:
            parent = self._directory(directory)
            if path.name not in FILES or self._find(parent, path.name):
                raise RuntimeError('Unapproved filename or overwrite refused')
            row = self._upload(path, parent)
            identifier = row.get('id', '')
            self._check_child(identifier, parent, path.name)
            # Read back the exact uploaded ID, not a potentially ambiguous name.
            if self._file(parent, path.name) != identifier:
                raise RuntimeError('Uploaded Drive identity mismatch')
            readback = temp / ('readback-' + path.name)
            self.download(directory, path.name, readback, expected_id=identifier)
            def digest(file):
                value = hashlib.sha256()
                with file.open('rb') as stream:
                    for chunk in iter(lambda: stream.read(1024 * 1024), b''):
                        value.update(chunk)
                return value.digest()
            if digest(path) != digest(readback):
                raise RuntimeError('Encrypted Drive object integrity mismatch')
            readback.unlink()
