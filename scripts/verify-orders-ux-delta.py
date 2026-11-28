"""RI-01/RI-02 only: installed browsers, synthetic loopback, no builds/SQL/unit suites."""
from pathlib import Path
import os, signal, subprocess, time, urllib.request
root = Path(__file__).resolve().parents[1]
out = Path(os.environ.get('OUTPUT_DIR', '/tmp/bt-orders-ux-delta'))
out.mkdir(parents=True, exist_ok=True)
engine = os.environ.get('BT_ORDERS_BROWSER', 'chromium')
if engine not in ['chromium', 'webkit']:
    raise SystemExit('Unsupported browser engine')
env = {**os.environ, 'CP04_BASE_URL': 'http://127.0.0.1:5193', 'BT_PILOT_BROWSER': engine, 'BT_ORDERS_BROWSER': engine}
for flag in ['AUTH_R1', 'CP03_PRIVATE', 'CP04_PRIVATE', 'CP05_PRIVATE', 'CP06_PRIVATE', 'CP05_DOCUMENTS']:
    env['VITE_BT_' + flag + '_ENABLED'] = 'true'
cases = [
    ('pilot-browser', 'scripts/verify-pilot-fix-browser.cjs', {}),
    ('mileage', 'scripts/verify-pilot-fix-mileage.cjs', {}),
    ('pdf-export', 'scripts/verify-cp04-pdf.cjs', {}),
    ('cp05-selector', 'scripts/verify-cp05-order-selector.cjs', {'CP05_WIDTHS': '390'}),
    ('coverage', 'scripts/verify-orders-coverage.cjs', {'BT_ORDERS_COVERAGE_CASES': '1440x1000,1366x650,390x950'}),
]
with (out / 'harness-server.log').open('w') as log:
    server = subprocess.Popen(['node', 'node_modules/vite/bin/vite.js', '--config', 'vite.harness.config.ts', '--host', '127.0.0.1', '--port', '5193', '--strictPort'], cwd=root, env=env, stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
    try:
        for _ in range(100):
            if server.poll() is not None:
                raise RuntimeError('Delta harness exited before ready')
            try:
                with urllib.request.urlopen(env['CP04_BASE_URL'], timeout=1) as response:
                    if response.status == 200:
                        break
            except OSError:
                time.sleep(.2)
        else:
            raise RuntimeError('Delta harness not ready')
        failures = []
        for name, script, overrides in cases:
            directory = out / name
            directory.mkdir(exist_ok=True)
            with (out / (name + '.log')).open('w') as output:
                result = subprocess.run(['node', script], cwd=root, env={**env, **overrides, 'OUTPUT_DIR': str(directory)}, stdout=output, stderr=subprocess.STDOUT)
            print(name, result.returncode, flush=True)
            if result.returncode:
                failures.append(name)
                print((out / (name + '.log')).read_text()[-3500:])
        if failures:
            raise SystemExit('Affected executors failed: ' + ', '.join(failures))
    finally:
        if server.poll() is None:
            os.killpg(server.pid, signal.SIGTERM)
        server.wait()
