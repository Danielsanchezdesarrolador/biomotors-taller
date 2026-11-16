#!/usr/bin/env python3
"""Optional bridge for cloud UIs exposing secret TEXT bindings instead of mounted files.
No secret values in command arguments, logs or repository files.
"""
import os
from pathlib import Path
import subprocess
import sys
import tempfile

if len(sys.argv)<2 or sys.argv[1] not in ('export','verify'):
    raise SystemExit('Choose export or verify, followed by the runner public arguments')
with tempfile.TemporaryDirectory(prefix='bt-secure-bindings-') as folder:
    env=dict(os.environ)
    mappings={'BT_BACKUP_PGSERVICE_CONTENT':'BT_BACKUP_PGSERVICEFILE',
              'BT_BACKUP_PGPASS_CONTENT':'BT_BACKUP_PGPASSFILE',
              'BT_BACKUP_DRIVE_CONFIG_CONTENT':'BT_BACKUP_DRIVE_CONFIG',
              'BT_BACKUP_RECIPIENT_CONTENT':'BT_BACKUP_RECIPIENT_FILE'}
    for source,target in mappings.items():
        if env.get(source):
            path=Path(folder)/source
            descriptor=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
            with os.fdopen(descriptor,'w') as stream:stream.write(env.pop(source))
            env[target]=str(path)
    script='cloud_backup.py' if sys.argv[1]=='export' else 'verify_cloud_restore.py'
    result=subprocess.run([sys.executable,str(Path(__file__).with_name(script)),*sys.argv[2:]],env=env)
    raise SystemExit(result.returncode)
