#!/usr/bin/env python3
"""Fetch encrypted backup FROM private Drive, restore offline, upload verification receipt.
No plaintext dump, hosted restore, data mutation, public sharing or bucket creation.
"""
import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
from cloud_backup import required_file, inspect_drive, upload_verify
from restore_isolated import restore


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--drive-remote', required=True)
    parser.add_argument('--drive-folder-id', required=True)
    parser.add_argument('--backup-id', required=True)
    parser.add_argument('--image', default='postgres:17')
    args = parser.parse_args()
    if not re.fullmatch(r'bytetorque-[0-9]{8}T[0-9]{6}Z-[a-f0-9]{32}', args.backup_id):
        raise RuntimeError('Invalid backup identifier')
    if not re.fullmatch(r'[A-Za-z][A-Za-z0-9_-]{0,59}', args.drive_remote) or not re.fullmatch(r'[A-Za-z0-9_-]{10,120}', args.drive_folder_id):
        raise RuntimeError('Invalid Drive identifier')
    config = required_file('BT_BACKUP_DRIVE_CONFIG')
    keyring = os.environ.get('BT_RESTORE_GNUPGHOME')
    if not keyring or not Path(keyring).is_dir():
        raise RuntimeError('Secure decryption binding required')
    inspect_drive(config, args.drive_remote, args.drive_folder_id)
    os.umask(0o077)
    with tempfile.TemporaryDirectory(prefix='bt-drive-restore-') as directory:
        temp = Path(directory)
        remote = args.drive_remote + ':' + args.backup_id
        for filename in ['manifest.json', 'database.dump.gpg', 'roles.sql.gpg']:
            subprocess.run(['rclone', '--config', config, 'copyto', remote + '/' + filename,
                            str(temp / filename)], check=True, stdout=subprocess.DEVNULL,
                           stderr=subprocess.DEVNULL)
        if json.loads((temp/'manifest.json').read_text()).get('backup_id')!=args.backup_id:
            raise RuntimeError('Unexpected backup identity')
        result = restore(temp / 'manifest.json', keyring, args.image)
        result['encrypted_external_source_verified'] = True
        receipt = temp / 'restore-receipt.json'
        receipt.write_text(json.dumps(result, indent=2))
        upload_verify(config, remote, [receipt], temp)
        print(json.dumps(result))


if __name__ == '__main__':
    try:
        main()
    except Exception:
        print('CLOUD_RESTORE_NOT_VERIFIED: connection, scope or restoration requirements unmet')
        raise SystemExit(1)
