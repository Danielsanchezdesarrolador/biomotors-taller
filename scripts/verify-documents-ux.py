"""Focused loopback browser fixtures; no installs, hosted calls or network-policy changes."""
from pathlib import Path
import os,subprocess,time,signal,urllib.request
root=Path(__file__).resolve().parents[1];out=Path(os.environ.get('OUTPUT_DIR','/tmp/bt-documents-browser'));out.mkdir(exist_ok=True)
env={**os.environ,'OUTPUT_DIR':str(out),'BT_DOCUMENTS_FIXTURES':str(out/'fixtures'),'NODE_PATH':os.environ.get('NODE_PATH',str(root/'node_modules'))}
def run(args,name):
 with open(out/(name+'.log'),'w') as log:r=subprocess.run(args,cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT)
 print(name,r.returncode,flush=True)
 if r.returncode:print((out/(name+'.log')).read_text()[-3500:]);raise SystemExit(r.returncode)
run(['node','--input-type=module','-e',"import {build} from 'rolldown';await build({input:'tests/documentsUxFixtures.ts',platform:'node',output:{file:process.argv[1],format:'es'}})",str(out/'fixtures-entry.mjs')],'fixture-build')
run(['node',str(out/'fixtures-entry.mjs'),str(out/'fixtures')],'fixture-create')
with open(out/'harness-server.log','w') as log:
 p=subprocess.Popen(['node','node_modules/vite/bin/vite.js','--config','vite.harness.config.ts','--host','127.0.0.1','--port','5253','--strictPort'],cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
 try:
  for _ in range(100):
   try:
    if urllib.request.urlopen('http://127.0.0.1:5253/documents-ux.html',timeout=1).status==200:break
   except Exception:time.sleep(.2)
  run(['node','scripts/verify-documents-ux.cjs'],'browser')
 finally:
  if p.poll() is None:os.killpg(p.pid,signal.SIGTERM)
  p.wait()
