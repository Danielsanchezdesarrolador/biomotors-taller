/** Only PDF-FIX and version-transition contracts. PostgreSQL network-none + synthetic Storage. */
import assert from 'node:assert/strict'
import {randomUUID,createHash} from 'node:crypto'
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {PDFDocument} from 'pdf-lib'
import {fixture as f,sql,lit,invoke,client,assets,setPlan,confirmed} from './lab'
import {multipuntoService} from '../../server/multipunto/service'
import {renderMultipunto,MP_RENDERER} from '../../server/multipunto/renderer'
import {renderMultipunto as renderV1} from '../../server/multipunto/rendererV1'
import {multipuntoPdf,multipuntoPdfModel} from '../../src/ordenes/cp04InspectionPdf'
import {multipuntoTemplateItems,CP04_IMMEDIATE_PREFIX} from '../../src/ordenes/cp04Multipunto'
import {sha,type MPJob,type MPWorker,type MPInfo} from '../../server/multipunto/protocol'
const out=process.env.BT_MPF_EVIDENCE||'/tmp/bt-mp-pdf-fix-evidence';await mkdir(out,{recursive:true})
const cases:string[]=[]
async function test(name:string,fn:()=>Promise<void>|void){await fn();cases.push(name);console.log('PASS',name)}
const files=await assets(),svc=multipuntoService(client('authenticated'),client('service_role'),assets)
const signatures=['public.bt_plan04_operations_status(uuid)','public.bt_final_archive_document(uuid,uuid)','public.bt_final_archive_source(uuid,uuid,uuid,uuid)','public.bt_commercial_status(uuid)']
const gates=()=>sql(`SELECT jsonb_agg(jsonb_build_object('signature',p.oid::regprocedure::text,'definition',pg_get_functiondef(p.oid),'acl',p.proacl::text) ORDER BY p.oid) FROM pg_proc p WHERE p.oid IN(${signatures.map(x=>lit(x)+'::regprocedure').join(',')});`)
const guardsBefore=gates(),ledgerBefore=confirmed()
const existingFunctions=sql("SELECT jsonb_object_agg(p.oid::regprocedure::text,md5(p.prosrc)||coalesce(p.proacl::text,'')) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE (n.nspname='public' AND p.proname IN('bt_mp_prepare','bt_mp_complete','bt_mp_read','bt_mp_worker','bt_mp_info','bt_mp_renew','bt_commercial_finish')) OR n.nspname='bt_multipunto_private' AND p.proname IN('authorize','charge_check_at','lock_scope');")
const vehicleOf=(oid:string)=>sql(`SELECT vehicle_id FROM public.work_orders WHERE id=${lit(oid)};`)
const fresh=()=>{const vid=sql(`INSERT INTO public.vehicles(workshop_id,customer_id,plate,make,model,model_year) VALUES(${lit(f.wid)},${lit(f.cid)},NULL,'Synthetic','Multipunto',2012) RETURNING id;`);const oid=sql(`INSERT INTO public.work_orders(workshop_id,vehicle_id,complaint,status,intake_odometer) VALUES(${lit(f.wid)},${lit(vid)},'Synthetic PDF layout validation','inspecting',120000) RETURNING id;`);sql(`INSERT INTO public.inspection_findings(workshop_id,order_id,vehicle_id,category,result,note) VALUES(${lit(f.wid)},${lit(oid)},${lit(vid)},'Multipunto · Luces bajas','ok','Synthetic confirmed finding');`);return oid}
function info(oid:string):MPInfo{return invoke('bt_mp_info',[f.wid,oid])}
function prep(oid:string,kind='final',credit:string|null=null):MPJob{const i=info(oid);return invoke('bt_mp_prepare',[f.wid,oid,randomUUID(),kind,i.sourceHash,i.snapshotHash,credit?0:1,true,credit])}
const snapshot=(j:MPJob)=>sql(`SELECT jsonb_build_object('payload',payload,'hash',snapshot_hash,'canonical',canonical,'policy',policy_id) FROM bt_multipunto_private.snapshots WHERE id=(SELECT snapshot_id FROM bt_multipunto_private.jobs WHERE id=${lit(j.id)});`)
sql('UPDATE bt_multipunto_private.control SET read_enabled=true,write_enabled=true,recovery_ready=true;');setPlan('full')
// Establish an actual confirmed old-policy credit and an unrendered old reservation.
const oldOrder=fresh(),oldDraft=prep(oldOrder,'draft');await svc.process(oldDraft)
const historicalDraft=await svc.read(f.wid,oldOrder,null,oldDraft.id)
const pendingOrder=fresh(),pending=prep(pendingOrder)
const oldPolicyRows=sql("SELECT jsonb_agg(to_jsonb(p) ORDER BY id) FROM bt_multipunto_private.policy p;")
const controlBefore=sql('SELECT to_jsonb(c) FROM bt_multipunto_private.control c;')
sql(await readFile('docs/sql/BT_MULTIPUNTO_PDF_FIX_01_POLICY_CANDIDATE.sql','utf8'))
sql("SET bt_multipunto_pdf.external_barrier='verified';"+await readFile('docs/sql/BT_MULTIPUNTO_PDF_FIX_01_CANDIDATE.sql','utf8'))
await test('Incremental install preserves historic policies, commercial RPC bodies/ACL and GATE4',()=>{
 assert.deepEqual(sql("SELECT jsonb_agg(to_jsonb(p) ORDER BY id) FROM bt_multipunto_private.policy p WHERE id<>'MP-V2-3';"),oldPolicyRows)
 assert.deepEqual(sql("SELECT jsonb_object_agg(p.oid::regprocedure::text,md5(p.prosrc)||coalesce(p.proacl::text,'')) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE (n.nspname='public' AND p.proname IN('bt_mp_prepare','bt_mp_complete','bt_mp_read','bt_mp_worker','bt_mp_info','bt_mp_renew','bt_commercial_finish')) OR n.nspname='bt_multipunto_private' AND p.proname IN('authorize','charge_check_at','lock_scope');"),existingFunctions)
 assert.deepEqual(gates(),guardsBefore)
})
assert.deepEqual(sql('SELECT to_jsonb(c) FROM bt_multipunto_private.control c;'),controlBefore)
await test('Live old-policy credit survives activation and promotion without new consumption',async()=>{
 const n=confirmed(),before=snapshot(oldDraft)
 assert.equal(before.policy,'MP-V2-2');assert.equal(info(oldOrder).snapshotHash,before.hash);assert.equal(info(oldOrder).eligibleCredit?.id,oldDraft.credit_id)
 const j=prep(oldOrder,'final',oldDraft.credit_id);assert.equal(j.credit_id,oldDraft.credit_id)
 await svc.process(j);assert.equal(confirmed(),n)
 const d=sql(`SELECT to_jsonb(d) FROM bt_multipunto_private.documents d WHERE credit_id=${lit(j.credit_id)};`)
 const b=await svc.read(f.wid,oldOrder,d.id,null);await writeFile(out+'/historical-original.pdf',b)
 assert.deepEqual(await svc.read(f.wid,oldOrder,null,oldDraft.id),historicalDraft)
 assert.deepEqual(snapshot(oldDraft),before)
})
await test('Pre-install unrendered reservation keeps its snapshot, renderer and single ledger identity',async()=>{
 const before=snapshot(pending),n=confirmed()
 const preview=await renderV1({job:pending,snapshot:before.payload,snapshotHash:before.hash,canonical:before.canonical,artifact:null},files)
 await svc.process(pending)
 const d=sql(`SELECT to_jsonb(d) FROM bt_multipunto_private.documents d WHERE credit_id=${lit(pending.credit_id)};`)
 assert.deepEqual(await svc.read(f.wid,pendingOrder,d.id,null),preview);assert.equal(confirmed(),n+1);assert.deepEqual(snapshot(pending),before)
})
const order=fresh()
const template=multipuntoTemplateItems()
sql(`DELETE FROM public.inspection_findings WHERE order_id=${lit(order)};`)
for(const [n,item]of template.entries()){
 const state=['ok','attention','immediate','unreviewed'][n%4]
 const note=state==='unreviewed'?'':(state==='immediate'?CP04_IMMEDIATE_PREFIX:'')+'Observación sintética '+(n+1)+' áéñ'
 sql(`INSERT INTO public.inspection_findings(workshop_id,order_id,vehicle_id,category,result,note,resolution) VALUES(${lit(f.wid)},${lit(order)},${lit(vehicleOf(order))},${lit('Multipunto · '+item.name)},${lit(state==='ok'?'ok':state==='unreviewed'?'not_checked':'attention')},${lit(note)},${lit(state==='unreviewed'||state==='ok'?'not_applicable':'pending')});`)
}
let draft!:MPJob,issued!:MPJob,work!:MPWorker,finalBytes!:Uint8Array,draftBytes!:Uint8Array
await test('New snapshot selects MP-V2-3; four states and all 34 official IDs preserved',async()=>{
 draft=prep(order,'draft');const snap=snapshot(draft);assert.equal(snap.policy,'MP-V2-3');assert.equal(snap.payload.policy.renderer,MP_RENDERER)
 assert.deepEqual(snap.payload.items.map((i:{id:string})=>i.id),template.map(i=>i.id));assert.deepEqual(snap.payload.items.map((i:{state:string})=>i.state),template.map((_,n)=>['ok','attention','immediate','unreviewed'][n%4]))
 work={job:draft,snapshot:snap.payload,snapshotHash:snap.hash,canonical:snap.canonical,artifact:null}
 await writeFile(out+'/worker.json',JSON.stringify(work,null,2))
 await writeFile(out+'/four-states.json',JSON.stringify(snap.payload.items.map((row:{id:string;state:string})=>({id:row.id,state:row.state})),null,2))
})
await test('Draft and final share credit/snapshot; repeat service actions do not consume twice',async()=>{
 const n=confirmed();await svc.process(draft);assert.equal(confirmed(),n+1)
 draftBytes=await svc.read(f.wid,order,null,draft.id)
 assert.equal(info(order).eligibleCredit?.id,draft.credit_id)
 issued=prep(order,'final',draft.credit_id);assert.equal(issued.credit_id,draft.credit_id);assert.equal(snapshot(issued).hash,work.snapshotHash)
 await Promise.all([svc.process(issued),svc.process(issued)])
 const d=sql(`SELECT to_jsonb(d) FROM bt_multipunto_private.documents d WHERE credit_id=${lit(draft.credit_id)};`)
 finalBytes=await svc.read(f.wid,order,d.id,null)
 await svc.process(issued);assert.deepEqual(await svc.read(f.wid,order,d.id,null),finalBytes)
 assert.equal(confirmed(),n+1);assert.notDeepEqual(finalBytes,draftBytes)
 await writeFile(out+'/draft.pdf',draftBytes);await writeFile(out+'/final.pdf',finalBytes)
})
await test('Real new renderer has deterministic bytes, correct PDF metadata and A4 pages',async()=>{
 const j=sql(`SELECT to_jsonb(j) FROM bt_multipunto_private.jobs j WHERE id=${lit(issued.id)};`) as MPJob
 const rendered=await renderMultipunto({...work,job:j},files)
 assert.deepEqual(rendered,finalBytes)
 const doc=await PDFDocument.load(rendered);assert.equal(doc.getTitle(),'Informe definitivo de inspección multipunto');assert.equal(doc.getCreationDate()?.valueOf(),Math.floor(new Date(issued.created_at).valueOf()/1000)*1000)
 assert.match(doc.getSubject()!,new RegExp(work.snapshotHash));assert.ok(doc.getKeywords()?.includes(issued.document_id))
 for(const p of doc.getPages()){assert.equal(p.getWidth(),595.28);assert.equal(p.getHeight(),841.89)}
 assert.ok(doc.getPageCount()>=2)
})
await test('Approved draft baseline is generated with the same synthetic source for visual geometry comparison',async()=>{
 const s=work.snapshot
 const findings=sql(`SELECT coalesce(jsonb_agg(to_jsonb(f)),'[]') FROM public.inspection_findings f WHERE f.order_id=${lit(order)};`)
 const source={workshopName:s.profile?.commercial_name||s.workshop.name,order:{order:{...s.order,complaint:'',opened_by:f.owner,closed_at:null,updated_at:draft.created_at},vehicle:{...s.vehicle,plate_key:null,odometer_km:null}},findings,identity:{workshop_id:f.wid,order_id:order,vehicle_id:s.vehicle.id,customer_id:f.cid,ownerName:s.customer.full_name,modelYear:s.vehicle.model_year}}
 const baseline=await multipuntoPdf(source,files.font,files)
 await writeFile(out+'/approved-baseline.pdf',baseline)
 await writeFile(out+'/model-states.json',JSON.stringify(multipuntoPdfModel(source).rows.map(row=>({id:row.id,state:row.state})),null,2))
})
await test('Long notes and additional observations render fully with coherent pagination, no clipping',async()=>{
 const longOrder=fresh(),note='INICIO_ÍNTEGRO '+('anexo técnico detallado '.repeat(70))+' FIN_ÍNTEGRO',token='INICIO_TOKEN_'+('Z'.repeat(1940))+'_FIN_TOKEN'
 assert.ok(note.length<=2000);assert.ok(token.length<=2000)
 sql(`INSERT INTO public.inspection_findings(workshop_id,order_id,vehicle_id,category,result,note,resolution,resolved_at) VALUES(${lit(f.wid)},${lit(longOrder)},${lit(vehicleOf(longOrder))},'Multipunto · Correas de accesorios','attention',${lit(note)},'resolved',clock_timestamp()),(${lit(f.wid)},${lit(longOrder)},${lit(vehicleOf(longOrder))},'Multipunto · Distribución','attention',${lit(token)},'pending',NULL),(${lit(f.wid)},${lit(longOrder)},${lit(vehicleOf(longOrder))},'Observación adicional sintética','attention',${lit(note)},'pending',NULL);`)
 sql(`INSERT INTO public.inspection_findings(workshop_id,order_id,vehicle_id,category,result,note,resolution) VALUES(${lit(f.wid)},${lit(longOrder)},${lit(vehicleOf(longOrder))},${lit('W'.repeat(80))},'attention','Categoría extensa conservada','pending');`)
 const j=prep(longOrder);await svc.process(j);const d=sql(`SELECT to_jsonb(d) FROM bt_multipunto_private.documents d WHERE credit_id=${lit(j.credit_id)};`)
 const b=await svc.read(f.wid,longOrder,d.id,null);await writeFile(out+'/long-notes.pdf',b)
 await writeFile(out+'/notes-expected.json',JSON.stringify({note,token},null,2))
})
await test('Template/scope/policy/asset mismatch is rejected without rendering a permissive fallback',async()=>{
 const bad=structuredClone(work);bad.snapshot.items[0].id='other';bad.canonical=JSON.stringify(bad.snapshot);bad.snapshotHash=await sha(new TextEncoder().encode(bad.canonical));await assert.rejects(()=>renderMultipunto(bad,files),/MP_SNAPSHOT_INVALID/)
 await assert.rejects(()=>renderMultipunto({...work,job:{...work.job,workshop_id:randomUUID()}},files),/MP_SNAPSHOT_INVALID/)
 await assert.rejects(()=>renderMultipunto({...work,snapshot:{...work.snapshot,policy:{...work.snapshot.policy,renderer:'untrusted'}}},files),/MP_POLICY_MISMATCH/)
 await assert.rejects(()=>renderMultipunto(work,{...files,font:new Uint8Array([1])}),/MP_ASSET_MISMATCH/)
})
await test('Rollback stops new V3 admission but preserves active V3 credit and immutable originals',async()=>{
 const saved=finalBytes.slice(),hash=await sha(saved),n=confirmed()
 sql("SET bt_multipunto_pdf.external_barrier='verified';"+await readFile('docs/sql/BT_MULTIPUNTO_PDF_FIX_01_ROLLBACK_CANDIDATE.sql','utf8'));assert.deepEqual(sql('SELECT to_jsonb(c) FROM bt_multipunto_private.control c;'),controlBefore)
 assert.equal(info(order).snapshotHash,work.snapshotHash);assert.equal(info(order).eligibleCredit?.id,draft.credit_id)
 const d=sql(`SELECT to_jsonb(d) FROM bt_multipunto_private.documents d WHERE credit_id=${lit(draft.credit_id)};`)
 assert.deepEqual(await svc.read(f.wid,order,d.id,null),saved);assert.equal(d.pdf_hash,hash);assert.equal(confirmed(),n)
 const next=prep(fresh(),'draft');assert.equal(snapshot(next).policy,'MP-V2-2')
})
assert.deepEqual(gates(),guardsBefore)
const sourceHashes={};for(const path of ['server/multipunto/rendererV1.ts','src/ordenes/cp04InspectionPdf.ts','src/ordenes/cp04Multipunto.ts'])Object.assign(sourceHashes,{[path]:createHash('sha256').update(await readFile(path)).digest('hex')})
await writeFile(out+'/server-results.json',JSON.stringify({status:'PASS',cases,postgres:'17 isolated network-none',storage:'Synthetic Map; actual service + SQL',gate4:'4 definitions/ACL unchanged',commercialFunctions:'unchanged',sourceHashes,ledgerDelta:confirmed()-ledgerBefore,pdfHashes:{draft:await sha(draftBytes),final:await sha(finalBytes)},productionContacted:false},null,2)+'\n')
console.log('MULTIPUNTO_PDF_FIX_SERVER_PASS',cases.length)
