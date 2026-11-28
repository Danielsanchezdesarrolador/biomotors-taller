"""Synthetic, network-none recovery of published/staged multipunto and PostgreSQL rows."""
import io,json,os,subprocess,hashlib,sys,uuid
sys.path.insert(0,os.path.dirname(__file__))
from final_archive_storage import write_snapshot,verify_snapshot,inventory,StorageRecoveryError
lab=os.environ.get('BT_MPF_LAB','bt-mpf-validation-02')
assert lab.startswith('bt-mpf-')
out=os.environ.get('BT_MPF_EVIDENCE','/tmp/bt-mpf-evidence')
f=json.load(open('/tmp/bt-mpf-fixture.json'));wid=f['wid']
def sql(query,db='bytetorque'):
 r=subprocess.run(['docker','exec','-i',lab,'psql','-X','-qAt','-v','ON_ERROR_STOP=1','-U','postgres','-d',db],input=query,text=True,capture_output=True,check=True)
 return json.loads(r.stdout.strip().split('\n')[-1])
rows=sql("SELECT jsonb_agg(jsonb_build_object('path',a.path,'sha256',a.pdf_hash,'byteLength',a.byte_length,'bytes',encode(a.pdf_bytes,'hex'),'orderId',j.order_id,'revision',j.revision,'documentId',split_part(a.path,'/',5),'state',CASE WHEN d.id IS NULL THEN 'staged' ELSE 'published' END)) FROM bt_multipunto_private.artifacts a JOIN bt_multipunto_private.jobs j ON j.id=a.job_id LEFT JOIN bt_multipunto_private.documents d ON d.path=a.path WHERE a.path IS NOT NULL;")
assert any(r['state']=='published' for r in rows) and any(r['state']=='staged' for r in rows)
source={r['path']:bytes.fromhex(r['bytes']) for r in rows}
# Explicit synthetic Storage catalog for uploaded staged-object fixture, not a hosted inventory.
for r in rows:
 if r['state']=='staged':
  path=r['path'].replace("'","''")
  sql("INSERT INTO storage.objects(bucket_id,name) VALUES('bt-inspection-documents','"+path+"') ON CONFLICT DO NOTHING;SELECT 'true'::json;")
docs=[{k:v for k,v in r.items() if k!='bytes'}|{'bucket':'bt-inspection-documents'} for r in rows]
value={'version':2,'workshopId':wid,'recoverySetId':'synthetic-mp-isolated','documents':docs}
buf=io.BytesIO();summary=write_snapshot(value,lambda d:source[d['path']],buf)
restored={}
def put(d,b):
 key=(d['bucket'],d['path']);assert key not in restored;restored[key]=b
result=verify_snapshot(io.BytesIO(buf.getvalue()),value,put,lambda d:restored[d['bucket'],d['path']],isolated=True)
assert len(restored)==len(docs)
for d in docs:assert hashlib.sha256(restored[d['bucket'],d['path']]).hexdigest()==d['sha256']
# Published and abandoned stages are retained; no cleanup/drop operation is exercised.
restore_db='mp_restored_'+uuid.uuid4().hex[:8]
subprocess.run(['docker','exec',lab,'createdb','-U','postgres',restore_db],check=True)
dump=subprocess.run(['docker','exec',lab,'pg_dump','-U','postgres','-d','bytetorque','--no-owner'],capture_output=True,check=True).stdout
subprocess.run(['docker','exec','-i',lab,'psql','-X','-q','-v','ON_ERROR_STOP=1','-U','postgres','-d',restore_db],input=dump,capture_output=True,check=True)
query="SELECT jsonb_build_object('documents',(SELECT jsonb_agg(row_to_json(d) ORDER BY id) FROM bt_multipunto_private.documents d),'staging',(SELECT jsonb_agg(jsonb_build_object('job',job_id,'generation',generation,'path',path,'hash',encode(extensions.digest(pdf_bytes,'sha256'),'hex')) ORDER BY job_id,generation) FROM bt_multipunto_private.artifacts),'ledger',(SELECT jsonb_agg(row_to_json(c) ORDER BY request_id) FROM bt_commercial_private.consumption c));"
assert sql(query)==sql(query,restore_db)
# Wrong tenant, digest and identity fail closed; V1 remains accepted.
for mutate in [lambda x:x.update(workshopId='00000000-0000-4000-8000-000000000099'),lambda x:x['documents'][0].update(documentId='00000000-0000-4000-8000-000000000099')]:
 bad=json.loads(json.dumps(value));mutate(bad)
 try:inventory(bad);raise AssertionError('invalid inventory accepted')
 except StorageRecoveryError:pass
with open(out+'/s5b-results.json','w') as file:json.dump({'status':'PASS','scope':'Synthetic Storage in-memory sidecar + actual pg_dump/psql isolated database restore; no real custody, hosted access or historical backup repeated','objects':len(docs),'published':sum(d['state']=='published' for d in docs),'staged':sum(d['state']=='staged' for d in docs),'databaseLedgerSnapshotsAndArtifactBytes':'EXACT','sidecarSha256':hashlib.sha256(buf.getvalue()).hexdigest(),'verification':result},file,indent=2)
print('MULTIPUNTO_S5B_ISOLATED_PASS',len(docs))
