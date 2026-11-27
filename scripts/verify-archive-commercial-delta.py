from pathlib import Path
import subprocess,os,signal,urllib.request,time
root=Path(__file__).resolve().parents[1];out=Path(os.environ.get('OUTPUT_DIR','/tmp/bt-plans-archive-delta'));out.mkdir(exist_ok=True)
env={**os.environ,'NODE_PATH':os.environ.get('NODE_PATH',str(root/'node_modules')),'OUTPUT_DIR':str(out)}
with open(out/'harness-server.log','w') as log:
 p=subprocess.Popen(['node','node_modules/vite/bin/vite.js','--config','vite.harness.config.ts','--host','127.0.0.1','--port','5252','--strictPort'],cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
 try:
  for _ in range(100):
   try:
    if urllib.request.urlopen('http://127.0.0.1:5252/archive-commercial-delta.html',timeout=1).status==200:break
   except Exception:time.sleep(.2)
  with open(out/'browser.log','w') as output:r=subprocess.run(['node','scripts/verify-archive-commercial-delta.cjs'],cwd=root,env=env,stdout=output,stderr=subprocess.STDOUT)
  print('BROWSER_EXIT',r.returncode)
  if r.returncode:print((out/'browser.log').read_text()[-2500:]);raise SystemExit(r.returncode)
 finally:
  if p.poll() is None:os.killpg(p.pid,signal.SIGTERM)
  p.wait()
