#!/usr/bin/env python3
"""GHA-only preparation/log boundary; reuse the existing encrypted export bridge.

Never prints provider errors, key identities, configurations or customer content.
No authenticated operation occurs until all local preflight checks pass.
"""
import configparser
import io
import json
import os
from pathlib import Path
import re
import signal
import ssl
import subprocess
import sys
import tempfile
from drive_destination import FOLDER_ID as FOLDER, validate_config

PROJECT = 'suxcqqnmcjoezfxltoms'
HOST = 'aws-0-sa-east-1.pooler.supabase.com'
REMOTE = 'bytetorque_backup'
SECRET_NAMES = (
    'BT_BACKUP_PGPASS_CONTENT', 'BT_BACKUP_DRIVE_CONFIG_CONTENT',
    'BT_BACKUP_RECIPIENT_CONTENT', 'BT_BACKUP_RECIPIENT_FINGERPRINT',
    'BT_BACKUP_PG_CA_PEM',
)


def validate_bindings(values):
    if any(not values.get(name, '').strip() for name in SECRET_NAMES):
        raise ValueError('missing binding')
    fingerprint = values['BT_BACKUP_RECIPIENT_FINGERPRINT'].strip().upper()
    if not re.fullmatch(r'[A-F0-9]{40}|[A-F0-9]{64}', fingerprint):
        raise ValueError('invalid fingerprint')
    public = values['BT_BACKUP_RECIPIENT_CONTENT'].strip()
    if (not public.startswith('-----BEGIN PGP PUBLIC KEY BLOCK-----') or
            not public.endswith('-----END PGP PUBLIC KEY BLOCK-----') or
            'PRIVATE KEY' in public or 'SECRET KEY' in public):
        raise ValueError('public key only')
    ca = values['BT_BACKUP_PG_CA_PEM']
    if 'PRIVATE KEY' in ca or '-----BEGIN CERTIFICATE-----' not in ca:
        raise ValueError('CA certificates only')
    ssl.create_default_context(cadata=ca)  # Parse CA locally; no network connection.
    password = values['BT_BACKUP_PGPASS_CONTENT'].strip('\r\n')
    prefix = f'{HOST}:5432:postgres:postgres.{PROJECT}:'
    if not password.startswith(prefix) or not password[len(prefix):] or '\n' in password or '\r' in password:
        raise ValueError('one exact project-bound pgpass entry required')
    validate_config(values['BT_BACKUP_DRIVE_CONFIG_CONTENT'])
    return fingerprint


def write_private(path, content):
    descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(descriptor, 'w') as stream:
        stream.write(content)


def check_public_key(folder, public, fingerprint):
    home = folder / 'public-key-check'
    home.mkdir(mode=0o700)
    result = subprocess.run(
        ['gpg', '--homedir', str(home), '--batch', '--with-colons',
         '--import-options', 'show-only', '--dry-run', '--import'],
        input=public, text=True, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
        timeout=15, check=True,
    )
    records = [line.split(':') for line in result.stdout.splitlines()]
    if any(row[0] in ('sec', 'ssb') for row in records):
        raise ValueError('public key only')
    if sum(row[0] == 'pub' for row in records) != 1:
        raise ValueError('one recipient required')
    actual = next((row[9] for row in records if row[0] == 'fpr'), None)
    if actual != fingerprint:
        raise ValueError('recipient mismatch')


def run_bridge(command, env):
    process = subprocess.Popen(command, env=env, stdout=subprocess.PIPE,
                               stderr=subprocess.DEVNULL, text=True, start_new_session=True)
    try:
        output, _ = process.communicate(timeout=780)
    except BaseException:
        os.killpg(process.pid, signal.SIGKILL)
        process.communicate()
        raise
    if process.returncode:
        raise RuntimeError('export failed')
    return output


def safe_receipt(output):
    receipt = json.loads(output)
    if (not re.fullmatch(r'bytetorque-[0-9]{8}T[0-9]{6}Z-[a-f0-9]{32}', receipt.get('backup_id', '')) or
            receipt.get('encrypted_external_readback_verified') is not True or
            receipt.get('restoration_verified') is not False or
            receipt.get('full_project_backup') is not False):
        raise ValueError('unexpected export receipt')
    # Allowlist fields: even unexpected extra provider output cannot reach GHA logs.
    return {name: receipt[name] for name in (
        'backup_id', 'encrypted_external_readback_verified',
        'restoration_verified', 'full_project_backup',
    )}


def main():
    if (os.environ.get('GITHUB_ACTIONS') != 'true' or
            os.environ.get('GITHUB_EVENT_NAME') != 'workflow_dispatch' or
            os.environ.get('GITHUB_REF') != 'refs/heads/main' or
            os.environ.get('GITHUB_REPOSITORY') != 'Danielsanchezdesarrolador/biomotors-taller'):
        raise ValueError('manual main execution only')
    values = {name: os.environ.get(name, '') for name in SECRET_NAMES}
    fingerprint = validate_bindings(values)
    os.umask(0o077)
    with tempfile.TemporaryDirectory(prefix='bt-gha-export-') as directory:
        folder = Path(directory).resolve()
        checkout = Path(__file__).resolve().parents[2]
        if checkout == folder or checkout in folder.parents:
            raise ValueError('temporary files must be outside checkout')
        check_public_key(folder, values['BT_BACKUP_RECIPIENT_CONTENT'], fingerprint)
        ca = folder / 'postgres-ca.pem'
        write_private(ca, values['BT_BACKUP_PG_CA_PEM'])
        service = configparser.ConfigParser(interpolation=None)
        service[REMOTE] = {'host': HOST, 'port': '5432', 'dbname': 'postgres',
                           'user': 'postgres.' + PROJECT, 'sslmode': 'verify-full',
                           'sslrootcert': str(ca)}
        buffer = io.StringIO()
        service.write(buffer)
        # Discard unrelated libpq/rclone bindings and all original backup secrets.
        env = {key: value for key, value in os.environ.items()
               if not key.startswith(('PG', 'RCLONE_', 'BT_BACKUP_', 'BT_RESTORE_'))}
        env.update({name: values[name] for name in (
            'BT_BACKUP_PGPASS_CONTENT', 'BT_BACKUP_DRIVE_CONFIG_CONTENT',
            'BT_BACKUP_RECIPIENT_CONTENT',
        )})
        env.update(BT_BACKUP_PGSERVICE_CONTENT=buffer.getvalue(), TMPDIR=str(folder))
        command = [sys.executable, '-B', str(Path(__file__).with_name('run_with_bindings.py')),
                   'export', '--project-ref', PROJECT, '--service', REMOTE,
                   '--drive-remote', REMOTE, '--drive-folder-id', FOLDER,
                   '--recipient-fingerprint', fingerprint]
        receipt = safe_receipt(run_bridge(command, env))
    print(json.dumps(receipt))


if __name__ == '__main__':
    try:
        main()
    except (Exception, KeyboardInterrupt):
        # Deliberately omit exception text/tracebacks and raw subprocess streams.
        print('BACKUP_NOT_COMPLETE: configuration, TLS, encryption or external verification failed.')
        raise SystemExit(1)
