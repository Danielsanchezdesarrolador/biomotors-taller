# No browser installation, hosted changes or environment-policy edits.
from pathlib import Path
import os,re,subprocess,time,urllib.request,signal
root=Path(__file__).resolve().parent.parent;out=Path(os.environ.get('BT_COMMERCIAL_EVIDENCE_DIR','/tmp/bt-commercial-evidence'));out.mkdir(exist_ok=True)
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





for n in ['AUTH_R1','CP03_PRIVATE','CP04_PRIVATE','CP05_PRIVATE','CREATOR_PRIVATE','PLAN04_PRIVATE','PLAN04_WORKSHOPS','CP06_PRIVATE','FLOW_LIVE_02','FINAL_ARCHIVE','CP05_DOCUMENTS','RECORDS_PRIVATE']:env['VITE_BT_'+n+'_ENABLED']='true'
env['VITE_BT_AGENDA_ENABLED']='false' if os.environ.get('BT_COMMERCIAL_AGENDA')=='off' else 'true'
if os.environ.get('BT_COMMERCIAL_SKIP_BUILD')!='true':
 run(['node','node_modules/vite/bin/vite.js','build'],'private-build')
 run(['node','scripts/verify-official-bundle.mjs'],'private-boundary')
def scenarios():
 run(['node','scripts/verify-workshop-commercial.cjs'],'commercial-browser-'+os.environ.get('BT_COMMERCIAL_AGENDA','on'))
 if os.environ.get('BT_COMMERCIAL_AGENDA')!='off':run(['node','scripts/verify-commercial-ownership.cjs'],'ownership-browser')
serve(['node','node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','5241','--strictPort'],5241,scenarios)
