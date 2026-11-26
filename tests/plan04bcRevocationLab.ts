/** Delta regression only: revoke Full while all workshop rollouts stay enabled. */
import {spawnSync} from 'node:child_process'
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {createHash,randomUUID} from 'node:crypto'
import assert from 'node:assert/strict'
import type {SupabaseClient} from '@supabase/supabase-js'
import {quotePdf} from '../src/cp05/pdf'
import {finalArchivePorts} from '../server/com/finalArchivePorts'
const lab=process.env.BT_PLAN04BC_LAB||'',out=process.env.BT_PLAN04BC_EVIDENCE_DIR||'/tmp/bt-plan04bc-revocation-evidence'
assert.match(lab,/^bt-plan04bc-\d+$/)
const id=(n:number)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0'),owner=id(2),creator=id(1),foreign=id(5)
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
const delivery=invoke('bt_flow_record_handover',[wid,report.id,randomUUID(),{vehicleChecked:true,workChecked:true,documentsChecked:true,pendingExplained:true},'in_person','',true])
const argOrder:Record<string,string[]>={bt_final_archive_source:['p_workshop_id','p_order_id','p_revision_id','p_delivery_id'],bt_final_archive_document:['p_workshop_id','p_revision_id'],bt_final_archive_commit:['p_workshop_id','p_order_id','p_revision_id','p_delivery_id','p_request_id','p_actor_id','p_manifest']}
let renders=0,uploads=0
function client(role:string):SupabaseClient{return {auth:{getUser:async()=>({data:{user:{id:owner,email_confirmed_at:'2026-11-26'}}})},rpc:async(name:string,params:Record<string,unknown>)=>{try{return {data:invoke(name,argOrder[name].map(k=>params[k]),role),error:null}}catch(e){return {data:null,error:{code:(e as {code:string}).code}}}},storage:{from:(bucket:string)=>({download:async(objectPath:string)=>{const b=objects.get(bucket+'/'+objectPath);return b?{data:new Blob([b.slice().buffer]),error:null}:{error:{code:'404'}}},upload:async(objectPath:string,b:Uint8Array,options:{upsert:boolean})=>{assert.equal(options.upsert,false);assert.ok(!objects.has(bucket+'/'+objectPath));objects.set(bucket+'/'+objectPath,new Uint8Array(b));uploads++;sql(`INSERT INTO storage.objects(bucket_id,name,metadata) VALUES(${lit(bucket)},${lit(objectPath)},${lit({size:b.length,mimetype:'application/pdf'})});`);return {data:{path:objectPath},error:null}}})}} as unknown as SupabaseClient}
const archive=finalArchivePorts(client('authenticated'),client('service_role'),async()=>{renders++;return assets})
const archiveRequest={workshopId:wid,orderId:oid,revisionId:revision.id,deliveryId:delivery.id,requestId:randomUUID()}
await archive.archive(archiveRequest)
const originals=await Promise.all((['quote','report','handover'] as const).map(k=>archive.download(wid,revision.id,k)))
const historicalSnapshot=()=>sql(`SELECT jsonb_build_object(
 'workshop',(SELECT to_jsonb(w) FROM public.workshops w WHERE id=${lit(wid)}),
 'members',(SELECT jsonb_agg(to_jsonb(m) ORDER BY id) FROM public.workshop_memberships m WHERE workshop_id=${lit(wid)}),
 'customers',(SELECT jsonb_agg(to_jsonb(c) ORDER BY id) FROM public.customers c WHERE workshop_id=${lit(wid)}),
 'vehicles',(SELECT jsonb_agg(to_jsonb(v) ORDER BY id) FROM public.vehicles v WHERE workshop_id=${lit(wid)}),
 'orders',(SELECT jsonb_agg(to_jsonb(o) ORDER BY id) FROM public.work_orders o WHERE workshop_id=${lit(wid)}),
 'findings',(SELECT jsonb_agg(to_jsonb(f) ORDER BY id) FROM public.inspection_findings f WHERE workshop_id=${lit(wid)}),
 'revisions',(SELECT jsonb_agg(to_jsonb(r) ORDER BY id) FROM public.quote_revisions r WHERE workshop_id=${lit(wid)}),
 'manifests',(SELECT jsonb_agg(to_jsonb(m) ORDER BY id) FROM bt_com_private.closing_manifests m WHERE workshop_id=${lit(wid)}),
 'storage',(SELECT jsonb_agg(to_jsonb(o) ORDER BY id) FROM storage.objects o));`)
const rollouts=()=>sql(`SELECT jsonb_build_object('flow',(SELECT enabled FROM bt_flow_live_private.rollout WHERE workshop_id=${lit(wid)}),'agenda',(SELECT enabled FROM bt_agenda_private.rollout WHERE workshop_id=${lit(wid)}),'archive',(SELECT archive_enabled FROM bt_com_private.rollout WHERE workshop_id=${lit(wid)}),'read',(SELECT archive_read_enabled FROM bt_com_private.rollout WHERE workshop_id=${lit(wid)}));`)
const before=historicalSnapshot(),flags=rollouts();assert.deepEqual(flags,{flow:true,agenda:true,archive:true,read:true});assert.equal(before.members.length,3)
const signature=()=>sql(`SELECT jsonb_agg(jsonb_build_array(oid,proowner,proacl,prosecdef,proconfig,pg_get_function_identity_arguments(oid)) ORDER BY oid) FROM pg_proc WHERE oid IN('bt_cp05_private.authorize(uuid,uuid,boolean)'::regprocedure,'bt_flow_live_private.authorize(uuid)'::regprocedure,'bt_com_private.archive_authorize(uuid,uuid,boolean)'::regprocedure,'public.bt_plan04_operations_status(uuid)'::regprocedure);`)
const protections=signature()
// Crucial trigger: revoke while ALL rollout rows remain ON. Never call configure_pilot(false).
grant(owner,randomUUID(),'full','revoke')
assert.deepEqual(rollouts(),flags);assert.equal(invoke('bt_plan04_my_status',[wid]).effectivePlan,'basic');pass('Full revoked on an enabled workshop; all four rollout flags remain true')
assert.equal(invoke('bt_plan04_operations_status',[wid]).operationsEnabled,true)
sql(`SELECT bt_flow_live_private.authorize(${lit(wid)});SELECT bt_cp05_private.authorize(${lit(wid)},${lit(owner)},true);SELECT bt_com_private.archive_authorize(${lit(wid)},${lit(owner)},true);`)
pass('Original candidate defect reproduced: revoked license still passes operational authorization')
sql(await readFile('docs/sql/BT_PLAN_04BC_REVOCATION_DELTA_CANDIDATE.sql','utf8'))
assert.deepEqual(signature(),protections);pass('Incremental delta preserves existing function OIDs, ACL, owner, security mode and search_path')
assert.deepEqual(rollouts(),flags);assert.deepEqual(invoke('bt_plan04_operations_status',[wid]),{workshopId:wid,operationsEnabled:false,documentsEnabled:true});pass('Server capability now denies operations independently of rollout state and retains document reads')
denied(()=>invoke('bt_agenda_command',[wid,randomUUID(),'prepare',{vehicle_id:vehicleId,service:'Must be blocked'}]),'42501','Revoked Full denies direct Agenda RPC')
denied(()=>invoke('bt_cp05_open_quote',[wid,oid,randomUUID()]),'42501','Revoked Full denies direct CP05 mutation RPC')
denied(()=>invoke('bt_cp05_prepare_issue',[wid,quote.id,saved.version,randomUUID(),owner],'service_role'),'42501','Revoked Full denies trusted CP05 issuance preparation')
denied(()=>invoke('bt_cp05_finish_issue',[wid,request,owner,path,hash(bytes),bytes.length],'service_role'),'42501','Revoked Full denies trusted CP05 issuance completion')
denied(()=>invoke('bt_flow_record_quote_approval',[wid,quote.id,revision.id,randomUUID(),'phone','']),'42501','Revoked Full denies approval RPC')
denied(()=>invoke('bt_flow_record_execution',[wid,quote.id,revision.id,randomUUID(),{[item]:'performed'},'',true]),'42501','Revoked Full denies execution RPC')
denied(()=>invoke('bt_flow_record_handover',[wid,report.id,randomUUID(),{vehicleChecked:true,workChecked:true,documentsChecked:true,pendingExplained:true},'in_person','',true]),'42501','Revoked Full denies handover RPC')
denied(()=>invoke('bt_final_archive_source',[wid,oid,revision.id,delivery.id]),'42501','Revoked Full denies archive write/source RPC, including completed retries')
const manifest=sql(`SELECT archive_manifest FROM bt_com_private.closing_manifests WHERE workshop_id=${lit(wid)};`)
denied(()=>invoke('bt_final_archive_commit',[wid,oid,revision.id,delivery.id,randomUUID(),owner,manifest],'service_role'),'42501','Revoked Full denies trusted archive commit RPC')
denied(()=>invoke('bt_plan04_manage_mechanic',[wid,'invite','blocked@invalid.test',null,randomUUID()]),'23514','Existing capacity guard still prevents premium invitations after revocation')
for(const original of originals){const restored=await archive.download(wid,revision.id,original.doc.kind);assert.equal(hash(restored.bytes),hash(original.bytes));assert.equal(hash(restored.bytes),original.doc.sha256)}
assert.equal(renders,2);assert.equal(uploads,2);pass('All three authorized historical PDFs remain byte-identical and download without rendering or uploads')
assert.equal(sql(`SELECT count(*) FROM public.quote_revisions WHERE workshop_id=${lit(wid)};`,'authenticated'),1);pass('Historical CP05 revisions remain readable under existing membership/RLS')
denied(()=>invoke('bt_final_archive_document',[wid,revision.id],'authenticated',foreign),'42501','License-independent historical reads still deny foreign users')
assert.deepEqual(historicalSnapshot(),before);assert.deepEqual(rollouts(),flags);pass('Members, clients, vehicles, orders, findings, revisions, manifests and Storage metadata remain unchanged')
// A reinstated synchronized Full grant restores authorization without reenrollment.
grant(owner);assert.equal(invoke('bt_plan04_operations_status',[wid]).operationsEnabled,true)
sql(`SELECT bt_flow_live_private.authorize(${lit(wid)});SELECT bt_cp05_private.authorize(${lit(wid)},${lit(owner)},true);SELECT bt_com_private.archive_authorize(${lit(wid)},${lit(owner)},true);`)
assert.deepEqual(rollouts(),flags);pass('Valid restored Full permits existing server authorizers without toggling any rollout')
// Regression with the fix already installed: revoke an active Full while the pilot stays ON.
grant(owner,randomUUID(),'full','revoke')
assert.deepEqual(rollouts(),flags);assert.deepEqual(invoke('bt_plan04_operations_status',[wid]),{workshopId:wid,operationsEnabled:false,documentsEnabled:true});pass('Post-delta regression: revoking active Full immediately removes operations while all rollouts stay enabled')
denied(()=>invoke('bt_agenda_command',[wid,randomUUID(),'prepare',{vehicle_id:vehicleId,service:'Blocked after live revocation'}]),'42501','Post-delta revocation rejects direct server operation without any prior disable')
for(const original of originals)assert.equal(hash((await archive.download(wid,revision.id,original.doc.kind)).bytes),hash(original.bytes))
assert.deepEqual(historicalSnapshot(),before);pass('Post-delta revocation preserves all three authorized historical PDFs and every historical row')
grant(owner)
sql(`UPDATE bt_platform_private.subscriptions SET state='revoked' WHERE workshop_id=${lit(wid)};`)
assert.equal(invoke('bt_plan04_operations_status',[wid]).operationsEnabled,false);denied(()=>invoke('bt_flow_record_quote_approval',[wid,quote.id,revision.id,randomUUID(),'phone','']),'42501','Subscription/entitlement mismatch fails closed for premium writes')
sql(`UPDATE bt_platform_private.subscriptions SET state='active' WHERE workshop_id=${lit(wid)};DELETE FROM bt_platform_private.account_entitlements WHERE user_id=${lit(owner)};`)
assert.equal(invoke('bt_plan04_operations_status',[wid]).operationsEnabled,false);pass('Missing entitlement cannot bypass licensing because creation identity persists')
const legacy=id(900);sql(`INSERT INTO public.workshops(id,name) VALUES(${lit(legacy)},'Synthetic legacy QA');INSERT INTO public.workshop_memberships(workshop_id,user_id,role) VALUES(${lit(legacy)},${lit(foreign)},'owner');INSERT INTO bt_flow_live_private.rollout(workshop_id,enabled) VALUES(${lit(legacy)},true);INSERT INTO bt_com_private.rollout(workshop_id,archive_enabled,archive_read_enabled) VALUES(${lit(legacy)},true,true);`)
assert.equal(invoke('bt_plan04_operations_status',[legacy],'authenticated',foreign).operationsEnabled,true);sql(`SELECT bt_flow_live_private.authorize(${lit(legacy)});`,'postgres',foreign);pass('Existing unbound legacy QA pilot keeps its previously approved authorization contract')
await mkdir(out,{recursive:true})
await writeFile(out+'/revocation-results.json',JSON.stringify({scope:'Only license-revocation delta; synthetic PostgreSQL17 network-none with in-memory Storage',checks:results.length,results,rolloutsUnchanged:rollouts(),historicalDataUnchanged:true,functionsSecurityMetadataUnchanged:true,documents:originals.map(p=>({kind:p.doc.kind,sha256:hash(p.bytes),byteLength:p.bytes.length}))},null,2)+'\n')
console.log('PLAN04BC_REVOCATION_DELTA_PASS',results.length)
