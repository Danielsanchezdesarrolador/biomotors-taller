import type {SupabaseClient} from '@supabase/supabase-js'
import {finalArchivePorts} from '../server/com/finalArchivePorts'
/** Focused commercial integration: isolated schema fixtures and synthetic actors only. */
import {spawnSync} from 'node:child_process'
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {createHash,randomUUID} from 'node:crypto'
import assert from 'node:assert/strict'
import {quotePdf} from '../src/cp05/pdf'
const lab=process.env.BT_PLAN04BC_LAB||'',out=process.env.BT_PLAN04BC_EVIDENCE_DIR||'/tmp/bt-commercial-evidence'
assert.match(lab,/^bt-plan04bc-\d+$/)
const id=(n:number)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0'),owner=id(2),creator=id(1)
const lit=(v:unknown)=>v===null||v===undefined?'NULL':typeof v==='boolean'?String(v):"'"+String(typeof v==='object'?JSON.stringify(v):v).replaceAll("'","''")+"'"
const args=['exec','-i',lab,'psql','-X','-qAt','-v','ON_ERROR_STOP=1','-v','VERBOSITY=verbose','-U','postgres','-d','bytetorque']
const input=(query:string,role:string,uid:string,aal:string)=>`SET ROLE ${role};SELECT set_config('request.jwt.claim.sub',${lit(uid)},false);SELECT set_config('request.jwt.claims',${lit({session_id:uid,aal})},false);\n${query}`
function raw(query:string,role='postgres',uid=owner,aal='aal1'){return spawnSync('docker',args,{input:input(query,role,uid,aal),encoding:'utf8'})}
function sql(query:string,role='postgres',uid=owner,aal='aal1'):any{const r=raw(query,role,uid,aal);if(r.status){const e=new Error(r.stderr) as Error&{code:string};e.code=/ERROR:\s+([A-Z0-9]{5}):/.exec(r.stderr)?.[1]||'XX000';throw e}const line=r.stdout.trim().split('\n').at(-1)||'null';try{return JSON.parse(line)}catch{return line}}
const invoke=(name:string,params:unknown[],role='authenticated',uid=owner,aal='aal1')=>sql(`SELECT public.${name}(${params.map(lit).join(',')});`,role,uid,aal)
const results:{name:string;status:string}[]=[]
const pass=(name:string)=>{results.push({name,status:'PASS'});console.log('PASS',name)}
const denied=(f:()=>unknown,code:string,name:string)=>{assert.throws(f,(e:unknown)=>(e as {code:string}).code===code);pass(name)}
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
const status=()=>invoke('bt_commercial_status',[wid])
assert.equal(status().plan,'full');assert.equal(status().ownedWorkshops,1);assert.equal(invoke('bt_commercial_own_workshop',[]).workshop.id,wid);assert.equal(invoke('bt_commercial_own_workshop',[]).canCreate,false);pass('Full bound ownership comes from server, no second creation');denied(()=>invoke('bt_plan04_team',[wid],'authenticated',id(4)),'42501','Invited mechanic has no administrative team access')
denied(()=>invoke('bt_plan04_create_workshop',['Second workshop',randomUUID()]),'23505','Full bound account cannot create another workshop')
const reserve=(cap:string,resource=revision.id,req=randomUUID(),uid=owner)=>invoke('bt_commercial_reserve',[wid,cap,resource,req,cap==='multipunto'?'a'.repeat(64):''],'authenticated',uid)
const finish=(req:string,success=true,uid=owner)=>invoke('bt_commercial_finish',[req,uid,success,'\\x255044462d74657374'],'service_role')
let reservation=reserve('quote');finish(reservation.request_id);assert.equal(status().usage.quote.used,1);pass('Full trusted consumption is persistent and visible to workshop')
const mechanic=reserve('multipunto',oid,randomUUID(),id(4));finish(mechanic.request_id,true,id(4));
assert.equal(invoke('bt_commercial_cached',[mechanic.request_id,id(4)],'service_role'),'255044462d74657374');assert.equal('document_bytes' in mechanic,false);assert.equal('session_id' in mechanic,false);pass('Private retry cache returns exact committed bytes; public reservation never contains PDF/session data')
denied(()=>invoke('bt_commercial_reserve',[wid,'multipunto',oid,mechanic.request_id,'b'.repeat(64)],'authenticated',id(4)),'23505','Changed inspection snapshot cannot reuse an old consumption identity')
assert.equal(status().usage.multipunto.used,1);pass('Mechanic uses workshop entitlement without personal paid license')
denied(()=>invoke('bt_commercial_finish',[reservation.request_id,owner,true]),'42501','Browser cannot confirm consumption')
const failed=reserve('email');finish(failed.request_id,false);assert.equal(status().usage.email.used,0);pass('Failed provider preparation frees reservation without permanent consumption; Auth mail uncounted')
grant(owner,randomUUID(),'full','revoke');assert.equal(status().plan,'basic');assert.equal(invoke('bt_commercial_own_workshop',[]).workshop.id,wid);assert.equal(invoke('bt_commercial_own_workshop',[]).canCreate,false);pass('Basic downgrade conserves linked workshop and disables new creation')
denied(()=>reserve('quote',revision.id,reservation.request_id),'42501','Downgrade prevents replay of a more generous old license');
denied(()=>reserve('multipunto',oid),'42501','Basic direct multipunto export denied')
denied(()=>reserve('email'),'42501','Basic commercial email denied')
denied(()=>reserve('quote'),'P0001','Plan downgrade does not reset previous successful quota usage')
// Advance ledger fixture timestamps only, never device time; production uses PostgreSQL now().
sql(`UPDATE bt_commercial_private.consumption SET confirmed_at=now()-interval '49 hours',reserved_at=now()-interval '49 hours',expires_at=now()-interval '48 hours' WHERE state='confirmed';`)
reservation=reserve('quote');assert.equal(status().usage.quote.reserved,1);finish(reservation.request_id);assert.equal(status().usage.quote.used,1)
const replay=reserve('quote',revision.id,reservation.request_id);assert.equal(replay.request_id,reservation.request_id);finish(reservation.request_id);assert.equal(status().usage.quote.used,1);pass('Basic 48h reset and same-operation replay do not double count')
denied(()=>reserve('quote'),'P0001','Basic second final-document authorization denied')
denied(()=>reserve('quote',revision.id,reservation.request_id,id(4)),'23505','Another actor cannot steal request identity')
denied(()=>sql(`INSERT INTO public.inspection_findings(workshop_id,order_id,vehicle_id,category,result) VALUES(${lit(wid)},${lit(oid)},${lit(vehicleId)},'General','ok');`,'authenticated',id(4)),'42501','Basic direct inspection INSERT denied server-side')
const v2=sql(`INSERT INTO public.vehicles(workshop_id,customer_id,plate,make,model) VALUES(${lit(wid)},${lit(customerId)},'QA9999','Synthetic','Basic') RETURNING id;`,'authenticated')
const o2=sql(`INSERT INTO public.work_orders(workshop_id,vehicle_id,complaint) VALUES(${lit(wid)},${lit(v2)},'Basic legitimate intake') RETURNING id;`,'authenticated');const basicQuote=invoke('bt_cp05_open_quote',[wid,o2,randomUUID()]);pass('Basic intake and quote draft no longer require Full or invented multipunto')
denied(()=>invoke('bt_cp05_prepare_issue',[wid,basicQuote.id,basicQuote.version,randomUUID(),owner],'service_role'),'P0001','Exhausted Basic final allowance leaves additional quote in editable draft')
assert.equal(sql(`SELECT status FROM public.quotes WHERE id=${lit(basicQuote.id)};`,'authenticated'),'draft')
sql(`UPDATE bt_commercial_private.consumption SET confirmed_at=now()-interval '49 hours',expires_at=now()-interval '1 hour' WHERE state='confirmed' AND capability='quote';`)
const basicItem=randomUUID(),basicSaved=invoke('bt_cp05_save_quote',[wid,basicQuote.id,basicQuote.version,randomUUID(),{price_basis:'net',valid_days:15,terms:'',comments:'',items:[{id:basicItem,type:'Servicio',description:'Servicio Básico sin multipunto',quantity100:100,unit_price:10000}]}])
const basicRequest=randomUUID(),basicPrepared=invoke('bt_cp05_prepare_issue',[wid,basicQuote.id,basicSaved.version,basicRequest,owner],'service_role')
const basicBytes=await quotePdf(basicPrepared.payload,assets),basicPath=wid+'/quotes/'+basicQuote.id+'/r'+basicPrepared.revision+'/'+basicPrepared.payload_sha256+'.pdf'
objects.set('cp05-quote-documents/'+basicPath,basicBytes);sql(`INSERT INTO storage.objects(bucket_id,name,metadata) VALUES('cp05-quote-documents',${lit(basicPath)},${lit({size:basicBytes.length,mimetype:'application/pdf'})});`)
const basicRevision=invoke('bt_cp05_finish_issue',[wid,basicRequest,owner,basicPath,hash(basicBytes),basicBytes.length],'service_role')
invoke('bt_flow_record_quote_approval',[wid,basicQuote.id,basicRevision.id,randomUUID(),'phone',''])
sql(`UPDATE public.work_orders SET status='in_service' WHERE id=${lit(o2)};`,'authenticated')
const basicReport=invoke('bt_flow_record_execution',[wid,basicQuote.id,basicRevision.id,randomUUID(),{[basicItem]:'performed'},'',true]);sql(`UPDATE public.work_orders SET status='ready' WHERE id=${lit(o2)};`,'authenticated')
const basicDelivery=invoke('bt_flow_record_handover',[wid,basicReport.id,randomUUID(),{vehicleChecked:true,workChecked:true,documentsChecked:true,pendingExplained:true},'in_person','',true])
assert.equal(sql(`SELECT count(*) FROM public.inspection_findings WHERE order_id=${lit(o2)};`,'authenticated'),0)
const argOrder:Record<string,string[]>={bt_final_archive_source:['p_workshop_id','p_order_id','p_revision_id','p_delivery_id'],bt_final_archive_document:['p_workshop_id','p_revision_id'],bt_final_archive_commit:['p_workshop_id','p_order_id','p_revision_id','p_delivery_id','p_request_id','p_actor_id','p_manifest']}
function archiveClient(role:string):SupabaseClient{return {auth:{getUser:async()=>({data:{user:{id:owner,email_confirmed_at:'confirmed'}}})},rpc:async(name:string,params:Record<string,unknown>)=>{try{return {data:invoke(name,argOrder[name].map(k=>params[k]),role),error:null}}catch(e){return {data:null,error:{code:(e as {code:string}).code}}}},storage:{from:(bucket:string)=>({download:async(path:string)=>{const b=objects.get(bucket+'/'+path);return b?{data:new Blob([b.slice().buffer]),error:null}:{data:null,error:{code:'404'}}},upload:async(path:string,b:Uint8Array)=>{objects.set(bucket+'/'+path,new Uint8Array(b));sql(`INSERT INTO storage.objects(bucket_id,name,metadata) VALUES(${lit(bucket)},${lit(path)},${lit({size:b.length,mimetype:'application/pdf'})});`);return {data:{path},error:null}}})}} as unknown as SupabaseClient}
const basicArchive=finalArchivePorts(archiveClient('authenticated'),archiveClient('service_role'),async()=>assets)
await basicArchive.archive({workshopId:wid,orderId:o2,revisionId:basicRevision.id,deliveryId:basicDelivery.id,requestId:randomUUID()})
const archiveSet=await basicArchive.documents(wid,basicRevision.id);assert.equal(archiveSet.documents.length,3);pass('Basic completes intake, quote, approval, execution, delivery and final archive with zero fabricated inspection findings')
const basicFinal=reserve('quote',basicRevision.id);finish(basicFinal.request_id);denied(()=>reserve('quote',revision.id),'P0001','Basic selected revision excludes other final originals in same 48-hour window')
for(let n=0;n<4;n++)sql(`INSERT INTO public.customers(workshop_id,full_name) VALUES(${lit(wid)},'Synthetic Basic customer ${n}');`,'authenticated')
denied(()=>sql(`INSERT INTO public.customers(workshop_id,full_name) VALUES(${lit(wid)},'Sixth rejected');`,'authenticated'),'23514','Basic sixth persisted customer denied by direct table trigger')
sql(`UPDATE public.customers SET archived_at=now() WHERE workshop_id=${lit(wid)} AND full_name='Synthetic Basic customer 3';`);denied(()=>sql(`INSERT INTO public.customers(workshop_id,full_name) VALUES(${lit(wid)},'Archive quota bypass rejected');`,'authenticated'),'23514','Archiving does not reset the five-customer limit or delete history')
invoke('bt_creator04_manage_account',[owner,'plus','grant_days',30,'Synthetic Plus activation',randomUUID()],'authenticated',creator,'aal2')
assert.equal(status().plan,'plus');assert.equal(status().mechanicCapacity,4);assert.equal(invoke('bt_commercial_own_workshop',[]).canCreate,false);pass('Plus effective plan and four seats preserve binding')
// Clear only disposable fixture ledger by moving confirmed fixtures before current server week.
sql(`UPDATE bt_commercial_private.consumption SET confirmed_at=bt_commercial_private.week_start(now())-interval '1 second',expires_at=now()-interval '1 hour' WHERE state='confirmed';`)
for(const cap of ['quote','multipunto','email']){
 for(let n=0;n<10;n++){const row=reserve(cap,cap==='multipunto'?oid:revision.id);finish(row.request_id)}
 denied(()=>reserve(cap,cap==='multipunto'?oid:revision.id),'P0001','Plus eleventh '+cap+' operation denied')
 assert.equal(status().usage[cap].used,10)
}
pass('Independent Plus counters are shared by all workshop members')
denied(()=>reserve('quote',id(9999)),'42501','Foreign or nonexistent document ID denied')
denied(()=>invoke('bt_commercial_status',[wid],'authenticated',id(3)),'42501','Non-member cannot read workshop consumption')
const week=sql(`SELECT jsonb_build_array(bt_commercial_private.week_start('2026-09-06T12:00:00Z'),bt_commercial_private.week_start('2026-09-07T12:00:00Z'));`);assert.equal(new Date(week[0]).toISOString(),'2026-08-31T04:00:00.000Z');assert.equal(new Date(week[1]).toISOString(),'2026-09-07T03:00:00.000Z');pass('America/Santiago Monday boundary changes correctly across DST week')
sql(`UPDATE bt_commercial_private.consumption SET confirmed_at=bt_commercial_private.week_start(now())-interval '1 second',expires_at=now()-interval '1 hour' WHERE state='confirmed';`)
const nextWeek=reserve('quote');finish(nextWeek.request_id);assert.equal(status().usage.quote.used,1);assert.equal(status().usage.email.used,0);pass('Server weekly rollover resets independent periods without carrying unused slots')
// Reserve two competing final slots in separate database sessions when only one remains.
for(let n=0;n<8;n++){const row=reserve('quote');finish(row.request_id)}
const {spawn}=await import('node:child_process');const concurrent=async(query:string,uid=owner)=>new Promise<number>(resolve=>{const child=spawn('docker',args,{stdio:['pipe','ignore','ignore']});child.stdin.end(input(query,'authenticated',uid,'aal1'));child.on('close',code=>resolve(code??1))})
const attempts=await Promise.all([1,2].map(()=>concurrent(`SELECT public.bt_commercial_reserve(${lit(wid)},'quote',${lit(revision.id)},${lit(randomUUID())});`)));assert.equal(attempts.filter(x=>x===0).length,1);pass('Concurrent quota reservations cannot exceed tenth slot')
// Concurrent creation by a fresh eligible account: same account lock, exactly one result.
invoke('bt_creator04_manage_account',[id(3),'full','lifetime',null,'Synthetic eligible account',randomUUID()],'authenticated',creator,'aal2')
const creations=await Promise.all([1,2].map(n=>concurrent(`SELECT public.bt_plan04_create_workshop('Concurrent ${n}',${lit(randomUUID())});`,id(3))));assert.equal(creations.filter(x=>x===0).length,1);pass('Concurrent workshop creation binds exactly one workshop')
const own3=invoke('bt_commercial_own_workshop',[],'authenticated',id(3));assert.ok(own3.workshop);assert.equal(own3.canCreate,false);assert.equal(invoke('bt_plan04_operations_status',[own3.workshop.id],'authenticated',id(3)).operationsEnabled,true);pass('Only newly created eligible workshop gets its operational rollout atomically')
for(const n of [6,7])sql(`INSERT INTO auth.users(id,email) VALUES(${lit(id(n))},${lit('commercial-'+n+'@invalid.test')});INSERT INTO auth.sessions(id,user_id) VALUES(${lit(id(n))},${lit(id(n))});`)
invoke('bt_creator04_manage_account',[id(6),'plus','grant_days',30,'Synthetic Plus eligible',randomUUID()],'authenticated',creator,'aal2');assert.equal(invoke('bt_commercial_own_workshop',[],'authenticated',id(6)).canCreate,true);const plusWorkshop=invoke('bt_plan04_create_workshop',['Plus propio',randomUUID()],'authenticated',id(6));assert.equal(invoke('bt_plan04_operations_status',[plusWorkshop.workshopId],'authenticated',id(6)).inspectionEnabled,true);pass('Eligible Plus creates exactly one operational own workshop without permanent Full requirement')
denied(()=>invoke('bt_plan04_create_workshop',['Basic forbidden',randomUUID()],'authenticated',id(7)),'42501','Basic without own workshop cannot create a new one')
const foreignQuota=invoke('bt_commercial_status',[own3.workshop.id],'authenticated',id(3));assert.equal(foreignQuota.usage.quote.used,0);denied(()=>invoke('bt_commercial_reserve',[own3.workshop.id,'quote',revision.id,randomUUID()],'authenticated',id(3)),'42501','Foreign revision cannot consume or reveal documents in another workshop')
// A global request identity must never overwrite or disclose another tenant during a race.
const otherCustomer=sql(`INSERT INTO public.customers(workshop_id,full_name) VALUES(${lit(own3.workshop.id)},'Concurrent synthetic customer') RETURNING id;`,'authenticated',id(3))
const otherVehicle=sql(`INSERT INTO public.vehicles(workshop_id,customer_id,plate,make,model) VALUES(${lit(own3.workshop.id)},${lit(otherCustomer)},'QA5678','Synthetic','Concurrent') RETURNING id;`,'authenticated',id(3))
const otherOrder=sql(`INSERT INTO public.work_orders(workshop_id,vehicle_id,complaint) VALUES(${lit(own3.workshop.id)},${lit(otherVehicle)},'Synthetic competing operation') RETURNING id;`,'authenticated',id(3))
const sharedIdentity=randomUUID(),race=await Promise.all([[wid,oid,owner],[own3.workshop.id,otherOrder,id(3)]].map(([w,o,u])=>concurrent(`SELECT public.bt_commercial_reserve(${lit(w)},'multipunto',${lit(o)},${lit(sharedIdentity)},${lit('a'.repeat(64))});`,u)))
assert.equal(race.filter(code=>code===0).length,1)
const retained=sql(`SELECT row_to_json(c) FROM bt_commercial_private.consumption c WHERE request_id=${lit(sharedIdentity)};`)
assert.equal(retained.workshop_id,race[0]===0?wid:own3.workshop.id);assert.equal(retained.actor_id,race[0]===0?owner:id(3));assert.equal(retained.resource_id,race[0]===0?oid:otherOrder)
pass('Concurrent reuse of a global request UUID across tenants cannot overwrite or reveal the winning operation')
// Direct Storage SELECT cannot reveal paths or signed clean PDFs to authenticated users.
assert.equal(sql(`SELECT count(*) FROM storage.objects WHERE bucket_id='cp05-quote-documents';`,'authenticated'),0);pass('Restrictive Storage egress closes direct archive read/signing bypass')
const original=sql(`SELECT pdf_sha256 FROM public.quote_revisions WHERE id=${lit(revision.id)};`,'authenticated');assert.equal(original,hash(bytes));pass('Historical archived original PDF hash conserved')
const rollback=await readFile('docs/sql/BT_WORKSHOP_COMMERCIAL_01_ROLLBACK.sql','utf8');denied(()=>sql(rollback),'P0001','Rollback refuses to proceed without explicit server-egress freeze');const ledgerBefore=sql('SELECT count(*) FROM bt_commercial_private.consumption;');sql("SET bt_commercial.egress_frozen='on';\n"+rollback);assert.equal(sql('SELECT count(*) FROM bt_commercial_private.consumption;'),ledgerBefore);denied(()=>invoke('bt_commercial_status',[wid]),'42501','Functional rollback fails closed while retaining full quota history')
await mkdir(out,{recursive:true});await writeFile(out+'/commercial-server-results.json',JSON.stringify(results,null,2));console.log('COMMERCIAL_SERVER_PASS',results.length)
