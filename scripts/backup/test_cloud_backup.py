#!/usr/bin/env python3
"""Cloud synthetic export/encrypt/decrypt/restore rehearsal. NO hosted access/Drive claim."""
import json
import os
from pathlib import Path
import subprocess
import tempfile
import time
import uuid
from cloud_backup import encrypt_export, digest
from restore_isolated import restore, DOCKER

ROOT = Path(__file__).resolve().parents[2]
name = 'bt-backup-synthetic-' + uuid.uuid4().hex
os.umask(0o077)
try:
    subprocess.run(DOCKER + ['run', '--rm', '-d', '--network', 'none', '--name', name,
        '-e', 'POSTGRES_HOST_AUTH_METHOD=trust', 'postgres:17'], check=True,
        stdout=subprocess.DEVNULL)
    for _ in range(45):
        logs = subprocess.run(DOCKER + ['logs', name], capture_output=True).stdout
        if b'PostgreSQL init process complete' in logs:
            break
        time.sleep(1)
    prefix = DOCKER + ['exec', '-i', name]
    for file in ['scripts/security/bt-cp03-lab-bootstrap.sql',
                 'docs/sql/applied/20261112144646_bt_cp02_c_core_tenants_rls.sql',
                 'docs/sql/BT_CP03_P1_CUSTOMERS_VEHICLES_CANDIDATE.sql',
                 'docs/sql/BT_CP04_ORDERS_INSPECTIONS_CANDIDATE.sql',
                 'scripts/security/bt-cp05-lab-fixtures.sql']:
        subprocess.run(prefix + ['psql', '-X', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres'],
                       input=(ROOT / file).read_bytes(), check=True, stdout=subprocess.DEVNULL)
    with tempfile.TemporaryDirectory(prefix='bt-synthetic-encrypted-') as directory:
        temp = Path(directory)
        keyring = temp / 'gnupg'
        keyring.mkdir(mode=0o700)
        subprocess.run(['gpg', '--homedir', str(keyring), '--batch', '--passphrase', '',
                        '--quick-generate-key', 'Synthetic cloud QA <qa@invalid.test>',
                        'rsa2048', 'encrypt', '1d'], check=True, stdout=subprocess.DEVNULL,
                       stderr=subprocess.DEVNULL)
        listing = subprocess.run(['gpg', '--homedir', str(keyring), '--batch',
                                 '--with-colons', '--list-keys'], capture_output=True, check=True)
        fingerprint = next(line.split(':')[9] for line in listing.stdout.decode().splitlines()
                           if line.startswith('fpr:'))
        entries = []
        for filename, command in [
            ('database.dump.gpg', prefix + ['pg_dump', '-U', 'postgres', '-Fc', 'postgres']),
            ('roles.sql.gpg', prefix + ['pg_dumpall', '-U', 'postgres', '--roles-only',
                                       '--no-role-passwords'])]:
            path = temp / filename
            encrypt_export(command, path, fingerprint, str(keyring))
            entries.append({'name': filename, 'sha256': digest(path)})
        manifest = temp / 'manifest.json'
        manifest.write_text(json.dumps({'project_ref': 'suxcqqnmcjoezfxltoms',
            'backup_id': 'SYNTHETIC_CLOUD_ONLY', 'files': entries}))
        result = restore(manifest, str(keyring))
        assert result['database_checks']['auth_users'] == 4
        assert result['database_checks']['orders'] == 1
        print(json.dumps(result))
finally:
    subprocess.run(DOCKER + ['rm', '-f', name], stdout=subprocess.DEVNULL,
                   stderr=subprocess.DEVNULL)
