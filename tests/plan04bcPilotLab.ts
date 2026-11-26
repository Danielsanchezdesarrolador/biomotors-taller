/** Focused pilot acceptance. Isolated synthetic PG17 and real PDF/archive ports; no hosted calls. */
import {spawnSync,spawn} from 'node:child_process'
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {createHash,randomUUID} from 'node:crypto'
import assert from 'node:assert/strict'
import type {SupabaseClient} from '@supabase/supabase-js'
import {quotePdf} from '../src/cp05/pdf'
import {finalArchivePorts} from '../server/com/finalArchivePorts'
const lab=process.env.BT_PLAN04BC_LAB||'',out=process.env.BT_PLAN04BC_EVIDENCE_DIR||'/tmp/bt-plan04bc-evidence'
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
for(let n=1;n<=10;n++)sql(`INSERT INTO auth.users(id,email) VALUES(${lit(id(n))},${lit('pilot-'+n+'@invalid.test')});INSERT INTO auth.sessions(id,user_id) VALUES(${lit(id(n))},${lit(id(n))});`)
sql(`INSERT INTO bt_platform_private.creators(user_id) VALUES(${lit(creator)});UPDATE auth.users SET email_confirmed_at=NULL WHERE id=${lit(id(6))};`)
denied(()=>invoke('bt_plan04_create_workshop',['Synthetic pilot',randomUUID()]),'42501','Basic personal cannot create a workshop')
denied(()=>grant(id(6)),'22023','Unconfirmed target cannot receive a grant')
denied(()=>invoke('bt_plan04_create_workshop',['Synthetic pilot',randomUUID()],'authenticated',id(6)),'42501','Unconfirmed Auth cannot create a workshop')
denied(()=>invoke('bt_creator04_manage_account',[owner,'full','lifetime',null,'Synthetic self grant',randomUUID()]),'42501','Owner cannot self-grant Full')
denied(()=>invoke('bt_creator04_manage_account',[owner,'full','lifetime',null,'Synthetic grant',randomUUID()],'authenticated',creator),'42501','Creator requires MFA AAL2')
const grantRequest=randomUUID(),license=grant(owner,grantRequest);assert.equal(license.is_lifetime,true);assert.equal(license.expires_at,null);assert.deepEqual(grant(owner,grantRequest),license);pass('Creator MFA grant is permanent and exactly idempotent')
denied(()=>grant(owner,grantRequest,'plus'),'23505','Grant request payload mismatch is rejected')
const createRequest=randomUUID(),created=invoke('bt_plan04_create_workshop',['Synthetic Pilot Workshop',createRequest]),wid=created.workshopId
assert.match(wid,/^[a-f0-9-]{36}$/);assert.notEqual(wid,'c943ad51-6d90-447b-8aa7-68866f69a4bc');assert.deepEqual(invoke('bt_plan04_create_workshop',['Synthetic Pilot Workshop',createRequest]),created)
assert.equal(sql(`SELECT user_id FROM public.workshop_memberships WHERE workshop_id=${lit(wid)} AND role='owner';`),owner);pass('New non-QA workshop derives owner from Auth and replays same request')
denied(()=>invoke('bt_plan04_create_workshop',['Another workshop',randomUUID()]),'23505','A permanent license cannot create a second workshop')
assert.equal(invoke('bt_plan04_my_status',[wid]).effectivePlan,'full');assert.deepEqual(sql(`SELECT jsonb_build_array(plan,state,is_lifetime,expires_at) FROM bt_platform_private.subscriptions WHERE workshop_id=${lit(wid)};`),['full','active',true,null]);pass('Personal license and workshop subscription are synchronized')
assert.deepEqual(invoke('bt_plan04_operations_status',[wid]),{workshopId:wid,operationsEnabled:false,documentsEnabled:false});pass('Workshop creation installs no operational permission')
denied(()=>sql(`SELECT bt_platform_private.configure_pilot(${lit(wid)},true,'Synthetic approval only');`,'authenticated'),'42501','Owner cannot activate private server rollout')
denied(()=>sql(`SELECT bt_platform_private.configure_pilot(${lit(wid)},true,'Synthetic approval only');`,'service_role'),'42501','Service API cannot activate private server rollout')
// Invitation lifecycle, eight reserved seats and two confirmed mechanics.
const invite=(email:string,request=randomUUID())=>invoke('bt_plan04_manage_mechanic',[wid,'invite',email,null,request])
const three=invite('pilot-3@invalid.test'),four=invite('pilot-4@invalid.test')
assert.equal(invoke('bt_plan04_team',[wid]).capacity,8);assert.equal(invoke('bt_plan04_team',[wid]).pending,2)
sql(`UPDATE auth.users SET email_confirmed_at=NULL WHERE id=${lit(id(3))};`)
denied(()=>invoke('bt_plan04_accept_mechanic',[three.token],'authenticated',id(3)),'42501','Invitation acceptance requires confirmed registration')
sql(`UPDATE auth.users SET email_confirmed_at=now() WHERE id=${lit(id(3))};`)
denied(()=>invoke('bt_plan04_accept_mechanic',[three.token],'authenticated',foreign),'42501','Invitation token cannot be accepted by another email')
for(const [user,invitation] of [[id(3),three],[id(4),four]] as const)assert.equal(invoke('bt_plan04_accept_mechanic',[invitation.token],'authenticated',user).workshopId,wid)
const team=invoke('bt_plan04_team',[wid]);assert.equal(team.active,2);assert.equal(team.pending,0);assert.equal(team.capacity,8);assert.equal(invoke('bt_plan04_my_status',[null],'authenticated',id(3)).effectivePlan,'basic');pass('Two confirmed mechanics join Full with eight seats without personal payment')
denied(()=>invoke('bt_plan04_accept_mechanic',[three.token],'authenticated',id(3)),'42501','Accepted invitation is single-use')
denied(()=>invoke('bt_plan04_manage_mechanic',[wid,'invite','invalid@invalid.test',null,randomUUID()],'authenticated',id(3)),'42501','Mechanic cannot administer the team')
const old=invite('pilot-7@invalid.test'),rotated=invoke('bt_plan04_manage_mechanic',[wid,'rotate',null,old.id,randomUUID()])
denied(()=>invoke('bt_plan04_accept_mechanic',[old.token],'authenticated',id(7)),'42501','Rotation invalidates the old token')
invoke('bt_plan04_manage_mechanic',[wid,'revoke',null,old.id,randomUUID()]);denied(()=>invoke('bt_plan04_accept_mechanic',[rotated.token],'authenticated',id(7)),'42501','Revocation invalidates the new token')
const expired=invite('pilot-8@invalid.test');sql(`UPDATE bt_platform_private.mechanic_invites SET expires_at=now()-interval '1 second' WHERE id=${lit(expired.id)};`)
denied(()=>invoke('bt_plan04_accept_mechanic',[expired.token],'authenticated',id(8)),'42501','Expired invitation cannot be accepted')
for(let n=0;n<6;n++)invite('reserved-'+n+'@invalid.test')
denied(()=>invite('ninth@invalid.test'),'23514','Pending reservations and active mechanics share the eight-seat limit')
assert.equal(sql(`SELECT count(*) FROM bt_platform_private.team_events WHERE result ? 'token';`),0);pass('Confidential tokens are hashed and absent from event results')
const membership=sql(`SELECT id FROM public.workshop_memberships WHERE workshop_id=${lit(wid)} AND user_id=${lit(id(4))};`)
invoke('bt_plan04_manage_mechanic',[wid,'disable',null,membership,randomUUID()])
denied(()=>invoke('bt_plan04_my_status',[wid],'authenticated',id(4)),'42501','Disabling a mechanic revokes workshop access without deleting the account')
// A second fully synthetic tenant must remain isolated and OFF.
grant(foreign);const other=invoke('bt_plan04_create_workshop',['Synthetic Other Workshop',randomUUID()],'authenticated',foreign).workshopId
denied(()=>invoke('bt_plan04_profile',[wid],'authenticated',foreign),'42501','Foreign owner cannot read pilot commercial data')
denied(()=>invoke('bt_plan04_operations_status',[wid],'authenticated',foreign),'42501','Capability RPC is bound to active membership')
assert.equal(invoke('bt_plan04_operations_status',[other],'authenticated',foreign).operationsEnabled,false)
sql(`SELECT bt_platform_private.configure_pilot(${lit(wid)},true,'Synthetic explicit server approval');`)
assert.equal(invoke('bt_plan04_operations_status',[wid]).operationsEnabled,true);assert.equal(invoke('bt_plan04_operations_status',[other],'authenticated',foreign).operationsEnabled,false);pass('Controlled enrollment enables only the explicitly selected non-QA workshop')
// Independent Agenda kill switch must not regress the already approved physical workflow.
sql(`UPDATE bt_agenda_private.rollout SET enabled=false WHERE workshop_id=${lit(wid)};`)
assert.equal(invoke('bt_plan04_operations_status',[wid]).operationsEnabled,true);pass('Agenda OFF does not disable the approved physical guided workflow')
denied(()=>invoke('bt_agenda_command',[wid,randomUUID(),'prepare',{vehicle_id:id(201),service:'Blocked scheduling'}]),'42501','Independent Agenda OFF still rejects its direct RPC')
sql(`UPDATE bt_agenda_private.rollout SET enabled=true WHERE workshop_id=${lit(wid)};`)
sql(`SELECT bt_platform_private.configure_pilot(${lit(other)},false,'Synthetic unconfigured disable');`)
assert.equal(invoke('bt_plan04_operations_status',[other],'authenticated',foreign).documentsEnabled,false);pass('Disabling an unenrolled workshop cannot grant historical archive access')
const profile=invoke('bt_plan04_update_profile',[wid,'Synthetic Commercial Identity','contact@invalid.test','000000','Synthetic address'])
assert.equal(profile.name,'Synthetic Commercial Identity');assert.equal(sql("SELECT count(*) FROM storage.buckets WHERE id IN ('bt-workshop-branding','bt-workshop-quote-templates');"),0);pass('Commercial text works without activating logo or template buckets')
const customerId=sql(`INSERT INTO public.customers(workshop_id,full_name) VALUES(${lit(wid)},'Synthetic customer') RETURNING id;`,'authenticated')
const vehicleId=sql(`INSERT INTO public.vehicles(workshop_id,customer_id,plate,make,model) VALUES(${lit(wid)},${lit(customerId)},'QA1234','Synthetic','Pilot') RETURNING id;`,'authenticated')
assert.equal(sql(`SELECT count(*) FROM public.customers WHERE workshop_id=${lit(wid)};`,'authenticated',foreign),0)
denied(()=>sql(`INSERT INTO public.customers(workshop_id,full_name) VALUES(${lit(wid)},'Foreign write');`,'authenticated',foreign),'42501','CP03 RLS denies writes across workshop boundary')
const command=(kind:string,data:unknown)=>invoke('bt_agenda_command',[wid,randomUUID(),kind,data])
const plan=command('prepare',{vehicle_id:vehicleId,service:'Synthetic planned service'}),oid=plan.order_id
const quote=invoke('bt_cp05_open_quote',[wid,oid,randomUUID()]),item=id(301)
const saved=invoke('bt_cp05_save_quote',[wid,quote.id,quote.version,randomUUID(),{price_basis:'net',valid_days:15,terms:'',comments:'OK',items:[{id:item,type:'Servicio',description:'Synthetic service',quantity100:100,unit_price:70000}]}])
const request=randomUUID(),reserved=invoke('bt_cp05_prepare_issue',[wid,quote.id,saved.version,request,owner],'service_role')
assert.equal(reserved.payload.workshop.name,'Synthetic Commercial Identity');assert.equal(reserved.payload.workshop.contactEmail,'contact@invalid.test');assert.equal(reserved.payload.order.intake_phase,'planned');assert.equal(reserved.payload.quote.terms,'')
invoke('bt_plan04_update_profile',[wid,'Synthetic updated identity','','',''])
assert.deepEqual(invoke('bt_cp05_prepare_issue',[wid,quote.id,saved.version,request,owner],'service_role'),reserved);pass('New PDF snapshot uses commercial identity, short texts and Agenda phase; retries retain the original snapshot')
const assets={font:new Uint8Array(await readFile('public/cp05/DejaVuSans.ttf')),logo:new Uint8Array(await readFile('assets/brand/generated/icon-192.png'))}
const hash=(b:Uint8Array)=>createHash('sha256').update(b).digest('hex'),objects=new Map<string,Uint8Array>()
const bytes=await quotePdf(reserved.payload,assets),path=wid+'/quotes/'+quote.id+'/r'+reserved.revision+'/'+reserved.payload_sha256+'.pdf'
objects.set('cp05-quote-documents/'+path,bytes);sql(`INSERT INTO storage.objects(bucket_id,name,metadata) VALUES('cp05-quote-documents',${lit(path)},${lit({size:bytes.length,mimetype:'application/pdf'})});`)
const revision=invoke('bt_cp05_finish_issue',[wid,request,owner,path,hash(bytes),bytes.length],'service_role')
denied(()=>command('schedule',{quote_id:quote.id,revision_id:revision.id,local_start:'2030-01-01T09:30',duration_minutes:60,notes:'',tentative:false}),'55000','Agenda cannot confirm a visit without current approval')
const approval=invoke('bt_flow_record_quote_approval',[wid,quote.id,revision.id,randomUUID(),'phone','']);assert.equal(approval.revision_id,revision.id)
const tomorrow=sql("SELECT ((statement_timestamp() AT TIME ZONE 'America/Santiago')::date+1)::text;")
const booking=command('schedule',{quote_id:quote.id,revision_id:revision.id,local_start:tomorrow+'T09:30',duration_minutes:60,notes:'',tentative:false}).appointment
command('receive',{id:booking.id,version:booking.version,odometer:1000,complaint:'Synthetic received service',confirmed:true})
sql(`UPDATE public.work_orders SET status='inspecting' WHERE workshop_id=${lit(wid)} AND id=${lit(oid)};`,'authenticated');sql(`INSERT INTO public.inspection_findings(workshop_id,order_id,vehicle_id,category,result,note,resolution) VALUES(${lit(wid)},${lit(oid)},${lit(vehicleId)},'General','attention','Synthetic fixture finding','pending');`,'authenticated',id(3));pass('Agenda prepares, schedules and receives a new workshop visit; its assigned mechanic records a synthetic inspection')
assert.equal(sql(`WITH changed AS(UPDATE public.work_orders SET complaint='Foreign mutation' WHERE workshop_id=${lit(wid)} AND id=${lit(oid)} RETURNING 1) SELECT count(*) FROM changed;`,'authenticated',foreign),0);pass('CP04 RLS prevents a foreign workshop from mutating the pilot order')
sql(`UPDATE public.work_orders SET status='in_service' WHERE workshop_id=${lit(wid)} AND id=${lit(oid)};`,'authenticated')
denied(()=>invoke('bt_flow_record_execution',[wid,quote.id,revision.id,randomUUID(),{[item]:'performed'},'',true],'authenticated',foreign),'42501','Foreign owner cannot execute work on another workshop order')
const report=invoke('bt_flow_record_execution',[wid,quote.id,revision.id,randomUUID(),{[item]:'performed'},'',true]);assert.equal(report.quoted_total,83300)
sql(`UPDATE public.work_orders SET status='ready' WHERE workshop_id=${lit(wid)} AND id=${lit(oid)};`,'authenticated')
const delivery=invoke('bt_flow_record_handover',[wid,report.id,randomUUID(),{vehicleChecked:true,workChecked:true,documentsChecked:true,pendingExplained:true},'in_person','',true]);assert.equal(delivery.order_id,oid);pass('Current approval, execution and confirmed handover complete under the new workshop scope')
const argOrder:Record<string,string[]>={bt_final_archive_source:['p_workshop_id','p_order_id','p_revision_id','p_delivery_id'],bt_final_archive_document:['p_workshop_id','p_revision_id'],bt_final_archive_commit:['p_workshop_id','p_order_id','p_revision_id','p_delivery_id','p_request_id','p_actor_id','p_manifest']}
let renders=0,uploads=0
function client(role:string):SupabaseClient{return {auth:{getUser:async()=>({data:{user:{id:owner,email_confirmed_at:'2026-11-26'}}})},rpc:async(name:string,params:Record<string,unknown>)=>{try{return {data:invoke(name,argOrder[name].map(k=>params[k]),role),error:null}}catch(e){return {data:null,error:{code:(e as {code:string}).code}}}},storage:{from:(bucket:string)=>({download:async(objectPath:string)=>{const b=objects.get(bucket+'/'+objectPath);return b?{data:new Blob([b.slice().buffer]),error:null}:{error:{code:'404'}}},upload:async(objectPath:string,b:Uint8Array,options:{upsert:boolean})=>{assert.equal(options.upsert,false);assert.ok(!objects.has(bucket+'/'+objectPath));objects.set(bucket+'/'+objectPath,new Uint8Array(b));uploads++;sql(`INSERT INTO storage.objects(bucket_id,name,metadata) VALUES(${lit(bucket)},${lit(objectPath)},${lit({size:b.length,mimetype:'application/pdf'})});`);return {data:{path:objectPath},error:null}}})}} as unknown as SupabaseClient}
const archive=finalArchivePorts(client('authenticated'),client('service_role'),async()=>{renders++;return assets})
const archiveRequest={workshopId:wid,orderId:oid,revisionId:revision.id,deliveryId:delivery.id,requestId:randomUUID()}
await archive.archive(archiveRequest)
const originals=await Promise.all((['quote','report','handover'] as const).map(k=>archive.download(wid,revision.id,k)))
for(const pdf of originals){assert.equal(hash(pdf.bytes),pdf.doc.sha256);assert.equal(new TextDecoder().decode(pdf.bytes.slice(0,5)),'%PDF-')}
assert.equal(hash(originals[0].bytes),hash(bytes));const counts=[renders,uploads];await archive.archive({...archiveRequest,requestId:randomUUID()});assert.deepEqual([renders,uploads],counts);pass('Final archive produces three genuine PDFs with exact hashes and idempotent original recovery')
denied(()=>invoke('bt_final_archive_source',[wid,oid,revision.id,delivery.id],'authenticated',foreign),'42501','Final archive denies a foreign workshop despite valid order and revision IDs')
const manifestBefore=sql(`SELECT archive_manifest FROM bt_com_private.closing_manifests WHERE workshop_id=${lit(wid)};`)
sql(`SELECT bt_platform_private.configure_pilot(${lit(wid)},false,'Synthetic server disable approval');`)
assert.deepEqual(invoke('bt_plan04_operations_status',[wid]),{workshopId:wid,operationsEnabled:false,documentsEnabled:true})
denied(()=>command('prepare',{vehicle_id:vehicleId,service:'Blocked after disable'}),'42501','Server disable blocks Agenda writes even through direct RPC')
denied(()=>invoke('bt_flow_record_quote_approval',[wid,quote.id,revision.id,randomUUID(),'phone','']),'42501','Server disable blocks workflow writes even through direct RPC')
assert.equal(hash((await archive.download(wid,revision.id,'quote')).bytes),hash(bytes));assert.deepEqual(sql(`SELECT archive_manifest FROM bt_com_private.closing_manifests WHERE workshop_id=${lit(wid)};`),manifestBefore);pass('Server disable preserves read-only immutable historical documents')
// Subscription downgrade/revoke synchronizes but never deletes members, original PDFs or workshop.
grant(owner,randomUUID(),'full','revoke');assert.equal(invoke('bt_plan04_my_status',[wid]).effectivePlan,'basic');assert.equal(invoke('bt_plan04_my_status',[null]).effectivePlan,'basic')
assert.equal(invoke('bt_plan04_team',[wid]).active,1);assert.equal(invoke('bt_plan04_team',[wid]).capacity,0)
denied(()=>invite('after-revoke@invalid.test'),'23514','Revoked subscription prevents additional invitations')
denied(()=>sql(`SELECT bt_platform_private.configure_pilot(${lit(wid)},true,'Synthetic rejected reactivation');`),'42501','Pilot enrollment requires the bound permanent Full grant')
assert.equal(hash((await archive.download(wid,revision.id,'quote')).bytes),hash(bytes));pass('Revocation synchronizes plans while preserving workshop, mechanics and PDF history')
sql(`DELETE FROM auth.sessions WHERE user_id=${lit(owner)};`)
denied(()=>invoke('bt_plan04_team',[wid]),'42501','Revoked Auth session cannot administer mechanics')
// Check request payload binding for the legacy Creator path on an unbound synthetic workshop.
const legacy=id(900);sql(`INSERT INTO public.workshops(id,name) VALUES(${lit(legacy)},'Synthetic legacy tenant');`)
const legacyRequest=randomUUID(),legacyArgs=[legacy,'full','lifetime',null,'Synthetic legacy grant',legacyRequest]
const prior=invoke('bt_creator_manage_subscription',legacyArgs,'authenticated',creator,'aal2');assert.deepEqual(invoke('bt_creator_manage_subscription',legacyArgs,'authenticated',creator,'aal2'),prior)
denied(()=>invoke('bt_creator_manage_subscription',[legacy,'plus','lifetime',null,'Synthetic legacy grant',legacyRequest],'authenticated',creator,'aal2'),'23505','Legacy Creator retry also binds complete request payload')
// Concurrent enrollment/seat contention are scoped with the existing advisory locks.
function concurrent(query:string,uid:string){return new Promise<number>(resolve=>{const p=spawn('docker',args,{stdio:['pipe','ignore','ignore']});p.on('error',()=>resolve(-1));p.on('exit',code=>resolve(code??-1));p.stdin.end(input(query,'authenticated',uid,'aal1'))})}
grant(id(9));const outcomes=await Promise.all([1,2].map(()=>concurrent(`SELECT public.bt_plan04_create_workshop('Synthetic race',gen_random_uuid());`,id(9))))
assert.deepEqual(outcomes.map(x=>x===0).sort(),[false,true]);assert.equal(sql("SELECT count(*) FROM public.workshops WHERE name='Synthetic race';"),1);pass('Concurrent creation commits exactly one workshop per license')
const raceWid=sql(`SELECT bound_workshop_id FROM bt_platform_private.account_entitlements WHERE user_id=${lit(id(9))};`)
for(let n=0;n<7;n++)invoke('bt_plan04_manage_mechanic',[raceWid,'invite','race-reserved-'+n+'@invalid.test',null,randomUUID()],'authenticated',id(9))
const seats=await Promise.all([1,2].map(n=>concurrent(`SELECT public.bt_plan04_manage_mechanic(${lit(raceWid)},'invite',${lit('race-last-'+n+'@invalid.test')},NULL,gen_random_uuid());`,id(9))))
assert.deepEqual(seats.map(x=>x===0).sort(),[false,true]);assert.equal(invoke('bt_plan04_team',[raceWid],'authenticated',id(9)).pending,8);pass('Concurrent invitation requests cannot exceed Full capacity')
assert.equal(sql("SELECT count(*) FROM storage.buckets WHERE id='bt-workshop-branding';"),0);pass('Logo bucket remains absent throughout the consolidated validation')
await mkdir(out,{recursive:true});for(const pdf of originals)await writeFile(out+'/'+pdf.doc.kind+'.pdf',pdf.bytes)
await writeFile(out+'/sql-results.json',JSON.stringify({environment:'PostgreSQL17 synthetic network-none; Storage adapter is an in-memory fake with SQL object metadata',checks:results.length,results,documents:originals.map(p=>({kind:p.doc.kind,sha256:hash(p.bytes),byteLength:p.bytes.length}))},null,2)+'\n')
console.log('PLAN04BC_FOCUSED_ACCEPTANCE_PASS',results.length)
