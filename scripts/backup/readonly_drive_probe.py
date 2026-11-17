#!/usr/bin/env python3
"""Owner-triggered, read-only diagnosis of the pinned encrypted-backup Drive target.

No Supabase connection, database export, Google Drive write, or secret printing.
"""
import os
from pathlib import Path
import re
import tempfile

from drive_errors import DriveFailure
from drive_destination import FOLDER_ID, REMOTE, PrivateDrive

STAGES = frozenset({
    'DRIVE_DESTINATION_VALIDATE', 'DRIVE_CONFIG_VALIDATE',
    'DRIVE_ROOT_LIST', 'DRIVE_ROOT_STAT',
    'DRIVE_ROOT_METADATA', 'DRIVE_ROOT_PERMISSIONS',
    'DRIVE_OAUTH_IDENTITY', 'DRIVE_OWNER_MATCHED',
})


def main():
    if not (
        os.getenv('GITHUB_ACTIONS') == 'true'
        and os.getenv('GITHUB_EVENT_NAME') == 'workflow_dispatch'
        and os.getenv('GITHUB_REF') == 'refs/heads/main'
        and os.getenv('GITHUB_REPOSITORY') == 'Danielsanchezdesarrolador/biomotors-taller'
        and os.getenv('GITHUB_ACTOR') == 'Danielsanchezdesarrolador'
    ):
        print('DRIVE_READONLY_DIAG: GUARD_REJECTED')
        return 1

    content = os.environ.get('BT_BACKUP_DRIVE_CONFIG_CONTENT', '')
    if not content:
        print('DRIVE_READONLY_DIAG: DRIVE_CONFIG_MISSING')
        return 1

    expected_owner = os.environ.get('BT_BACKUP_DRIVE_EXPECTED_OWNER', '')
    if not expected_owner:
        print('DRIVE_READONLY_DIAG: DRIVE_EXPECTED_OWNER_MISSING')
        return 1

    stage = 'DRIVE_DESTINATION_VALIDATE'

    def record(value):
        nonlocal stage
        if value not in STAGES:
            raise ValueError('Unapproved diagnostic stage')
        stage = value
        if value == 'DRIVE_OWNER_MATCHED':
            print('DRIVE_READONLY_DIAG: DRIVE_OWNER_MATCHED')

    # Secret exists only in environment and a private temporary file, never checkout.
    os.umask(0o077)
    try:
        with tempfile.TemporaryDirectory(prefix='bt-drive-readonly-') as root:
            path = Path(root) / 'rclone.conf'
            with os.fdopen(os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600), 'w') as stream:
                stream.write(content)
            PrivateDrive(path, REMOTE, FOLDER_ID, stage_hook=record,
                         expected_owner=expected_owner)
    except DriveFailure as error:
        print('DRIVE_READONLY_DIAG: ' + error.code)
        return 1
    except Exception:
        # Never emit errors from rclone, Google API, urllib, configparser, or secrets.
        print('DRIVE_READONLY_DIAG: ' + stage + '_FAILED')
        return 1
    print('DRIVE_READONLY_DIAG: OK')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
