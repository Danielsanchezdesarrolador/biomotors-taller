/** Disposable PostgreSQL + filesystem Storage, real SDK adapter/HTTP handler/PDF engines. */
import {spawnSync,spawn} from 'node:child_process'
import {readFile,writeFile,mkdir,open,rm} from 'node:fs/promises'
import {createServer} from 'node:http'
import {createHash} from 'node:crypto'
import {join,resolve} from 'node:path'
import assert from 'node:assert/strict'
import type {SupabaseClient} from '@supabase/supabase-js'
import {finalArchiveFixture,id,request} from './fixtures/finalArchive'
import {quotePdf} from '../src/cp05/pdf'
import {closingDocumentPdf} from '../src/entrega/finalPdf'
import {prepareClosingPacket} from '../src/entrega/finalPackage'
import {finalArchivePorts} from '../server/com/finalArchivePorts'
import {finalArchiveHandler} from '../server/com/finalArchiveHandler'
const lab=process.env.BT_FINAL_ARCHIVE_LAB||'',out=resolve(process.env.BT_FINAL_ARCHIVE_EVIDENCE_DIR||'/tmp/bt-final-archive-evidence')
assert.match(lab,/^bt-final-archive-[0-9]+$/)
const root=join(out,'private-objects-'+lab);await mkdir(root,{recursive:true})
const literal=(x:unknown)=>x===null?'NULL':typeof x==='boolean'?String(x):"'"+String(typeof x==='object'?JSON.stringify(x):x).replaceAll("'","''")+"'"
function sql(command:string,role='postgres',actor=id(7)){
 const result=spawnSync('docker',['exec','-i',lab,'psql','-X','-qAt','-v','ON_ERROR_STOP=1','-v','VERBOSITY=verbose','-U','postgres','-d','bytetorque'],{input:`SET ROLE ${role}; SELECT set_config('request.jwt.claim.sub',${literal(actor)},false);\n${command}`,encoding:'utf8'})
 if(result.status){const error=new Error('LOCAL_SQL_FAILURE') as Error&{code:string};error.code=/ERROR:\s+([A-Z0-9]{5}):/.exec(result.stderr)?.[1]||'XX000';throw error}
 const line=result.stdout.trim().split('\n').at(-1)||'null';try{return JSON.parse(line)}catch{return line}
}
const methods:Record<string,string[]>={bt_final_archive_catalog:['p_workshop_id','p_query','p_vehicle_id','p_after_time','p_after_id'],bt_final_archive_document:['p_workshop_id','p_revision_id'],bt_final_archive_source:['p_workshop_id','p_order_id','p_revision_id','p_delivery_id'],bt_final_archive_commit:['p_workshop_id','p_order_id','p_revision_id','p_delivery_id','p_request_id','p_actor_id','p_manifest']}
const hash=(b:Uint8Array)=>createHash('sha256').update(b).digest('hex')
let uploads=0,renders=0
const assets={font:new Uint8Array(await readFile('public/cp05/DejaVuSans.ttf')),logo:new Uint8Array(await readFile('assets/brand/generated/icon-192.png'))}
function client(role='authenticated',actor=id(7)):SupabaseClient{return {
 auth:{getUser:async()=>({data:{user:{id:actor,email_confirmed_at:'2026-11-24T00:00:00Z'}},error:null})},
 rpc:async(name:string,args:Record<string,unknown>)=>{try{assert.ok(methods[name]);const result=sql(`SELECT public.${name}(${methods[name].map(k=>literal(args[k]??null)).join(',')});`,role,actor);return {data:result,error:null}}catch(e){return {data:null,error:{code:(e as {code:string}).code||'XX000'}}}},
 storage:{from:(bucket:string)=>{
  assert.ok(['cp05-quote-documents','bt-closing-documents'].includes(bucket))
  const safe=(name:string)=>{assert.ok(/^[0-9a-f-]{36}\/(quotes|closings)\//.test(name)&&!name.includes('..'));return join(root,bucket,name)}
  return {download:async(name:string)=>{try{return {data:new Blob([await readFile(safe(name))]),error:null}}catch{return {data:null,error:{code:'404'}}}},
   upload:async(name:string,bytes:Uint8Array,options:{upsert:boolean})=>{assert.equal(options.upsert,false);const file=safe(name);try{await mkdir(resolve(file,'..'),{recursive:true});const handle=await open(file,'wx');try{await handle.writeFile(bytes)}finally{await handle.close()};uploads++
    sql(`INSERT INTO storage.objects(bucket_id,name,metadata) VALUES(${literal(bucket)},${literal(name)},${literal({size:bytes.length,mimetype:'application/pdf'})});`,'service_role');return {data:{path:name},error:null}
   }catch{return {data:null,error:{code:'409'}}}}
  }
 }}} as unknown as SupabaseClient}
const user=client(),trusted=client('service_role')
async function fixture(offset:number,name:string,plate:string,sameTenant=false){
 const f=await finalArchiveFixture()
 let s=JSON.stringify(f.snapshot)
 if(offset)for(let n=40;n>=1;n--)s=s.replaceAll(id(n),id(n+offset))
 if(sameTenant)s=s.replaceAll(id(1+offset),id(1)).replaceAll(id(7+offset),id(7))
 const snap=JSON.parse(s) as typeof f.snapshot
 snap.revision.payload.customer.full_name=name;snap.revision.payload.vehicle.plate=plate
 snap.quote.number=123+offset;snap.revision.payload.quote.number=123+offset
 const bytes=await quotePdf(snap.revision.payload,assets)
 snap.revision.pdf_sha256=hash(bytes);snap.revision.pdf_size=bytes.length;snap.quoteArchive.sha256=hash(bytes);snap.quoteArchive.byteLength=bytes.length
 return {snapshot:snap,bytes}
}
const first=await fixture(0,'Cliente histórico ficticio','QA1234'),second=await fixture(200,'Segundo cliente ficticio','QA5678'),third=await fixture(100,'Tercer cliente ficticio','QA9012',true)
for(const f of [first,second,third]){
 const s=f.snapshot,q=s.quote,r=s.revision,w=q.workshop_id,actor=s.evidence.approvals[0].recorded_by
 sql(`INSERT INTO auth.users(id,email) VALUES(${literal(actor)},${literal('owner-'+w+'@invalid.test')}) ON CONFLICT DO NOTHING;
 INSERT INTO public.workshops(id,name) VALUES(${literal(w)},'Taller ficticio') ON CONFLICT DO NOTHING;
 INSERT INTO public.workshop_memberships(workshop_id,user_id,role) VALUES(${literal(w)},${literal(actor)},'owner') ON CONFLICT DO NOTHING;
 INSERT INTO public.customers(workshop_id,id,full_name,created_by) VALUES(${literal(w)},${literal(q.customer_id)},${literal(r.payload.customer.full_name)},${literal(actor)});
 INSERT INTO public.vehicles(workshop_id,id,customer_id,plate,make,model,created_by) VALUES(${literal(w)},${literal(q.vehicle_id)},${literal(q.customer_id)},${literal(r.payload.vehicle.plate)},'Auto','Ficticio',${literal(actor)});
 INSERT INTO public.work_orders(workshop_id,id,vehicle_id,complaint,status,opened_by) VALUES(${literal(w)},${literal(q.order_id)},${literal(q.vehicle_id)},'Visita ficticia','ready',${literal(actor)});
 INSERT INTO public.quotes(workshop_id,id,order_id,vehicle_id,customer_id,number,status,issued_revision,created_by) VALUES(${literal(w)},${literal(q.id)},${literal(q.order_id)},${literal(q.vehicle_id)},${literal(q.customer_id)},${q.number},'issued',1,${literal(actor)});
 INSERT INTO public.quote_revisions(workshop_id,id,quote_id,revision,payload,payload_sha256,pdf_object_path,pdf_sha256,pdf_size,issued_by,issued_at) VALUES(${literal(w)},${literal(r.id)},${literal(q.id)},1,${literal(r.payload)},${literal(r.payload_sha256)},${literal(r.pdf_object_path)},${literal(r.pdf_sha256)},${r.pdf_size},${literal(actor)},${literal(r.issued_at)});`)
 const a=s.evidence.approvals[0],e=s.evidence.executions[0],d=s.evidence.deliveries[0]
 for(const [table,row] of [['bt_flow_quote_approvals',a],['bt_flow_execution_reports',e],['bt_flow_visit_deliveries',d]] as const){
  const data={request_id:crypto.randomUUID(),...row};const keys=Object.keys(data);sql(`INSERT INTO public.${table}(${keys.join(',')}) VALUES(${keys.map(k=>literal((data as Record<string,unknown>)[k])).join(',')});`)
 }
 await trusted.storage.from('cp05-quote-documents').upload(r.pdf_object_path,f.bytes,{contentType:'application/pdf',upsert:false})
}
// A separate workshop/vehicle supplies the access-isolation counterexample.
const wid=first.snapshot.quote.workshop_id
sql(`INSERT INTO auth.users(id,email) VALUES(${literal(id(9))},'mechanic@invalid.test');INSERT INTO public.workshop_memberships(workshop_id,user_id,role) VALUES(${literal(wid)},${literal(id(9))},'mechanic');`)
const expectCode=(fn:()=>unknown,code:string,label:string)=>{assert.throws(fn,(e:unknown)=>(e as {code:string}).code===code);console.log('PASS',label)}
expectCode(()=>sql(`SELECT public.bt_final_archive_catalog(${literal(wid)},'',NULL,NULL,NULL);`,'authenticated'),'55000','OFF backend gate')
for(const f of [first,second])sql(`INSERT INTO bt_com_private.rollout(workshop_id,archive_read_enabled,archive_enabled) VALUES(${literal(f.snapshot.quote.workshop_id)},true,true);`)
expectCode(()=>sql(`SELECT public.bt_final_archive_catalog(${literal(wid)},'',NULL,NULL,NULL);`,'authenticated',id(9)),'42501','mechanic denied')
expectCode(()=>sql(`SELECT public.bt_final_archive_catalog(${literal(second.snapshot.quote.workshop_id)},'',NULL,NULL,NULL);`,'authenticated'),'42501','cross workshop denied')
expectCode(()=>sql(`SELECT bt_com_private.archive_document(${literal(wid)},${literal(id(6))},${literal(id(7))});`,'authenticated',id(9)),'42501','actor spoof rejected')
expectCode(()=>sql(`SELECT public.bt_final_archive_commit(${literal(wid)},${literal(id(4))},${literal(id(6))},${literal(id(32))},gen_random_uuid(),${literal(id(7))},'{}');`,'authenticated'),'42501','client cannot commit manifests')
const ports=finalArchivePorts(user,trusted,async()=>{renders++;return assets})
const packet=prepareClosingPacket(first.snapshot.quote,first.snapshot.revision,first.snapshot.evidence)
assert.equal(hash(await closingDocumentPdf(packet,'report',assets)),hash(await closingDocumentPdf(packet,'report',assets)),'deterministic first archival bytes')
console.log('PASS deterministic PDF bytes')
const attempts=await Promise.allSettled([ports.archive(request),ports.archive({...request,requestId:id(88)})])
assert.ok(attempts.some(x=>x.status==='fulfilled'),'at least one writer commits')
const retried=await ports.archive({...request,requestId:id(88)})
const winner=attempts.find(x=>x.status==='fulfilled') as PromiseFulfilledResult<typeof retried>
assert.deepEqual(winner.value,retried);assert.equal(sql('SELECT count(*) FROM bt_com_private.closing_manifests;'),1)
console.log('PASS concurrent retry converges to single immutable manifest')
const renderCount=renders,uploadCount=uploads
await ports.archive(request);assert.equal(renders,renderCount);assert.equal(uploads,uploadCount)
console.log('PASS completed retry reads originals, no render/upload')
for(const kind of ['quote','report','handover'] as const)assert.ok((await ports.download(wid,id(6),kind)).bytes.length>100)
console.log('PASS all original PDFs downloaded')
// Add a later quote revision; historic revision one must remain recoverable.
const later=structuredClone(first.snapshot.revision)
later.id=id(66);later.revision=2;later.issued_at='2026-11-19T18:00:00Z'
later.payload.quote.revision=2;later.payload.quote.issued_revision=2;later.payload.quote.version=2
later.payload.customer.full_name='Cliente revisión dos ficticio';later.payload.document_date=later.issued_at
later.payload.items[0].unit_price=200;later.payload.items[0].line_net=200
later.payload.totals={subtotal:250,tax:48,total:298}
later.pdf_object_path=wid+'/quotes/'+id(5)+'/r2/'+later.payload_sha256+'.pdf'
const laterBytes=await quotePdf(later.payload,assets);later.pdf_sha256=hash(laterBytes);later.pdf_size=laterBytes.length
sql(`INSERT INTO public.quote_revisions(workshop_id,id,quote_id,revision,payload,payload_sha256,pdf_object_path,pdf_sha256,pdf_size,issued_by,issued_at) VALUES(${literal(wid)},${literal(later.id)},${literal(id(5))},2,${literal(later.payload)},${literal(later.payload_sha256)},${literal(later.pdf_object_path)},${literal(later.pdf_sha256)},${later.pdf_size},${literal(id(7))},${literal(later.issued_at)}); UPDATE public.quotes SET issued_revision=2,version=2 WHERE workshop_id=${literal(wid)} AND id=${literal(id(5))};`)
await trusted.storage.from('cp05-quote-documents').upload(later.pdf_object_path,laterBytes,{contentType:'application/pdf',upsert:false})

// Persisted bytes survive lifecycle changes and mutable source changes.
sql(`UPDATE public.customers SET full_name='Nombre actual modificado',archived_at=now() WHERE workshop_id=${literal(wid)} AND id=${literal(id(2))};
 UPDATE public.vehicles SET model='Modelo actualizado',archived_at=now() WHERE workshop_id=${literal(wid)} AND id=${literal(id(3))};
 UPDATE public.work_orders SET status='closed',cancelled_at=now(),cancel_reason='Cancelación ficticia' WHERE workshop_id=${literal(wid)} AND id=${literal(id(4))};
 UPDATE public.quotes SET status='voided',void_reason='Anulación ficticia' WHERE workshop_id=${literal(wid)} AND id=${literal(id(5))};`)
const historical=await ports.documents(wid,id(6));assert.equal(historical.complete,true)
const catalog=sql(`SELECT public.bt_final_archive_catalog(${literal(wid)},'',NULL,NULL,NULL);`,'authenticated')
const original=catalog.find((x:{revisionId:string})=>x.revisionId===id(6));assert.equal(original.customerName,'Cliente histórico ficticio');assert.equal(original.total,179);assert.equal(original.orderCancelled,true);assert.equal(catalog.length,3);assert.equal(catalog[0].total,298)
for(const kind of ['quote','report','handover'] as const)assert.ok((await ports.download(wid,id(6),kind)).bytes.length>100)
console.log('PASS archived/cancelled/voided sources preserve historical content')
expectCode(()=>sql(`DELETE FROM bt_com_private.closing_manifests;`),'42501','manifest immutable')
expectCode(()=>sql(`DELETE FROM public.vehicles WHERE workshop_id=${literal(wid)};`),'23503','FK preserves documentary dependencies')
expectCode(()=>sql(`SELECT public.bt_final_archive_document(${literal(wid)},${literal(id(6))});`,'anon'),'42501','anonymous denied')
assert.equal(sql("SELECT count(*) FROM storage.objects WHERE bucket_id='bt-closing-documents';",'authenticated'),0)
console.log('PASS direct Storage inaccessible')
// Corrupt a LOCAL file only; the HTTP path must fail closed without rendering.
const report=historical.documents.find(d=>d.kind==='report')!,reportFile=join(root,report.bucket,report.path),saved=await readFile(reportFile)
await writeFile(reportFile,new Uint8Array(saved.length).fill(42));await assert.rejects(()=>ports.download(wid,id(6),'report'));assert.equal(renders,renderCount)
await writeFile(reportFile,saved);console.log('PASS corrupt original rejected; no regeneration')
await rm(reportFile);await assert.rejects(()=>ports.download(wid,id(6),'report'));assert.equal(renders,renderCount);await writeFile(reportFile,saved);console.log('PASS missing original rejected; no regeneration')
// Separate fresh SDK adapter simulates a fresh session; same durable manifest/bytes.
const fresh=finalArchivePorts(client(),client('service_role'),async()=>{throw Error('RENDER_MUST_NOT_BE_USED')})
assert.equal(hash((await fresh.download(wid,id(6),'report')).bytes),report.sha256)
console.log('PASS fresh session exact original')
sql(`UPDATE public.workshop_memberships SET status='disabled' WHERE workshop_id=${literal(wid)} AND user_id=${literal(id(7))};`);await assert.rejects(()=>ports.download(wid,id(6),'quote'));sql(`UPDATE public.workshop_memberships SET status='active' WHERE workshop_id=${literal(wid)} AND user_id=${literal(id(7))};`);console.log('PASS fresh server permission revocation')
sql(`UPDATE public.workshop_memberships SET role='admin' WHERE workshop_id=${literal(wid)} AND user_id=${literal(id(7))};`);assert.equal((await ports.documents(wid,id(6))).complete,true);sql(`UPDATE public.workshop_memberships SET role='reception' WHERE workshop_id=${literal(wid)} AND user_id=${literal(id(7))};`);await assert.rejects(()=>ports.documents(wid,id(6)));sql(`UPDATE public.workshop_memberships SET role='owner' WHERE workshop_id=${literal(wid)} AND user_id=${literal(id(7))};`);console.log('PASS authorized admin can recover');console.log('PASS reception cannot recover administrative archive')
await ports.archive(request);assert.equal(renders,renderCount)
sql(`UPDATE bt_com_private.rollout SET archive_enabled=false WHERE workshop_id=${literal(wid)};`)
assert.equal(hash((await ports.download(wid,id(6),'report')).bytes),report.sha256)
await assert.rejects(()=>ports.archive(request));console.log('PASS independent read and write gates, no regeneration after later revision')
sql(`UPDATE bt_com_private.rollout SET archive_enabled=true WHERE workshop_id=${literal(wid)};`)
const handler=finalArchiveHandler({read:true,write:true,origin:'http://127.0.0.1:47124'},{userClient:()=>client(),trustedClient:()=>client('service_role'),assets:async()=>assets})
const server=createServer(async(req,res)=>{
 res.setHeader('Access-Control-Allow-Origin','http://127.0.0.1:47124');res.setHeader('Access-Control-Allow-Headers','Content-Type')
 if(req.method==='OPTIONS'){res.end();return}
 let body='';for await(const chunk of req){body+=chunk;if(body.length>8192){res.writeHead(413).end();return}}
 try{
  if(req.url==='/rpc'){
   const data=JSON.parse(body);if(!['bt_final_archive_catalog','bt_final_archive_document'].includes(data.name)){res.writeHead(403).end();return}
   res.setHeader('Content-Type','application/json');res.end(JSON.stringify(await client().rpc(data.name,data.args)));return
  }
  if(req.url==='/function'){
   const response=await handler(new Request('http://127.0.0.1/function',{method:'POST',headers:{Authorization:'Bearer synthetic-local-only','Content-Type':'application/json',Origin:'http://127.0.0.1:47124'},body}))
   res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return
  }
  res.writeHead(404).end()
 }catch{res.writeHead(500).end('{}')}
})
await new Promise<void>(resolve=>server.listen(47125,'127.0.0.1',resolve))
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--config','vite.harness.config.ts','--port','47124','--strictPort'],{stdio:'ignore'})
try{
 for(let n=0;n<30;n++){try{if((await fetch('http://127.0.0.1:47124/final-archive-qa')).ok)break}catch{}await new Promise(r=>setTimeout(r,300))}
 const browser=spawn(process.execPath,['scripts/verify-final-archive-browser.cjs'],{env:{...process.env,BT_FINAL_ARCHIVE_EVIDENCE_DIR:out},stdio:['ignore','pipe','pipe']})
 let browserErrors='';browser.stdout.on('data',chunk=>process.stdout.write(chunk));browser.stderr.on('data',chunk=>browserErrors+=chunk)
 const browserStatus=await new Promise<number|null>(resolve=>browser.on('close',resolve));if(browserStatus)throw Error(browserErrors||'BROWSER_FAILED')
 const inventory=await ports.documents(wid,id(6));assert.equal(inventory.documents.length,3)
 assert.equal(sql('SELECT count(*) FROM bt_com_private.closing_manifests;'),2)
 const inventorySql=(await readFile('scripts/backup/final_archive_inventory.sql','utf8')).replaceAll(":'workshop_id'",literal(wid)).replaceAll(":'recovery_set_id'",literal('synthetic-database-set'))
 const backupInventory=sql(inventorySql);assert.equal(backupInventory.documents.length,7)
 const legacyInventory=sql('BEGIN; ALTER SCHEMA bt_com_private RENAME TO bt_com_absent;\n'+inventorySql+'\nROLLBACK;');assert.equal(legacyInventory.documents.length,3);console.log('PASS SQL inventory supports pre-COM backup and complete archived set')
 await writeFile(join(out,'inventory.json'),JSON.stringify(backupInventory));await writeFile(join(out,'objects-root.txt'),root)
 const recovery=spawnSync('python3',['-B','scripts/backup/test_final_archive_storage.py'],{env:{...process.env,BT_FINAL_ARCHIVE_FIXTURE_DIR:out},encoding:'utf8'})
 process.stdout.write(recovery.stdout);process.stdout.write(recovery.stderr);assert.equal(recovery.status,0,'Storage sidecar and isolated real-PDF recovery')

 console.log('BT_FINAL_ARCHIVE_LOCAL_PASS')
}finally{vite.kill();server.close()}
