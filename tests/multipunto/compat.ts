import assert from 'node:assert/strict'
import {randomUUID} from 'node:crypto'
import {writeFile} from 'node:fs/promises'
import {fixture as f,sql,lit,invoke} from './lab'
const cases=[]
const credit=sql('SELECT row_to_json(c) FROM bt_commercial_private.consumption c JOIN bt_multipunto_private.credits v ON v.credit_id=c.request_id WHERE c.state=\'confirmed\' LIMIT 1;')
for(const [name,args,role]of [['bt_commercial_reserve',[f.wid,'multipunto',credit.resource_id,credit.request_id,credit.snapshot_hash],'authenticated'],['bt_commercial_finish',[credit.request_id,f.owner,true,'\\x255044462d312e370a2525454f46'],'service_role'],['bt_commercial_cached',[credit.request_id,f.owner],'service_role']] as const){assert.throws(()=>invoke(name,[...args],role),/MP_V2_ENDPOINT_REQUIRED/);cases.push({name:name+' rejects V2 credits',status:'PASS'})}
const id=randomUUID(),reserved=invoke('bt_commercial_reserve',[f.wid,'multipunto',f.oid,id,'a'.repeat(64)])
assert.equal(reserved.state,'reserved');invoke('bt_commercial_finish',[id,f.owner,true,'\\x255044462d312e370a2525454f46'],'service_role');assert.equal(invoke('bt_commercial_cached',[id,f.owner],'service_role'),'255044462d312e370a2525454f46')
cases.push({name:'V1 retains existing reservation/confirmation/cached marked draft bytes contract',status:'PASS'})
assert.equal(sql(`SELECT count(*) FROM bt_commercial_private.consumption WHERE request_id=${lit(id)} AND state='confirmed';`),1)
await writeFile((process.env.BT_MPF_EVIDENCE||'/tmp/bt-mpf-evidence')+'/compat-results.json',JSON.stringify({status:'PASS',cases},null,2));console.log('MP_V1_V2_COMPAT_PASS',cases.length)
