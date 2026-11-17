#!/usr/bin/env python3
"""Cloud-only encrypted PostgreSQL export -> existing PRIVATE Google Drive folder.
No hosted writes, schema changes, account creation or secret provisioning.
Secrets/configuration are mounted outside the checkout by the cloud environment.
"""
import argparse
import configparser
import hashlib
import json
import os
import re
from pathlib import Path
import shutil
import subprocess
import tempfile
import uuid
from datetime import datetime, timezone
from drive_destination import PrivateDrive, FOLDER_ID, REMOTE
from drive_errors import DriveFailure
from postgres_preflight import ProbeFailure, verify_connection

PROJECT = 'suxcqqnmcjoezfxltoms'
# Only approved fixed labels; never publish a provider error or secret value.
_STAGE = 'EXPORT_PREFLIGHT'


def digest(path):
    h = hashlib.sha256()
    with open(path, 'rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def required_file(name):
    value = os.environ.get(name)
    if not value or not Path(value).is_file():
        raise RuntimeError('Missing secure file binding: ' + name)
    path = Path(value).resolve()
    checkout = Path(__file__).resolve().parents[2]
    if checkout == path or checkout in path.parents:
        raise RuntimeError('Secret/configuration files must be outside the repository')
    return str(path)


def encrypt_export(command, output, recipient, gnupghome, env=None):
    """Plaintext only flows in pipes, never into a workspace dump file or logs."""
    with tempfile.TemporaryFile() as errors:
        producer = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=errors, env=env)
        try:
            encrypted = subprocess.run(['gpg', '--homedir', gnupghome, '--batch', '--yes',
                                        '--trust-model', 'always', '--encrypt', '--recipient',
                                        recipient, '--output', str(output)],
                                       stdin=producer.stdout, stdout=subprocess.DEVNULL,
                                       stderr=errors)
            producer.stdout.close()
            source_code = producer.wait()
            if source_code or encrypted.returncode or not output.is_file():
                output.unlink(missing_ok=True)
                # Never echo pg_dump/gpg stderr, which can include connection details.
                raise RuntimeError('Export/encryption failed; no verified backup produced')
        finally:
            if producer.poll() is None:
                producer.terminate()
                producer.wait()


def inspect_drive(config_path, remote, folder):
    return PrivateDrive(config_path, remote, folder)


def upload_verify(destination, directory, paths, temp):
    destination.upload_verify(directory, paths, temp)


def main():
    global _STAGE
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project-ref', required=True)
    parser.add_argument('--service', default='bytetorque_backup')
    parser.add_argument('--drive-remote', required=True)
    parser.add_argument('--drive-folder-id', required=True)
    parser.add_argument('--recipient-fingerprint', required=True)
    args = parser.parse_args()
    if not re.fullmatch(r'[A-Za-z][A-Za-z0-9_-]{0,59}',args.drive_remote) or not re.fullmatch(r'[A-Za-z0-9_-]{10,120}',args.drive_folder_id) or not re.fullmatch(r'[A-Fa-f0-9]{40}|[A-Fa-f0-9]{64}',args.recipient_fingerprint):
        raise RuntimeError('Invalid remote/folder/full recipient fingerprint')
    if args.drive_remote != REMOTE or args.drive_folder_id != FOLDER_ID:
        raise RuntimeError('Unapproved Drive destination')
    if args.project_ref != PROJECT:
        raise RuntimeError('Unexpected Supabase project')
    for executable in ['pg_dump', 'pg_dumpall', 'psql', 'gpg', 'rclone']:
        if not shutil.which(executable):
            raise RuntimeError('Missing cloud runner executable: ' + executable)
    service = required_file('BT_BACKUP_PGSERVICEFILE')
    password = required_file('BT_BACKUP_PGPASSFILE')
    drive = required_file('BT_BACKUP_DRIVE_CONFIG')
    recipient = required_file('BT_BACKUP_RECIPIENT_FILE')
    config = configparser.ConfigParser(interpolation=None)
    config.read(service)
    section=config[args.service] if args.service in config else {}
    host,user=section.get('host',''),section.get('user','')
    official_host=host=='db.'+PROJECT+'.supabase.co' or (host.endswith('.pooler.supabase.com') and user=='postgres.'+PROJECT)
    if (not official_host or section.get('port','5432')!='5432' or section.get('dbname')!='postgres' or section.get('password') or section.get('sslmode')!='verify-full' or not section.get('sslrootcert')):
        raise RuntimeError('Official project-bound TLS verify-full service required')
    if (Path(password).stat().st_mode|Path(drive).stat().st_mode) & 0o077:
        raise RuntimeError('PGPASS file must be owner-only (0600)')
    pg_env = dict(os.environ, PGSERVICEFILE=service, PGPASSFILE=password,
                  PGSSLMODE='verify-full', PGCONNECT_TIMEOUT='20',
                  PGOPTIONS='-c default_transaction_read_only=on')
    # libpq verify-full validates the GitHub-to-pooler TLS session.
    # pg_stat_ssl can reflect the separate pooler-to-Postgres connection.
    _STAGE = 'POSTGRES_TLS_CONNECT'
    try:
        verify_connection(args.service, pg_env)
    except ProbeFailure as error:
        _STAGE = error.code
        raise
    _STAGE = 'DRIVE_ACCESS_CHECK'
    destination = inspect_drive(drive, args.drive_remote, args.drive_folder_id)
    os.umask(0o077)
    name = 'bytetorque-' + datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ-') + uuid.uuid4().hex
    with tempfile.TemporaryDirectory(prefix='bt-encrypted-backup-') as directory:
        temp = Path(directory)
        gnupg = temp / 'gnupg'
        gnupg.mkdir(mode=0o700)
        _STAGE = 'GPG_IMPORT_PUBLIC'
        subprocess.run(['gpg', '--homedir', str(gnupg), '--batch', '--import', recipient],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        commands = [
            ('database.dump.gpg', ['pg_dump', '--dbname=service=' + args.service, '--format=custom']),
            ('roles.sql.gpg', ['pg_dumpall', '--dbname=service=' + args.service,
                               '--roles-only', '--no-role-passwords'])]
        paths = []
        for filename, command in commands:
            _STAGE = 'PG_DUMP_ENCRYPT' if filename == 'database.dump.gpg' else 'ROLES_DUMP_ENCRYPT'
            path = temp / filename
            encrypt_export(command, path, args.recipient_fingerprint, str(gnupg), pg_env)
            paths.append(path)
        _STAGE = 'MANIFEST_WRITE'
        manifest = temp / 'manifest.json'
        manifest.write_text(json.dumps({'project_ref': PROJECT, 'backup_id': name,
            'scope': 'whole PostgreSQL database including auth/storage metadata and roles without role passwords',
            'excluded': ['Storage object bytes', 'Edge source/config/secrets', 'provider project settings'],
            'restoration_verified': False,
            'drive_folder_id': FOLDER_ID,
            'files': [{'name': p.name, 'sha256': digest(p), 'bytes': p.stat().st_size} for p in paths]}, indent=2))
        paths.append(manifest)
        _STAGE = 'DRIVE_UPLOAD_VERIFY'
        directory = destination.backup_directory(name, create=True)
        upload_verify(destination, directory, paths, temp)
        print(json.dumps({'backup_id': name, 'encrypted_external_readback_verified': True,
                          'restoration_verified': False,
                          'full_project_backup': False}))


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        # In the GitHub export, emit ONLY a compile-time fixed stage label.
        # Never include exception text, HTTP responses or SQL/GPG output.
        if os.environ.get('BT_BACKUP_STAGE_DIAGNOSTICS') == '1':
            print('BACKUP_STAGE_FAILURE:' + (error.code if isinstance(error, DriveFailure) else _STAGE))
        else:
            print('BACKUP_NOT_COMPLETE: ' + (str(error) if isinstance(error, RuntimeError)
                                            else 'Cloud export/transfer failed; inspect secure runner privately'))
        raise SystemExit(1)
