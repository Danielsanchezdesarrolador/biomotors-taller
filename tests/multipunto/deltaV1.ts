import assert from 'node:assert/strict'
import {readFile,writeFile} from 'node:fs/promises'
import {randomUUID} from 'node:crypto'
import {sql,lit,fixture as f,setPlan} from './lab'
import {hex} from '../../server/multipunto/protocol'
const out=process.env.BT_MPF_EVIDENCE||'/tmp/bt-mpf-delta-evidence',baseline=JSON.parse(await readFile('tests/fixtures/multipuntoV1BeforeDelta.json','utf8'))
setPlan('plus');sql(`UPDATE bt_commercial_private.consumption SET confirmed_at='2026-11-20T00:00:00Z' WHERE state='confirmed';UPDATE bt_commercial_private.consumption SET state='failed' WHERE state='reserved';`)
const bytes=new Uint8Array(await readFile(out+'/delta-draft.pdf')),id=randomUUID()
sql(`INSERT INTO bt_commercial_private.consumption(request_id,workshop_id,actor_id,capability,resource_id,state,reserved_at,expires_at,plan_at_reservation,snapshot_hash,session_id) VALUES(${lit(id)},${lit(f.wid)},${lit(f.owner)},'multipunto',${lit(f.oid)},'reserved','2026-11-29 23:58 America/Santiago','2026-11-30 00:03 America/Santiago','plus',${lit('a'.repeat(64))},${lit(f.owner)});INSERT INTO bt_commercial_private.consumption(request_id,workshop_id,actor_id,capability,resource_id,state,confirmed_at,plan_at_reservation,snapshot_hash,session_id) SELECT gen_random_uuid(),${lit(f.wid)},${lit(f.owner)},'multipunto',${lit(f.oid)},'confirmed','2026-11-30 00:00 America/Santiago','plus','v1-week-counter',${lit(f.owner)} FROM generate_series(1,10);UPDATE bt_multipunto_test.clock_state SET instant='2026-11-30 00:01 America/Santiago';`)
// Explicit counterfactual clone reproduces the approved base defect, not the new product function.
let old=baseline.definition.replace('public.bt_commercial_finish(','bt_multipunto_test.v1_before(').replaceAll('now()','bt_multipunto_test.now()')
sql(old+';REVOKE ALL ON FUNCTION bt_multipunto_test.v1_before(uuid,uuid,boolean,bytea) FROM PUBLIC;GRANT USAGE ON SCHEMA bt_multipunto_test TO service_role;GRANT EXECUTE ON FUNCTION bt_multipunto_test.v1_before(uuid,uuid,boolean,bytea) TO service_role;')
const args=[id,f.owner,true,'\\x'+hex(bytes)].map(lit).join(',')
const wrong=sql(`SELECT bt_multipunto_test.v1_before(${args});`,'service_role');assert.equal(wrong.state,'confirmed')
sql(`UPDATE bt_commercial_private.consumption SET state='reserved',confirmed_at=NULL,document_bytes=NULL WHERE request_id=${lit(id)};`)
const fixed=sql("SELECT to_json(pg_get_functiondef('public.bt_commercial_finish(uuid,uuid,boolean,bytea)'::regprocedure));") as string
assert.ok(fixed.includes('decision_at:=clock_timestamp()'))
sql(fixed.replace('public.bt_commercial_finish(','bt_multipunto_test.v1_after(').replaceAll('now()','bt_multipunto_test.now()').replace('decision_at:=clock_timestamp()','decision_at:=bt_multipunto_test.now()')+';REVOKE ALL ON FUNCTION bt_multipunto_test.v1_after(uuid,uuid,boolean,bytea) FROM PUBLIC;GRANT EXECUTE ON FUNCTION bt_multipunto_test.v1_after(uuid,uuid,boolean,bytea) TO service_role;')
assert.throws(()=>sql(`SELECT bt_multipunto_test.v1_after(${args});`,'service_role'),/MP_QUOTA_EXHAUSTED/);assert.equal(sql(`SELECT state FROM bt_commercial_private.consumption WHERE request_id=${lit(id)};`),'reserved')
await writeFile(out+'/v1-writer-results.json',JSON.stringify({status:'PASS',baseDefectReproduced:true,fixedMultipuntoConfirmationRejectsEleventh:true,scope:'Real PostgreSQL clones with explicit synthetic week clock; original product V1/quote/email identity and ACL preserved, only new multipunto confirmations hardened. No historical ledger rewrite in product.'},null,2))
console.log('MULTIPUNTO_V1_SHARED_LEDGER_WEEK_GUARD_PASS')
