import assert from 'node:assert/strict'
import {randomUUID} from 'node:crypto'
import {writeFile} from 'node:fs/promises'
import {fixture as f,sql,lit,invoke,post,identity} from './lab'
const id=randomUUID(),missing=invoke('bt_mp_status',[f.wid,id]);assert.deepEqual(missing,{id,workshop_id:f.wid,state:'NOT_PREPARED'});assert.equal((await post('resume',{jobId:id})).status,404)
const j=sql(`SELECT row_to_json(j) FROM bt_multipunto_private.jobs j WHERE actor_id=${lit(f.owner)} AND state IN('EXPIRED','FAILED') LIMIT 1;`)
assert.ok(j);identity('00000000-0000-4000-8000-000000000003');assert.deepEqual(invoke('bt_mp_status',[f.wid,j.id]),{id:j.id,workshop_id:f.wid,state:'NOT_PREPARED'});identity(f.owner);sql(`UPDATE bt_multipunto_private.jobs SET state='RENDERING',lease_until=clock_timestamp()-interval '1 second' WHERE id=${lit(j.id)};`);assert.equal(invoke('bt_mp_status',[f.wid,j.id]).state,'EXPIRED');assert.equal(sql(`SELECT state FROM bt_multipunto_private.jobs WHERE id=${lit(j.id)};`),'RENDERING','Status is metadata, not an operational write')
assert.throws(()=>invoke('bt_mp_status',[randomUUID(),id]),/MP_PERMISSION_DENIED/)
await writeFile((process.env.BT_MPF_EVIDENCE||'/tmp/bt-mpf-delta-evidence')+'/status-reconciliation-results.json',JSON.stringify({status:'PASS',unpreparedMarker:'Authorized own-scope metadata only; foreign/absent UUIDs indistinguishable',missingResume404:true,effectiveExpiry:true,noStatusWrite:true,foreignWorkshopDenied:true},null,2));console.log('MULTIPUNTO_DELTA_STATUS_RECONCILIATION_PASS')
