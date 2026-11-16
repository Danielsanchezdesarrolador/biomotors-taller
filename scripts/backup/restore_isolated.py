#!/usr/bin/env python3
"""Decrypt -> restore ONLY into a newly created, network-none cloud Docker container.
Never accepts a hosted database URL or restores into an existing container.
"""
import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import time
import uuid
from cloud_backup import digest

DOCKER = ['docker', '--host=unix:///var/run/docker.sock']


def decrypt_into(path, command, gnupg):
    decrypt=['gpg','--homedir',gnupg,'--batch']
    passfile=os.environ.get('BT_RESTORE_GPG_PASSPHRASE_FILE')
    if passfile:
        from cloud_backup import required_file
        protected=required_file('BT_RESTORE_GPG_PASSPHRASE_FILE')
        if Path(protected).stat().st_mode & 0o077:raise RuntimeError('Owner-only passphrase binding required')
        decrypt+=['--pinentry-mode','loopback','--passphrase-file',protected]
    process = subprocess.Popen(decrypt+['--decrypt',str(path)],
                               stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    try:
        restored = subprocess.run(command, stdin=process.stdout, stdout=subprocess.DEVNULL,
                                  stderr=subprocess.DEVNULL)
        process.stdout.close()
        if process.wait() or restored.returncode:
            raise RuntimeError('Decryption/restore failed; restore is NOT verified')
    finally:
        if process.poll() is None:
            process.terminate()
            process.wait()


def restore(manifest_path, gnupg, image='postgres:17'):
    if not re.fullmatch(r'(postgres:17(?:\.\d+)?|supabase/postgres:[0-9.]+)', image):
        raise RuntimeError('Approved matching PostgreSQL image required')
    keyring=Path(gnupg).resolve()
    checkout=Path(__file__).resolve().parents[2]
    if not keyring.is_dir() or checkout==keyring or checkout in keyring.parents or keyring.stat().st_mode & 0o077:
        raise RuntimeError('Owner-only decryption binding outside the repository required')
    manifest = json.loads(manifest_path.read_text())
    if manifest.get('project_ref') != 'suxcqqnmcjoezfxltoms':
        raise RuntimeError('Unexpected backup project')
    files = {row['name']: row for row in manifest['files']}
    for name in ['database.dump.gpg', 'roles.sql.gpg']:
        row = files[name]
        if digest(manifest_path.parent / name) != row['sha256']:
            raise RuntimeError('Encrypted backup hash mismatch')
    tag = uuid.uuid4().hex
    name, owner = 'bt-restore-' + tag, 'restore_' + tag
    try:
        subprocess.run(DOCKER + ['run', '--rm', '-d', '--network', 'none', '--name', name,
            '--tmpfs', '/var/lib/postgresql/data:rw,nosuid,nodev,mode=700',
            '-e', 'POSTGRES_HOST_AUTH_METHOD=trust', '-e', 'POSTGRES_USER=' + owner,
            '-e', 'POSTGRES_DB=postgres', image], check=True, stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL)
        ready = False
        for _ in range(45):
            logs = subprocess.run(DOCKER + ['logs', name], capture_output=True).stdout
            if b'PostgreSQL init process complete' in logs:
                probe = subprocess.run(DOCKER + ['exec', name, 'pg_isready', '-U', owner,
                                                 '-d', 'postgres'], capture_output=True)
                if probe.returncode == 0:
                    ready = True
                    break
            time.sleep(1)
        if not ready:
            raise RuntimeError('Isolated PostgreSQL did not initialize')
        prefix = DOCKER + ['exec', '-i', name]
        decrypt_into(manifest_path.parent / 'roles.sql.gpg', prefix +
                     ['psql', '-X', '-v', 'ON_ERROR_STOP=1', '-U', owner, '-d', 'postgres'], gnupg)
        decrypt_into(manifest_path.parent / 'database.dump.gpg', prefix +
                     ['pg_restore', '--exit-on-error', '-U', owner, '-d', 'postgres'], gnupg)
        sql = Path(__file__).with_name('verify_restore.sql').read_bytes()
        result = subprocess.run(prefix + ['psql', '-X', '-q', '-A', '-t', '-v',
                                'ON_ERROR_STOP=1', '-U', owner, '-d', 'postgres'],
                                input=sql, capture_output=True)
        if result.returncode:
            raise RuntimeError('Restored database failed RLS/FK/grant checks')
        counts = json.loads(result.stdout.decode().strip().splitlines()[-1])
        return {'backup_id': manifest.get('backup_id'), 'isolated_restore_verified': True,
                'network': 'none', 'database_checks': counts,
                'external_storage_verified_by_this_command': False,
                'full_project_backup': False}
    finally:
        subprocess.run(DOCKER + ['rm', '-f', name], stdout=subprocess.DEVNULL,
                       stderr=subprocess.DEVNULL)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--manifest', required=True, type=Path)
    parser.add_argument('--image', default='postgres:17')
    args = parser.parse_args()
    try:
        gnupg = os.environ.get('BT_RESTORE_GNUPGHOME')
        if not gnupg or not Path(gnupg).is_dir():
            raise RuntimeError('Missing secure decryption key binding BT_RESTORE_GNUPGHOME')
        print(json.dumps(restore(args.manifest.resolve(), gnupg, args.image)))
    except Exception:
        print('RESTORE_NOT_VERIFIED: offline restoration failed; no hosted operation attempted')
        raise SystemExit(1)
