import {FunctionsClient} from '@supabase/functions-js'
import {finalArchiveRepository} from '../src/expedientes/repository'
import {finalArchiveHandler} from '../server/com/finalArchiveHandler'
import {commercialDocumentHandler} from '../server/commercial/documentHandler'
import {verifyOriginalArchiveZip} from '../src/expedientes/originalZip'
import {multipuntoPdfModel} from '../src/ordenes/cp04InspectionPdf'
import type {SupabaseClient} from '@supabase/supabase-js'
import {finalArchivePorts} from '../server/com/finalArchivePorts'
/** Focused commercial integration: isolated schema fixtures and synthetic actors only. */
import {spawnSync} from 'node:child_process'
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {createHash,randomUUID} from 'node:crypto'
import assert from 'node:assert/strict'
import {quotePdf} from '../src/cp05/pdf'
const lab=process.env.BT_PLAN04BC_LAB||'',out=process.env.BT_PLAN04BC_EVIDENCE_DIR||'/tmp/bt-commercial-evidence'
assert.match(lab,/^bt-documents-\d+$/)
const id=(n:number)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0'),owner=id(2),creator=id(1)
const lit=(v:unknown)=>v===null||v===undefined?'NULL':typeof v==='boolean'?String(v):"'"+String(typeof v==='object'?JSON.stringify(v):v).replaceAll("'","''")+"'"
const args=['exec','-i',lab,'psql','-X','-qAt','-v','ON_ERROR_STOP=1','-v','VERBOSITY=verbose','-U','postgres','-d','bytetorque']
let activeSID:string|undefined
const input=(query:string,role:string,uid:string,aal:string)=>`SET ROLE ${role};SELECT set_config('request.jwt.claim.sub',${lit(uid)},false);SELECT set_config('request.jwt.claims',${lit({session_id:uid===owner?(activeSID??uid):uid,aal})},false);\n${query}`
function raw(query:string,role='postgres',uid=owner,aal='aal1'){return spawnSync('docker',args,{input:input(query,role,uid,aal),encoding:'utf8'})}
function sql(query:string,role='postgres',uid=owner,aal='aal1'):any{const r=raw(query,role,uid,aal);if(r.status){const e=new Error(r.stderr) as Error&{code:string};e.code=/ERROR:\s+([A-Z0-9]{5}):/.exec(r.stderr)?.[1]||'XX000';throw e}const line=r.stdout.trim().split('\n').at(-1)||'null';try{return JSON.parse(line)}catch{return line}}
const invoke=(name:string,params:unknown[],role='authenticated',uid=owner,aal='aal1')=>sql(`SELECT public.${name}(${params.map(lit).join(',')});`,role,uid,aal)
const results:{name:string;status:string}[]=[]
const pass=(name:string)=>{results.push({name,status:'PASS'});console.log('PASS',name)}
const grant=(uid:string,request=randomUUID(),plan='full',mode='lifetime')=>invoke('bt_creator04_manage_account',[uid,plan,mode,null,'Synthetic pilot authorization',request],'authenticated',creator,'aal2')
// Only synthetic fixtures; no previous suite is imported or executed.
for(let n=1;n<=5;n++)sql(`INSERT INTO auth.users(id,email) VALUES(${lit(id(n))},${lit('revoke-'+n+'@invalid.test')});INSERT INTO auth.sessions(id,user_id) VALUES(${lit(id(n))},${lit(id(n))});`)
sql(`INSERT INTO bt_platform_private.creators(user_id) VALUES(${lit(creator)});`)
grant(owner)
const wid=invoke('bt_plan04_create_workshop',['Synthetic revocation workshop',randomUUID()]).workshopId
sql(`SELECT bt_platform_private.configure_pilot(${lit(wid)},true,'Synthetic active pilot authorization');`)
for(const n of [4,5]){const invitation=invoke('bt_plan04_manage_mechanic',[wid,'invite','revoke-'+n+'@invalid.test',null,randomUUID()]);invoke('bt_plan04_accept_mechanic',[invitation.token],'authenticated',id(n))}
const customerId=sql(`INSERT INTO public.customers(workshop_id,full_name) VALUES(${lit(wid)},'Synthetic historical customer') RETURNING id;`,'authenticated')
const vehicleId=sql(`INSERT INTO public.vehicles(workshop_id,customer_id,plate,make,model) VALUES(${lit(wid)},${lit(customerId)},'QA1234','Synthetic','Revocation') RETURNING id;`,'authenticated')
const oid=sql(`INSERT INTO public.work_orders(workshop_id,vehicle_id,complaint) VALUES(${lit(wid)},${lit(vehicleId)},'Synthetic historical service') RETURNING id;`,'authenticated')
sql(`UPDATE public.work_orders SET status='inspecting' WHERE workshop_id=${lit(wid)} AND id=${lit(oid)};INSERT INTO public.inspection_findings(workshop_id,order_id,vehicle_id,category,result,note,resolution) VALUES(${lit(wid)},${lit(oid)},${lit(vehicleId)},'General','attention','Synthetic fixture finding','pending');`,'authenticated')
const quote=invoke('bt_cp05_open_quote',[wid,oid,randomUUID()]),item=id(301)
const saved=invoke('bt_cp05_save_quote',[wid,quote.id,quote.version,randomUUID(),{price_basis:'net',valid_days:15,terms:'',comments:'',items:[{id:item,type:'Servicio',description:'Synthetic historical service',quantity100:100,unit_price:70000}]}])
const request=randomUUID(),reserved=invoke('bt_cp05_prepare_issue',[wid,quote.id,saved.version,request,owner],'service_role')
const assets={font:new Uint8Array(await readFile('public/cp05/DejaVuSans.ttf')),logo:new Uint8Array(await readFile('assets/brand/generated/icon-192.png'))}
const hash=(b:Uint8Array)=>createHash('sha256').update(b).digest('hex'),objects=new Map<string,Uint8Array>()
const bytes=await quotePdf(reserved.payload,assets),path=wid+'/quotes/'+quote.id+'/r'+reserved.revision+'/'+reserved.payload_sha256+'.pdf'
objects.set('cp05-quote-documents/'+path,bytes);sql(`INSERT INTO storage.objects(bucket_id,name,metadata) VALUES('cp05-quote-documents',${lit(path)},${lit({size:bytes.length,mimetype:'application/pdf'})});`)
const revision=invoke('bt_cp05_finish_issue',[wid,request,owner,path,hash(bytes),bytes.length],'service_role')
invoke('bt_flow_record_quote_approval',[wid,quote.id,revision.id,randomUUID(),'phone',''])
sql(`UPDATE public.work_orders SET status='in_service' WHERE workshop_id=${lit(wid)} AND id=${lit(oid)};`,'authenticated')
const report=invoke('bt_flow_record_execution',[wid,quote.id,revision.id,randomUUID(),{[item]:'performed'},'',true])
sql(`UPDATE public.work_orders SET status='ready' WHERE workshop_id=${lit(wid)} AND id=${lit(oid)};`,'authenticated')
invoke('bt_flow_record_handover',[wid,report.id,randomUUID(),{vehicleChecked:true,workChecked:true,documentsChecked:true,pendingExplained:true},'in_person','',true])

sql(await readFile('docs/sql/BT_PLAN_04BC_REVOCATION_DELTA_CANDIDATE.sql','utf8'))
sql(await readFile('docs/sql/BT_PILOT_FIX_01_CANDIDATE.sql','utf8'))
sql(await readFile('docs/sql/BT_WORKSHOP_COMMERCIAL_01_CANDIDATE.sql','utf8'))
sql(await readFile('docs/sql/BT_COMMERCIAL_PLANS_01_CANDIDATE.sql','utf8'))
const argOrder:Record<string,string[]>={bt_commercial_status:['p_workshop_id'],bt_commercial_reserve:['p_workshop_id','p_capability','p_resource_id','p_request_id','p_snapshot_hash'],bt_commercial_finish:['p_request_id','p_actor_id','p_success','p_bytes'],bt_commercial_cached:['p_request_id','p_actor_id'],bt_final_archive_source:['p_workshop_id','p_order_id','p_revision_id','p_delivery_id'],bt_final_archive_document:['p_workshop_id','p_revision_id'],bt_final_archive_commit:['p_workshop_id','p_order_id','p_revision_id','p_delivery_id','p_request_id','p_actor_id','p_manifest']}
let storageHook:((n:number)=>void)|undefined,reads=0,actor=owner,renderCount=0
function client(role:string):SupabaseClient{return {
 auth:{getUser:async()=>({data:{user:{id:actor,email_confirmed_at:'confirmed'}},error:null})},
 rpc:async(name:string,params:Record<string,unknown>)=>{assert.ok(name in argOrder,name);try{return {data:invoke(name,argOrder[name].map(k=>params[k]??(k==='p_snapshot_hash'?'':null)),role,actor),error:null}}catch(e){return {data:null,error:{code:(e as {code:string}).code,message:(e as Error).message.match(/ERROR:\s+[A-Z0-9]+:\s+([^\n]+)/)?.[1]??'DENIED'}}}},
 from:(table:string)=>{assert.ok(['workshops','work_orders','vehicles','customers','inspection_findings'].includes(table));const f:Record<string,unknown>={};const read=()=>{const where=Object.entries(f).map(([k,v])=>{assert.ok(['workshop_id','order_id','id'].includes(k));return k+'='+lit(v)}).join(' AND ');return {data:sql(`SELECT coalesce(json_agg(t),'[]'::json) FROM (SELECT * FROM public.${table} WHERE ${where}) t;`,'authenticated',actor),error:null}};const q={select:()=>q,eq:(k:string,v:unknown)=>{f[k]=v;return q},maybeSingle:async()=>{const r=read();return {...r,data:r.data[0]??null}},single:async()=>{const r=read();return {...r,data:r.data[0]??null}},then:(resolve:(v:unknown)=>unknown)=>Promise.resolve(read()).then(resolve)};return q},
 storage:{from:(bucket:string)=>({download:async(objectPath:string)=>{storageHook?.(++reads);const b=objects.get(bucket+'/'+objectPath);return b?{data:new Blob([b.slice().buffer]),error:null}:{data:null,error:{code:'404'}}},upload:async(objectPath:string,b:Uint8Array,options:{upsert:boolean})=>{assert.equal(options.upsert,false);assert.ok(!objects.has(bucket+'/'+objectPath));objects.set(bucket+'/'+objectPath,b.slice());sql(`INSERT INTO storage.objects(bucket_id,name,metadata) VALUES(${lit(bucket)},${lit(objectPath)},${lit({size:b.length,mimetype:'application/pdf'})});`);return {data:{path:objectPath},error:null}}})}
} as unknown as SupabaseClient}
const user=client('authenticated'),trusted=client('service_role'),ports=finalArchivePorts(user,trusted,async()=>assets)
const delivery=sql(`SELECT id FROM public.bt_flow_visit_deliveries WHERE workshop_id=${lit(wid)} AND revision_id=${lit(revision.id)};`)
await ports.archive({workshopId:wid,orderId:oid,revisionId:revision.id,deliveryId:delivery,requestId:randomUUID()})
const originals=new Map(Array.from(objects.entries()).map(([k,b])=>[k,b.slice()])),set=await ports.documents(wid,revision.id)
assert.equal(set.documents.length,3);assert.equal(new Set(set.documents.map(d=>d.sha256)).size,3)
const handler=finalArchiveHandler({read:true,write:false,origin:'https://synthetic.invalid'},{userClient:()=>user,trustedClient:()=>trusted,assets:async()=>{throw Error('ZIP_MUST_NOT_RENDER')}})
const post=(req:string,workshop=wid,extra:Record<string,unknown>={})=>handler(new Request('https://synthetic.invalid',{method:'POST',headers:{origin:'https://synthetic.invalid',authorization:'Bearer synthetic','content-type':'application/json'},body:JSON.stringify({action:'zip',workshopId:workshop,revisionId:revision.id,requestId:req,...extra})}))
const count=()=>sql(`SELECT count(*) FROM bt_commercial_private.consumption WHERE state='confirmed';`),setPlan=(p:string)=>sql(`UPDATE bt_platform_private.subscriptions SET plan=${lit(p)} WHERE workshop_id=${lit(wid)};`)
if(process.env.BT_DOCUMENTS_FOCUS==='sdk'){
 const functions=new FunctionsClient('https://synthetic.invalid',{headers:{authorization:'Bearer synthetic'},customFetch:async(input,init)=>handler(new Request(String(input),init))})
 const req=randomUUID(),args={action:'zip',workshopId:wid,revisionId:revision.id,requestId:req}
 const response=await functions.invoke('bt-final-archive',{body:args});assert.equal(response.error,null);assert.ok(response.data instanceof Blob);const first=new Uint8Array(await response.data.arrayBuffer());await verifyOriginalArchiveZip(first,set);assert.equal(count(),1)
 const retry=await functions.invoke('bt-final-archive',{body:args});assert.equal(retry.error,null);assert.deepEqual(new Uint8Array(await retry.data.arrayBuffer()),first);assert.equal(count(),1);pass('Installed FunctionsClient parses binary ZIP from real SQL/HTTP and retries identical bytes once')
 const repo=finalArchiveRepository({...user,functions} as unknown as SupabaseClient,{userId:owner,role:'owner',workshop:{id:wid,name:'Synthetic',status:'active'}})
 const original=await repo.zip(revision.id),again=await repo.zip(revision.id);assert.deepEqual(original.bytes,again.bytes);assert.equal(count(),2);pass('Real frontend ZIP repository through installed SDK and real handler/SQL validates all originals and keeps one consumption')
 await writeFile(out+'/sdk-results.json',JSON.stringify({status:'PASS',count:2,cases:results,scope:'Installed FunctionsClient custom loopback fetch -> actual HTTP handler -> actual PostgreSQL authorization/ledger + frontend repository; no hosted JWT service'},null,2)+'\n');process.exit(0)
}
await mkdir(out,{recursive:true})
const paid=randomUUID(),a=await post(paid);assert.equal(a.status,200);assert.equal(a.headers.get('Content-Type'),'application/octet-stream');const zipBytes=new Uint8Array(await a.arrayBuffer());await verifyOriginalArchiveZip(zipBytes,set);assert.equal(count(),1)
await writeFile(out+'/originals.zip',zipBytes);await writeFile(out+'/original-manifest.json',JSON.stringify(set,null,2)+'\n');for(const [i,d] of set.documents.entries())await writeFile(out+'/original-'+i+'.pdf',originals.get(d.bucket+'/'+d.path)!)
pass('Real SQL and HTTP ZIP contains exactly three immutable authorized originals, no render or archive writes')
await ports.download(wid,revision.id,'quote',paid);const retry=await post(paid);assert.equal(retry.status,200);assert.deepEqual(new Uint8Array(await retry.arrayBuffer()),zipBytes);assert.equal(count(),1);pass('Preview, ZIP download and same-UUID retry retain one confirmation and exact bytes')
const concurrentRequest=randomUUID(),pair=await Promise.all([post(concurrentRequest),post(concurrentRequest)]);for(const r of pair)assert.equal(r.status,200);assert.deepEqual(new Uint8Array(await pair[0].arrayBuffer()),new Uint8Array(await pair[1].arrayBuffer()));assert.equal(count(),2);pass('Two interleaved real handler/SQL ZIP requests with one identity confirm once')
for(const body of [{kind:'quote'},{requestId:'invalid'},{path:'../../other.pdf'}]){const r=await post(paid,wid,body);assert.equal(r.status,400);assert.notEqual(r.headers.get('Content-Type'),'application/zip')}pass('Strict HTTP action rejects unknown fields, paths and invalid request identity')
const other=await post(randomUUID(),id(999));assert.equal(other.status,403);assert.equal(count(),2);pass('Another workshop is denied by actual SQL without ZIP or consumption')
actor=id(4);const forbidden=await post(randomUUID());assert.equal(forbidden.status,403);actor=owner;assert.equal(count(),2);pass('Mechanic cannot obtain owner/admin archive ZIP')
setPlan('basic');const basic=await post(randomUUID());assert.equal(basic.status,403);assert.equal((await basic.json()).error,'PLAN_CAPABILITY_REQUIRED');assert.equal(count(),2);assert.equal(invoke('bt_plan04_team',[wid]).capacity,0);pass('Basic ZIP is blocked server-side before commercial reservation; history preserved')
setPlan('plus');assert.equal(invoke('bt_plan04_team',[wid]).capacity,2)
const quoteDoc=set.documents[0]
while(invoke('bt_commercial_status',[wid]).usage.quote.used<10){const req=randomUUID();invoke('bt_commercial_reserve',[wid,'quote',revision.id,req,'']);invoke('bt_commercial_finish',[req,owner,true,'\\x'+Buffer.from(originals.get(quoteDoc.bucket+'/'+quoteDoc.path)!).toString('hex')],'service_role')}
const fullBefore=count(),exhausted=await post(randomUUID());assert.equal(exhausted.status,429);assert.equal((await exhausted.json()).error,'COMMERCIAL_QUOTA_EXHAUSTED');assert.equal(count(),fullBefore);pass('Plus exhausted real weekly quote quota rejects ZIP without new consumption')
setPlan('full');assert.equal(invoke('bt_plan04_team',[wid]).capacity,4)
const missingDoc=set.documents[1],missingKey=missingDoc.bucket+'/'+missingDoc.path;objects.delete(missingKey);const missing=await post(paid);assert.equal(missing.status,404);objects.set(missingKey,originals.get(missingKey)!.slice());pass('Missing original produces no partial ZIP and never regenerates it')
const corrupt=objects.get(missingKey)!.slice();corrupt[25]^=1;objects.set(missingKey,corrupt);const rejected=await post(paid);assert.equal(rejected.status,409);objects.set(missingKey,originals.get(missingKey)!.slice());pass('Same-size corrupt original is rejected by real hash verification without ZIP')
reads=0;storageHook=n=>{if(n===2)setPlan('basic')};const downgrade=await post(randomUUID());assert.equal(downgrade.status,403);assert.equal((await downgrade.json()).error,'PLAN_CAPABILITY_REQUIRED');storageHook=undefined;setPlan('full');pass('Plan revoked during original collection denies ZIP after preparation')
reads=0;storageHook=n=>{if(n===2)sql(`DELETE FROM auth.sessions WHERE id=${lit(owner)};`)};const revoked=await post(paid);assert.equal(revoked.status,403);storageHook=undefined
activeSID=id(303);sql(`INSERT INTO auth.sessions(id,user_id) VALUES(${lit(activeSID)},${lit(owner)});`);const oldSession=await post(paid);assert.equal(oldSession.status,409);assert.equal((await oldSession.json()).error,'DOCUMENT_OPERATION_NOT_CURRENT');const beforeExplicit=count();assert.equal((await post(randomUUID())).status,200);assert.equal(count(),beforeExplicit+1);pass('Session revocation in-flight and safe relogin require explicit new identity, no fallback or silent consumption')
const frozen=finalArchiveHandler({read:false,write:false,origin:'https://synthetic.invalid'},{userClient:()=>{throw Error('NO_CLIENT_WHEN_OFF')},trustedClient:()=>trusted,assets:async()=>assets});assert.equal((await frozen(new Request('https://synthetic.invalid',{method:'POST'}))).status,503);pass('Existing read gate OFF blocks ZIP without clients or bytes')
// Real multipunto endpoint and actual canonical SQL cache; client watermark flag cannot disable draft marking.
const light=new Uint8Array(await readFile('apps/android/assets/brand/logo-horizontal.png')),dark=new Uint8Array(await readFile('apps/android/assets/brand/logo-horizontal-dark.png'))
const commercial=commercialDocumentHandler({user:()=>user,trusted:()=>trusted,assets:async()=>{renderCount++;return {...assets,light,dark}}},'https://synthetic.invalid')
const mp=randomUUID(),multipunto=()=>commercial(new Request('https://synthetic.invalid',{method:'POST',headers:{origin:'https://synthetic.invalid',authorization:'Bearer synthetic','content-type':'application/json'},body:JSON.stringify({action:'multipunto',workshopId:wid,orderId:oid,requestId:mp,watermark:false})}))
const draft=await multipunto();assert.equal(draft.status,200);const marked=new Uint8Array(await draft.arrayBuffer());await writeFile(out+'/multipunto-watermarked.pdf',marked)
const again=await multipunto();assert.deepEqual(new Uint8Array(await again.arrayBuffer()),marked);assert.equal(renderCount,1)
const source={workshopName:sql(`SELECT name FROM public.workshops WHERE id=${lit(wid)};`),order:{order:sql(`SELECT row_to_json(t) FROM public.work_orders t WHERE id=${lit(oid)};`),vehicle:sql(`SELECT row_to_json(t) FROM public.vehicles t WHERE id=${lit(vehicleId)};`)},findings:sql(`SELECT json_agg(t) FROM public.inspection_findings t WHERE order_id=${lit(oid)};`)}
await writeFile(out+'/multipunto-model.json',JSON.stringify(multipuntoPdfModel(source),null,2)+'\n')
pass('Actual server multipunto generates marked draft, ignores client opt-out, and caches identical retry bytes once')
setPlan('basic');assert.equal((await multipunto()).status,403);setPlan('full');pass('Basic cannot export real multipunto after draft renderer change')
for(const [key,original] of originals){assert.deepEqual(objects.get(key),original,key)}assert.equal(objects.size,originals.size);pass('All archived historical originals remain byte-identical; no ZIP stored or PDF overwritten')
await writeFile(out+'/server-results.json',JSON.stringify({status:'PASS',count:results.length,cases:results,scope:'Real unchanged SQL bodies/schema fixtures + actual archive HTTP/ports, metered SQL and server PDF renderer; synthetic in-memory private Storage; two asynchronous handlers interleaved (not database stress test)',SQLModified:false,productionContacted:false},null,2)+'\n')
console.log('DOCUMENTS_UX_SQL_HTTP_PASS',results.length)
