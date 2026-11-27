"""Public/private build and feature boundaries, deferred features OFF; no hosted state changes."""
from pathlib import Path
import os,subprocess,re,shutil
root=Path(__file__).resolve().parents[1];out=Path(os.environ.get('BT_DOCUMENTS_BUILD_EVIDENCE','/tmp/bt-documents-build'));out.mkdir(exist_ok=True)
env={k:v for k,v in os.environ.items() if not k.startswith('VITE_')}
for p in list((root/'src').rglob('*.ts'))+list((root/'src').rglob('*.tsx'))+[root/'vite.config.ts']:
 for name in re.findall(r'VITE_BT_[A-Z0-9_]+',p.read_text()):env[name]='false'
env.update(VITE_SUPABASE_URL='https://suxcqqnmcjoezfxltoms.supabase.co',VITE_SUPABASE_PUBLISHABLE_KEY='sb_publishable_synthetic_documents',VITE_SUPABASE_ANON_KEY='')
def run(args,name):
 with open(out/(name+'.log'),'w') as f:r=subprocess.run(args,cwd=root,env=env,stdout=f,stderr=subprocess.STDOUT)
 print(name,r.returncode,flush=True)
 if r.returncode:print((out/(name+'.log')).read_text()[-3000:]);raise SystemExit(r.returncode)
run(['node','scripts/generate-pwa-icons.mjs'],'icons')
for mode in ['public','private']:
 if mode=='private':
  for name in ['AUTH_R1','CP03_PRIVATE','CP04_PRIVATE','CP05_PRIVATE','CREATOR_PRIVATE','PLAN04_PRIVATE','PLAN04_WORKSHOPS','CP06_PRIVATE','FLOW_LIVE_02','FINAL_ARCHIVE','CP05_DOCUMENTS','RECORDS_PRIVATE']:env['VITE_BT_'+name+'_ENABLED']='true'
 run(['node','node_modules/vite/bin/vite.js','build'],mode+'-build')
 run(['node','scripts/verify-official-bundle.mjs'],mode+'-boundary')
 shutil.copy2(root/'dist/.vite/public-modules.json',out/(mode+'-modules.json'))
