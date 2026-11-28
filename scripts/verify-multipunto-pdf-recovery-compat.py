"""Four pure, focused version checks. No dump, archive, restore or hosted access."""
import copy,hashlib,json,os,subprocess,types
from pathlib import Path
lab=os.environ.get('BT_MPF_LAB','')
assert lab.startswith('bt-mpf-pdf-'), 'SYNTHETIC_PDF_LAB_REQUIRED'
out=Path(os.environ.get('BT_MPF_EVIDENCE','/tmp/bt-mp-pdf-fix-evidence'))
path=Path('scripts/backup/sec07_multipunto_recovery.py');source=path.read_text();module=types.ModuleType('pdf_recovery_candidate');exec(compile(source,str(path),'exec'),module.__dict__)
# Read only COPY-compatible textual cells from the synthetic laboratory.
# Nothing is archived or restored; rows/tenant IDs/bytes never enter the receipt.
base=source.replace("r['policy_id'] in ('MP-V2-1', 'MP-V2-2', 'MP-V2-3')","r['policy_id'] in ('MP-V2-1', 'MP-V2-2')").replace("if r['policy_id'] in ('MP-V2-2', 'MP-V2-3'):","if r['policy_id'] == 'MP-V2-2':")
previous=types.ModuleType('pdf_recovery_before');exec(compile(base,'previous_source','exec'),previous.__dict__)
def q(sql):
 r=subprocess.run(['docker','exec','-i',lab,'psql','-X','-qAt','-v','ON_ERROR_STOP=1','-U','postgres','-d','bytetorque'],input=sql,text=True,capture_output=True,check=True)
 return json.loads(r.stdout.strip().split('\n')[-1])
tables={}
for table in sorted(module.RECOVERY_TABLES):
 columns=module.COLUMN_NAMES[table];values=[]
 for col in columns:
  value=f'"{col}"::text'
  if col in module._BOOL_COLUMNS or table=='bt_multipunto_private.control' and col=='id':value=f"CASE WHEN \"{col}\" IS NULL THEN NULL WHEN \"{col}\" THEN 't' ELSE 'f' END"
  values.extend(["'"+col+"'",value])
 schema,name=table.split('.')
 tables[table]=q('SELECT coalesce(jsonb_agg(jsonb_build_object('+','.join(values)+f')),\'[]\') FROM "{schema}"."{name}";')
cases=[]
def rejects(mod,value,expected):
 try:mod._analyze(value)
 except mod.RecoveryError as e:assert expected in str(e),(expected,str(e))
 else:raise AssertionError('FAIL_CLOSED_EXPECTED '+expected)
rejects(previous,tables,'MP_POLICY_VERSION_UNSUPPORTED');cases.append('Original pure validator rejects actual synthetic MP-V2-3 dataset: dependency confirmed')
module._analyze(tables);cases.append('Candidate accepts mixed V2-2/V2-3 tables and intact credits/jobs/ledger/artifact hashes in memory')
new=next(row for row in tables['bt_multipunto_private.snapshots'] if row['policy_id']=='MP-V2-3')
def mutate(change):
 data=copy.deepcopy(tables);row=next(r for r in data['bt_multipunto_private.snapshots'] if r['id']==new['id']);payload=json.loads(row['payload']);change(data,row,payload);row['canonical']=json.dumps(payload,sort_keys=True,ensure_ascii=False);row['payload']=row['canonical'];row['snapshot_hash']=hashlib.sha256(row['canonical'].encode()).hexdigest();return data
bad=mutate(lambda data,row,payload:payload.update(sourceHash='a'*64));rejects(module,bad,'MP_SOURCE_HASH_BINDING_MISMATCH');cases.append('MP-V2-3 retains source-hash binding guard despite valid recomputed canonical hash')
def unknown(data,row,payload):
 policy=copy.deepcopy(next(p for p in data['bt_multipunto_private.policy'] if p['id']=='MP-V2-3'));policy['id']='MP-V2-99';data['bt_multipunto_private.policy'].append(policy);row['policy_id']='MP-V2-99';payload['policyId']='MP-V2-99'
rejects(module,mutate(unknown),'MP_POLICY_VERSION_UNSUPPORTED');cases.append('Unknown version remains rejected even with internally matching registry/payload/hash')
receipt={'status':'PASS','cases':cases,'sourceSHA256':hashlib.sha256(source.encode()).hexdigest(),'previousSourceSHA256':hashlib.sha256(base.encode()).hexdigest(),'scope':'Pure memory validation of isolated synthetic SQL rows; no backup/dump/restore/Storage or network','historicalSuitesRepeated':False,'productionContacted':False}
(out/'recovery-policy-compat.json').write_text(json.dumps(receipt,indent=2)+'\n');print('MULTIPUNTO_PDF_PURE_RECOVERY_VERSION_PASS',len(cases))
