"""Only the two pending contracts: real PostgreSQL17 + current HTTP/renewal code.
No previous 34-case suite, hosted migrations, package installs or networked database.
"""
from pathlib import Path
import subprocess,os,time,signal
root=Path(__file__).resolve().parents[2]
out=Path(os.environ.get('BT_HARDENING_DELTA_EVIDENCE','/tmp/bt-hardening-session-evidence'));out.mkdir(exist_ok=True)
lab='bt-hardening-session-'+str(os.getpid())
def run(args,**kw):return subprocess.run(args,cwd=root,check=True,text=True,capture_output=True,**kw)
run(['docker','image','inspect','postgres:17'])
run(['docker','run','--rm','-d','--network','none','--name',lab,'-e','POSTGRES_HOST_AUTH_METHOD=trust','-e','POSTGRES_DB=delta','postgres:17'])
try:
 for _ in range(150):
  try:
   if 'PostgreSQL init process complete' in run(['docker','logs',lab]).stdout and run(['docker','exec',lab,'psql','-X','-qAt','-U','postgres','-d','delta','-c','SELECT 1']).stdout.strip()=='1':break
  except subprocess.CalledProcessError:pass
  time.sleep(.2)
 else:raise RuntimeError('ISOLATED_POSTGRES_NOT_READY')
 entry=out/'hardening-session-entry.mjs'
 build="import {build} from 'rolldown';await build({input:'tests/hardeningSessionLab.ts',platform:'node',external:['pdf-lib','@pdf-lib/fontkit','@supabase/supabase-js','react','react-dom/server'],output:{file:process.argv[1],format:'es'}})"
 run(['node','--input-type=module','-e',build,str(entry)])
 # The output lives outside the repo: resolve local dependencies explicitly, without installing.
 alias=out/'node_modules'
 if not alias.exists():alias.symlink_to(root/'node_modules',target_is_directory=True)
 env={**os.environ,'BT_HARDENING_DELTA_LAB':lab,'BT_HARDENING_DELTA_EVIDENCE':str(out)}
 result=subprocess.run(['node',str(entry)],cwd=root,env=env)
 if result.returncode:raise SystemExit(result.returncode)
finally:subprocess.run(['docker','rm','-f',lab],capture_output=True)
