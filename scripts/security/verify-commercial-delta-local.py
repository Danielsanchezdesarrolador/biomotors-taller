"""Focused real PostgreSQL test of the UNCHANGED finish/cache contract; no historic suites.
Only the two approved function bodies and their plan/capability helpers are loaded, with
minimal synthetic schema/ledger fixtures. This is not a production migration or RLS audit.
"""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import subprocess,os,time,json,hashlib
root=Path(__file__).resolve().parents[2]
out=Path(os.environ.get('BT_COMMERCIAL_DELTA_EVIDENCE','/tmp/bt-commercial-delta-evidence'));out.mkdir(exist_ok=True)
name='bt-commercial-delta-'+str(os.getpid())
def run(args,**kw):return subprocess.run(args,check=True,capture_output=True,text=True,**kw)
run(['docker','image','inspect','postgres:17'])
run(['docker','run','--rm','-d','--network','none','--name',name,'-e','POSTGRES_HOST_AUTH_METHOD=trust','-e','POSTGRES_DB=delta','postgres:17'])
results=[]
def sql(query,role=None):
 p=run(['docker','exec','-i',name,'psql','-X','-qAt','-v','ON_ERROR_STOP=1','-U','postgres','-d','delta'],input=('SET ROLE '+role+';\n' if role else '')+query)
 return p.stdout.strip().split('\n')[-1] if p.stdout.strip() else ''
def passed(label):results.append({'name':label,'status':'PASS'});print('PASS',label,flush=True)
def denied(query,role='service_role'):
 try:sql(query,role)
 except subprocess.CalledProcessError as e:assert 'permission denied' in e.stderr or 'DENIED' in e.stderr or 'REVOKED' in e.stderr or 'PLAN_' in e.stderr or 'EXPIRED' in e.stderr,e.stderr
 else:raise AssertionError('Expected fail-closed rejection')
def quote(text):return "'"+str(text).replace("'","''")+"'"
uid='00000000-0000-4000-8000-000000000002';wid='00000000-0000-4000-8000-000000000001';sid='00000000-0000-4000-8000-000000000003';request='00000000-0000-4000-8000-000000000004'
try:
 for _ in range(150):
  try:
   if 'PostgreSQL init process complete' in run(['docker','logs',name]).stdout and sql('SELECT 1;')=='1':break
  except subprocess.CalledProcessError:pass
  time.sleep(.2)
 else:raise RuntimeError('ISOLATED_POSTGRES_NOT_READY')
 source=(root/'docs/sql/BT_WORKSHOP_COMMERCIAL_01_CANDIDATE.sql').read_text()
 def function(name):
  start=source.index('CREATE FUNCTION '+name+'(');end=source.index('$$;',start)+3;return source[start:end]
 start=source.index('CREATE TABLE bt_commercial_private.consumption (');table=source[start:source.index('\n);',start)+3]
 sql('''CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;
 CREATE SCHEMA auth;CREATE SCHEMA bt_platform_private;CREATE SCHEMA bt_commercial_private;
 CREATE TABLE auth.users(id uuid PRIMARY KEY,email_confirmed_at timestamptz,banned_until timestamptz);
 CREATE TABLE auth.sessions(id uuid PRIMARY KEY,user_id uuid,not_after timestamptz);
 CREATE TABLE public.workshops(id uuid PRIMARY KEY,status text);
 CREATE TABLE public.workshop_memberships(workshop_id uuid,user_id uuid,status text);
 CREATE TABLE bt_platform_private.subscriptions(workshop_id uuid,plan text,state text,is_lifetime boolean,expires_at timestamptz);
 '''+table)
 names=['bt_commercial_private.plan','bt_commercial_private.assert_capability','public.bt_commercial_finish','public.bt_commercial_cached']
 for n in names:sql(function(n))
 sql("REVOKE ALL ON ALL FUNCTIONS IN SCHEMA bt_commercial_private FROM PUBLIC,anon,authenticated,service_role;REVOKE ALL ON FUNCTION public.bt_commercial_finish(uuid,uuid,boolean,bytea),public.bt_commercial_cached(uuid,uuid) FROM PUBLIC,anon,authenticated;GRANT EXECUTE ON FUNCTION public.bt_commercial_finish(uuid,uuid,boolean,bytea),public.bt_commercial_cached(uuid,uuid) TO service_role;")
 sql(f"INSERT INTO auth.users VALUES('{uid}',now(),NULL);INSERT INTO auth.sessions VALUES('{sid}','{uid}',NULL);INSERT INTO public.workshops VALUES('{wid}','active');INSERT INTO public.workshop_memberships VALUES('{wid}','{uid}','active');INSERT INTO bt_platform_private.subscriptions VALUES('{wid}','plus','active',true,NULL);INSERT INTO bt_commercial_private.consumption(request_id,workshop_id,actor_id,capability,resource_id,state,plan_at_reservation,snapshot_hash,session_id) VALUES('{request}','{wid}','{uid}','multipunto','{wid}','reserved','plus',repeat('a',64),'{sid}');")
 renders=[(out/('multipunto-render-'+str(i)+'.pdf')).read_bytes() for i in [1,2]]
 assert renders[0]!=renders[1] and all(b.startswith(b'%PDF-') for b in renders)
 def finish(data,success=True):return f"SELECT public.bt_commercial_finish('{request}','{uid}',{'true' if success else 'false'},decode({quote(data.hex())},'hex'));"
 def cache():return sql(f"SELECT public.bt_commercial_cached('{request}','{uid}');",'service_role')
 with ThreadPoolExecutor(max_workers=2) as pool:list(pool.map(lambda b:sql(finish(b),'service_role'),renders))
 committed=bytes.fromhex(cache());assert committed in renders
 row=json.loads(sql(f"SELECT json_build_object('rows',count(*),'confirmed',count(*) FILTER(WHERE state='confirmed')) FROM bt_commercial_private.consumption WHERE request_id='{request}';"));assert row=={'rows':1,'confirmed':1}
 timestamp=sql(f"SELECT confirmed_at FROM bt_commercial_private.consumption WHERE request_id='{request}';")
 passed('Two real concurrent finish sessions persist exactly one original multipunto render and one confirmed consumption')
 sql(finish(renders[1] if committed==renders[0] else renders[0]),'service_role');assert bytes.fromhex(cache())==committed;assert sql(f"SELECT confirmed_at FROM bt_commercial_private.consumption WHERE request_id='{request}';")==timestamp
 passed('Different retry bytes cannot overwrite the first confirmation or its timestamp')
 sql(finish(b'',False),'service_role');assert bytes.fromhex(cache())==committed
 passed('A losing request release cannot erase an already confirmed document')
 for role in ['anon','authenticated']:denied(finish(renders[0]),role);denied(f"SELECT public.bt_commercial_cached('{request}','{uid}');",role)
 passed('Browser and anonymous roles cannot confirm or access the private byte cache')
 sql(f"UPDATE auth.sessions SET not_after=now()-interval '1 second' WHERE id='{sid}';")
 denied(finish(renders[0]));denied(f"SELECT public.bt_commercial_cached('{request}','{uid}');")
 sql(f"UPDATE auth.sessions SET not_after=NULL WHERE id='{sid}';")
 passed('Revoked original session withholds cached and retry bytes')
 sql(f"UPDATE public.workshop_memberships SET status='disabled' WHERE user_id='{uid}';")
 denied(finish(renders[0]));denied(f"SELECT public.bt_commercial_cached('{request}','{uid}');")
 sql(f"UPDATE public.workshop_memberships SET status='active' WHERE user_id='{uid}';")
 passed('Disabled membership cannot reuse the confirmed byte identity')
 sql(f"UPDATE bt_platform_private.subscriptions SET plan='basic' WHERE workshop_id='{wid}';")
 denied(finish(renders[0]));denied(f"SELECT public.bt_commercial_cached('{request}','{uid}');")
 sql(f"UPDATE bt_platform_private.subscriptions SET plan='plus' WHERE workshop_id='{wid}';")
 passed('Plan downgrade blocks premium byte-cache and confirmation reuse')
 sql(f"UPDATE bt_commercial_private.consumption SET expires_at=now()-interval '1 second' WHERE request_id='{request}';")
 denied(finish(renders[0]));denied(f"SELECT public.bt_commercial_cached('{request}','{uid}');")
 assert sql(f"SELECT encode(document_bytes,'hex') FROM bt_commercial_private.consumption WHERE request_id='{request}';")==committed.hex()
 passed('Expired lease denies access without destroying the confirmed historical bytes')
 report={'status':'PASS','cases':results,'count':len(results),'sourceSQLUnmodified':True,'scope':'actual finish/cache/plan/capability bodies, minimal isolated schema; no historical assertions or hosted migrations','functionSHA256':{n:hashlib.sha256(function(n).encode()).hexdigest() for n in names},'winningPDFSHA256':hashlib.sha256(committed).hexdigest(),'network':'Docker --network none, no published ports'}
 (out/'sql-delta-results.json').write_text(json.dumps(report,indent=2)+'\n');print('COMMERCIAL_DELTA_SQL_PASS',len(results))
finally:subprocess.run(['docker','rm','-f',name],capture_output=True)
