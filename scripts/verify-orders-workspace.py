"""Loopback-only Orders UX runner. Uses installed tools; never installs or contacts hosted data."""
from pathlib import Path
import os, signal, subprocess, time, urllib.request
root = Path(__file__).resolve().parents[1]
out = Path(os.environ.get('OUTPUT_DIR', '/tmp/bt-orders-browser'))
out.mkdir(parents=True, exist_ok=True)
env = {**os.environ, 'OUTPUT_DIR': str(out), 'CP04_BASE_URL': 'http://127.0.0.1:5187'}
for name in ['AUTH_R1', 'CP03_PRIVATE', 'CP04_PRIVATE', 'CP05_PRIVATE', 'CP06_PRIVATE', 'CP05_DOCUMENTS']:
    env['VITE_BT_' + name + '_ENABLED'] = 'true'
with (out / 'harness-server.log').open('w') as log:
    server = subprocess.Popen(['node', 'node_modules/vite/bin/vite.js', '--config', 'vite.harness.config.ts', '--host', '127.0.0.1', '--port', '5187', '--strictPort'], cwd=root, env=env, stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
    try:
        for _ in range(100):
            if server.poll() is not None:
                raise RuntimeError('Orders harness exited before ready')
            try:
                with urllib.request.urlopen(env['CP04_BASE_URL'], timeout=1) as response:
                    if response.status == 200:
                        break
            except OSError:
                time.sleep(.2)
        else:
            raise RuntimeError('Orders harness not ready')
        with (out / 'browser.log').open('w') as output:
            result = subprocess.run(['node', 'scripts/verify-orders-workspace.cjs'], cwd=root, env=env, stdout=output, stderr=subprocess.STDOUT)
        if result.returncode:
            print((out / 'browser.log').read_text()[-4000:])
        raise SystemExit(result.returncode)
    finally:
        if server.poll() is None:
            os.killpg(server.pid, signal.SIGTERM)
        server.wait()
