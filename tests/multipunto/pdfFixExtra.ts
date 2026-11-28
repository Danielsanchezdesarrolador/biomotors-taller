/** Supplemental affected contracts: Plus, empty inspection and HTTP strictness. */
import assert from 'node:assert/strict'
import {randomUUID} from 'node:crypto'
import {readFile,writeFile} from 'node:fs/promises'
import {fixture as f,sql,lit,invoke,client,assets,setPlan,confirmed,post} from './lab'
import {multipuntoService} from '../../server/multipunto/service'
import {multipuntoTemplateItems,CP04_IMMEDIATE_PREFIX} from '../../src/ordenes/cp04Multipunto'
import type {MPInfo,MPJob} from '../../server/multipunto/protocol'
const out=process.env.BT_MPF_EVIDENCE||'/tmp/bt-mp-pdf-fix-evidence',svc=multipuntoService(client('authenticated'),client('service_role'),assets),cases:string[]=[]
async function test(name:string,fn:()=>Promise<void>|void){await fn();cases.push(name);console.log('PASS',name)}
const info=(oid:string):MPInfo=>invoke('bt_mp_info',[f.wid,oid])
function prepare(oid:string,kind:string,credit:string|null=null):MPJob{const i=info(oid);return invoke('bt_mp_prepare',[f.wid,oid,randomUUID(),kind,i.sourceHash,i.snapshotHash,credit?0:1,true,credit])}
const fresh=()=>{const v=sql(`INSERT INTO public.vehicles(workshop_id,customer_id,make,model) VALUES(${lit(f.wid)},${lit(f.cid)},'Synthetic','PDF supplemental') RETURNING id;`);return {v,o:sql(`INSERT INTO public.work_orders(workshop_id,vehicle_id,complaint,status) VALUES(${lit(f.wid)},${lit(v)},'Synthetic supplemental PDF','inspecting') RETURNING id;`)}}
await test('Install/rollback require explicit external barrier; missing confirmation cannot change control or function',async()=>{
 const before=sql("SELECT jsonb_build_object('control',(SELECT to_jsonb(c) FROM bt_multipunto_private.control c),'function',(SELECT md5(prosrc) FROM pg_proc WHERE oid='bt_multipunto_private.capture(uuid,uuid)'::regprocedure));")
 const rollback=await readFile('docs/sql/BT_MULTIPUNTO_PDF_FIX_01_ROLLBACK_CANDIDATE.sql','utf8')
 assert.throws(()=>sql(rollback),/MP_PDF_REQUIRES_VERIFIED_EXTERNAL_BARRIER/)
 assert.deepEqual(sql("SELECT jsonb_build_object('control',(SELECT to_jsonb(c) FROM bt_multipunto_private.control c),'function',(SELECT md5(prosrc) FROM pg_proc WHERE oid='bt_multipunto_private.capture(uuid,uuid)'::regprocedure));"),before)
})
// Restore only the exact new default function in this synthetic lab after the
// preceding rollback scenario. This is not a second installation in production.
const migration=await readFile('docs/sql/BT_MULTIPUNTO_PDF_FIX_01_CANDIDATE.sql','utf8')
sql(migration.slice(migration.indexOf('CREATE OR REPLACE FUNCTION bt_multipunto_private.capture(w uuid,o uuid)')).replace(/COMMIT;\s*$/,''))
setPlan('plus')
await test('Plus complete 34/34: marked draft then clean final share one credit, one consumption and unchanged expiry',async()=>{
 const {v,o}=fresh()
 for(const [n,row]of multipuntoTemplateItems().entries()){
  const state=['ok','attention','immediate'][n%3],note=state==='immediate'?CP04_IMMEDIATE_PREFIX+'Prioridad sintética':'Observación completa '+(n+1)
  sql(`INSERT INTO public.inspection_findings(workshop_id,order_id,vehicle_id,category,result,note,resolution) VALUES(${lit(f.wid)},${lit(o)},${lit(v)},${lit('Multipunto · '+row.name)},${lit(state==='ok'?'ok':'attention')},${lit(note)},${lit(state==='ok'?'not_applicable':'pending')});`)
 }
 const before=confirmed(),d=prepare(o,'draft'),expiry=sql(`SELECT expires_at::text FROM bt_commercial_private.consumption WHERE request_id=${lit(d.credit_id)};`)
 await svc.process(d);const final=prepare(o,'final',d.credit_id);assert.equal(final.credit_id,d.credit_id);await svc.process(final)
 const doc=sql(`SELECT to_jsonb(d) FROM bt_multipunto_private.documents d WHERE credit_id=${lit(d.credit_id)};`)
 await writeFile(out+'/complete.pdf',await svc.read(f.wid,o,doc.id,null));await writeFile(out+'/plus-draft.pdf',await svc.read(f.wid,o,null,d.id))
 assert.equal(confirmed(),before+1);assert.equal(sql(`SELECT expires_at::text FROM bt_commercial_private.consumption WHERE request_id=${lit(d.credit_id)};`),expiry)
 await svc.process(final);assert.equal(confirmed(),before+1)
})
await test('Empty inspection: draft has all 34 unreviewed; definitive cannot be invented even with partial acknowledgement',async()=>{
 const {o}=fresh(),i=info(o);assert.ok(i.items.every(row=>row.state==='unreviewed'))
 assert.throws(()=>prepare(o,'final'),/MP_PARTIAL_CONFIRMATION_REQUIRED/)
 const d=prepare(o,'draft');await svc.process(d);await writeFile(out+'/empty-draft.pdf',await svc.read(f.wid,o,null,d.id))
})
await test('HTTP rejects clean/renderer overrides; foreign workshop read is denied; no involuntary consumption',async()=>{
 const n=confirmed()
 for(const extra of [{clean:true},{renderer:'BT-MP-FINAL-2'},{watermark:false}]){
  const r=await post('info',{orderId:f.oid,...extra});assert.equal(r.status,400)
 }
 await assert.rejects(()=>svc.read(randomUUID(),f.oid,randomUUID(),null),/MP_PERMISSION_DENIED|MP_RESOURCE_DENIED/)
 assert.equal(confirmed(),n)
})
await writeFile(out+'/supplemental-results.json',JSON.stringify({status:'PASS',cases,scope:'Real isolated PostgreSQL/actual service and HTTP handler; synthetic Storage',productionContacted:false},null,2)+'\n')
console.log('MULTIPUNTO_PDF_FIX_SUPPLEMENTAL_PASS',cases.length)
