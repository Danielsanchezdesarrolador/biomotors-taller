# Focused isolated UI runner for local Chromium or official CI WebKit; no downloads here.
from pathlib import Path
import os,re,subprocess,time,urllib.request,signal
root=Path(__file__).resolve().parent.parent;out=Path(os.environ.get('BT_PILOT_EVIDENCE_DIR','/tmp/bt-pilot-fix-evidence'));out.mkdir(exist_ok=True)
engine=os.environ.get('BT_PILOT_BROWSER','chromium')
if engine not in ['chromium','webkit']:raise SystemExit('Unsupported browser engine')
env={k:v for k,v in os.environ.items() if not k.startswith('VITE_')}
for f in list((root/'src').rglob('*.ts'))+list((root/'src').rglob('*.tsx'))+[root/'vite.config.ts']:
 for n in re.findall(r'VITE_BT_[A-Z0-9_]+',f.read_text()):env[n]='false'
env.update(VITE_SUPABASE_URL='https://suxcqqnmcjoezfxltoms.supabase.co',VITE_SUPABASE_PUBLISHABLE_KEY='sb_publishable_synthetic_pilot',VITE_SUPABASE_ANON_KEY='',NODE_PATH=os.environ.get('NODE_PATH',str(root/'node_modules')),OUTPUT_DIR=str(out))
def run(args,name):
 with open(out/(name+'.log'),'w') as log:p=subprocess.run(args,cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT)
 print(name,p.returncode,flush=True)
 if p.returncode:print((out/(name+'.log')).read_text()[-3500:]);raise SystemExit(p.returncode)
def serve(args,port,action):
 with open(out/('server-'+str(port)+'.log'),'w') as log:
  p=subprocess.Popen(args,cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
  try:
   for _ in range(100):
    try:
     if urllib.request.urlopen('http://127.0.0.1:'+str(port),timeout=1).status==200:break
    except Exception:time.sleep(.2)
   action()
  finally:
   if p.poll() is None:os.killpg(p.pid,signal.SIGTERM)
   p.wait()
run(['npm','run','typecheck'],'typecheck')
run(['node','node_modules/vite/bin/vite.js','build'],'public-build')
run(['node','scripts/verify-official-bundle.mjs'],'public-boundary')
for n in ['AUTH_R1','CP03_PRIVATE','CP04_PRIVATE','CP05_PRIVATE']:env['VITE_BT_'+n+'_ENABLED']='true'
serve(['node','node_modules/vite/bin/vite.js','--config','vite.harness.config.ts','--host','127.0.0.1','--port','5179','--strictPort'],5179,lambda:(run(['node','scripts/verify-pilot-fix-browser.cjs'],'inspection-quote-browser'),run(['node','scripts/verify-pilot-fix-mileage.cjs'],'mileage-save-browser')))
for n in ['CREATOR_PRIVATE','PLAN04_PRIVATE','PLAN04_WORKSHOPS']:env['VITE_BT_'+n+'_ENABLED']='true'
run(['node','node_modules/vite/bin/vite.js','build'],'private-build')
run(['node','scripts/verify-official-bundle.mjs'],'private-boundary')
serve(['node','node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','5241','--strictPort'],5241,lambda:run(['node','scripts/verify-pilot-fix-account.cjs'],'account-browser'))
