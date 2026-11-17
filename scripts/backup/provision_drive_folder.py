#!/usr/bin/env python3
"""Explicitly authorized ONE empty-folder creation. Never pins or exports a backup."""
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile

from drive_destination import DriveAPI, REMOTE, MIME_FOLDER, validate_config
from drive_errors import DriveFailure, rclone_json

REPOSITORY = 'Danielsanchezdesarrolador/biomotors-taller'
SAFE_CODES = frozenset({
    'GUARD_REJECTED', 'BINDINGS_INVALID', 'OWNER_MISMATCH', 'ROOT_INVALID',
    'NAME_ALREADY_EXISTS', 'LIST_INCOMPLETE', 'CREATE_OUTCOME_UNKNOWN',
    'CANDIDATE_NOT_UNIQUE', 'CANDIDATE_INVALID', 'CANDIDATE_NOT_OWNER_ONLY',
    'PREPARATION_FAILED', 'VERIFICATION_FAILED',
})

class ProvisionFailure(RuntimeError):
    def __init__(self, code):
        self.code = code if code in SAFE_CODES else 'PREPARATION_FAILED'
        super().__init__(self.code)


def authorized_name(env):
    if not (env.get('GITHUB_ACTIONS') == 'true'
            and env.get('GITHUB_EVENT_NAME') == 'workflow_dispatch'
            and env.get('GITHUB_REF') == 'refs/heads/main'
            and env.get('GITHUB_REPOSITORY') == REPOSITORY
            and env.get('GITHUB_ACTOR') == 'Danielsanchezdesarrolador'
            and env.get('GITHUB_TRIGGERING_ACTOR') == 'Danielsanchezdesarrolador'
            and env.get('GITHUB_RUN_ATTEMPT') == '1'
            and env.get('BT_DRIVE_CREATE_APPROVED') == 'true'
            and re.fullmatch(r'[0-9]{1,20}', env.get('GITHUB_RUN_ID', ''))):
        raise ProvisionFailure('GUARD_REJECTED')
    return 'Respaldos ByteTorque OAuth - ' + env['GITHUB_RUN_ID']


def find_candidate(api, parent, name):
    result = api._json('files', {
        'q': f"'{parent}' in parents and name = '{name}' and trashed = false",
        'fields': 'nextPageToken,incompleteSearch,files(id)', 'pageSize': 100,
    })
    if (not isinstance(result, dict) or result.get('nextPageToken') or
            result.get('incompleteSearch') or not isinstance(result.get('files'), list)):
        raise ProvisionFailure('LIST_INCOMPLETE')
    return result['files']


def verify_candidate(api, identifier, name, root_id):
    if not isinstance(identifier, str) or not re.fullmatch(r'[A-Za-z0-9_-]{10,120}', identifier):
        raise ProvisionFailure('CANDIDATE_INVALID')
    row = api._metadata(identifier)
    if (row.get('id') != identifier or row.get('name') != name or
            row.get('mimeType') != MIME_FOLDER or row.get('ownedByMe') is not True or
            row.get('trashed') is not False or row.get('parents') != [root_id]):
        raise ProvisionFailure('CANDIDATE_INVALID')
    # A NEW candidate must be owner-only, stricter than the legacy destination.
    permissions = api._json('files/' + identifier + '/permissions', {
        'fields': 'nextPageToken,permissions(id,type,role,deleted)', 'pageSize': 100,
    })
    rows = permissions.get('permissions', [])
    if (permissions.get('nextPageToken') or len(rows) != 1 or
            rows[0].get('type') != 'user' or rows[0].get('role') != 'owner' or
            not rows[0].get('id') or rows[0].get('deleted')):
        raise ProvisionFailure('CANDIDATE_NOT_OWNER_ONLY')
    contents = api._json('files', {
        'q': f"'{identifier}' in parents and trashed = false",
        'fields': 'nextPageToken,incompleteSearch,files(id)', 'pageSize': 1,
    })
    if (contents.get('files') != [] or contents.get('nextPageToken') or contents.get('incompleteSearch')):
        raise ProvisionFailure('CANDIDATE_INVALID')
    # Detect a move/metadata change during permission verification.
    if api._metadata(identifier) != row:
        raise ProvisionFailure('CANDIDATE_INVALID')


def provision(path, expected_owner, name, env):
    # Exact deterministic name; no user-supplied paths or folder selection.
    if name != authorized_name(env):
        raise ProvisionFailure('GUARD_REJECTED')
    if not re.fullmatch(r'[^\s@]+@[^\s@]+', expected_owner):
        raise ProvisionFailure('BINDINGS_INVALID')
    validate_config(path.read_text())  # Requires drive.file, rejects alternate endpoints.
    child_env = {k: v for k, v in env.items()
                 if not k.startswith(('RCLONE_', 'BT_BACKUP_', 'BT_RESTORE_', 'BT_DRIVE_'))}
    base = ['rclone', '--config', str(path), '--retries', '1', '--low-level-retries', '1']
    listing = rclone_json(base + ['lsjson', '--dirs-only', REMOTE + ':'], child_env)
    if not isinstance(listing, list):
        raise ProvisionFailure('LIST_INCOMPLETE')
    api = DriveAPI(validate_config(path.read_text()))
    identity = api._json('about', {'fields': 'user(emailAddress)'})
    actual = identity.get('user', {}).get('emailAddress')
    if not isinstance(actual, str) or actual.casefold() != expected_owner.casefold():
        raise ProvisionFailure('OWNER_MISMATCH')
    root = api._json('files/root', {'fields': 'id,mimeType,ownedByMe,trashed'})
    root_id = root.get('id', '')
    if (not re.fullmatch(r'[A-Za-z0-9_-]{10,120}', root_id) or
            root.get('mimeType') != MIME_FOLDER or root.get('ownedByMe') is not True or
            root.get('trashed') is not False):
        raise ProvisionFailure('ROOT_INVALID')
    if find_candidate(api, root_id, name):
        raise ProvisionFailure('NAME_ALREADY_EXISTS')
    # No application-level retries. After a timeout/failure creation is ambiguous:
    # never mkdir again, delete, rename, change permissions, or pin a destination.
    try:
        result = subprocess.run(base + ['mkdir', REMOTE + ':' + name], env=child_env,
                                capture_output=True, text=True, timeout=45, check=False)
    except Exception:
        raise ProvisionFailure('CREATE_OUTCOME_UNKNOWN') from None
    if result.returncode:
        raise ProvisionFailure('CREATE_OUTCOME_UNKNOWN')
    api = DriveAPI(validate_config(path.read_text()))
    found = find_candidate(api, root_id, name)
    if len(found) != 1:
        raise ProvisionFailure('CANDIDATE_NOT_UNIQUE')
    identifier = found[0].get('id', '')
    verify_candidate(api, identifier, name, root_id)
    return {'candidate_id': identifier, 'candidate_name': name,
            'owner_root_private_verified': True, 'destination_activated': False,
            'backup_exported': False, 'restoration_verified': False}


def main():
    stage = 'PREPARATION_FAILED'
    try:
        name = authorized_name(os.environ)
        content = os.environ.get('BT_BACKUP_DRIVE_CONFIG_CONTENT', '')
        expected = os.environ.get('BT_BACKUP_DRIVE_EXPECTED_OWNER', '')
        if not content or not expected:
            raise ProvisionFailure('BINDINGS_INVALID')
        os.umask(0o077)
        with tempfile.TemporaryDirectory(prefix='bt-drive-provision-') as folder:
            path = Path(folder) / 'rclone.conf'
            with os.fdopen(os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600), 'w') as stream:
                stream.write(content)
            # Fixed public name allows read-only reconciliation after interruption.
            print(json.dumps({'candidate_name': name, 'destination_activated': False}), flush=True)
            stage = 'VERIFICATION_FAILED'
            receipt = provision(path, expected, name, dict(os.environ))
        print(json.dumps(receipt))
        return 0
    except (ProvisionFailure, DriveFailure) as error:
        print('DRIVE_PROVISION_NOT_COMPLETE: ' + error.code)
    except Exception:
        print('DRIVE_PROVISION_NOT_COMPLETE: ' + stage)
    return 1

if __name__ == '__main__':
    raise SystemExit(main())
