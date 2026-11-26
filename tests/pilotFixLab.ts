/** Delta regression only: revoke Full while all workshop rollouts stay enabled. */
import {spawnSync} from 'node:child_process'
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {createHash,randomUUID} from 'node:crypto'
import assert from 'node:assert/strict'
import {quotePdf} from '../src/cp05/pdf'
const lab=process.env.BT_PLAN04BC_LAB||'',out=process.env.BT_PLAN04BC_EVIDENCE_DIR||'/tmp/bt-pilot-fix-evidence'
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
const finding=sql(`SELECT id FROM public.inspection_findings WHERE order_id=${lit(oid)};`)
const update=(set:string,uid=owner)=>sql(`UPDATE public.inspection_findings SET ${set} WHERE workshop_id=${lit(wid)} AND id=${lit(finding)};`,'authenticated',uid)
denied(()=>update("note='Cannot rewrite diagnosis'"),'42501','Delivered inspection diagnosis immutable for owner')
denied(()=>update("resolution='resolved'",id(4)),'42501','Mechanic cannot modify delivered findings')
denied(()=>sql(`INSERT INTO public.inspection_findings(workshop_id,order_id,vehicle_id,category,result) VALUES(${lit(wid)},${lit(oid)},${lit(vehicleId)},'General','ok');`,'authenticated',id(4)),'42501','Delivered order denies new findings')
denied(()=>sql(`UPDATE public.work_orders SET status='in_service' WHERE workshop_id=${lit(wid)} AND id=${lit(oid)};`,'authenticated'),'42501','Delivered order cannot silently reopen')
update("resolution='resolved'");assert.equal(sql(`SELECT note FROM public.inspection_findings WHERE id=${lit(finding)};`),'Synthetic fixture finding');pass('Authorized resolution follow-up preserves diagnosis and issued revision')
const mid=sql(`SELECT id FROM public.workshop_memberships WHERE workshop_id=${lit(wid)} AND user_id=${lit(id(4))};`)
invoke('bt_plan04_manage_mechanic',[wid,'disable',null,mid,randomUUID()]);const req=randomUUID();invoke('bt_plan04_manage_mechanic',[wid,'reactivate',null,mid,req]);invoke('bt_plan04_manage_mechanic',[wid,'reactivate',null,mid,req]);assert.equal(sql(`SELECT count(*) FROM public.workshop_memberships WHERE id=${lit(mid)} AND user_id=${lit(id(4))} AND status='active';`),1);assert.equal(sql(`SELECT count(*) FROM bt_platform_private.team_events WHERE request_id=${lit(req)} AND payload->>0='reactivate';`),1);pass('Reactivation keeps same identity/history, audits once and is idempotent')
denied(()=>invoke('bt_plan04_manage_mechanic',[wid,'reactivate',null,mid,randomUUID()],'authenticated',id(4)),'42501','Mechanic cannot reactivate members')
const invitation=invoke('bt_plan04_manage_mechanic',[wid,'invite','revoke-3@invalid.test',null,randomUUID()]);assert.equal(invoke('bt_plan04_pending_invitations',[],'authenticated',id(3))[0].id,invitation.id);assert.deepEqual(invoke('bt_plan04_pending_invitations',[],'authenticated',id(4)),[]);denied(()=>invoke('bt_plan04_accept_pending',[invitation.id],'authenticated',id(4)),'42501','Foreign account cannot resume invitation')
sql(`UPDATE auth.users SET email_confirmed_at=NULL WHERE id=${lit(id(3))};`);denied(()=>invoke('bt_plan04_accept_pending',[invitation.id],'authenticated',id(3)),'42501','Unconfirmed account cannot recover invite');sql(`UPDATE auth.users SET email_confirmed_at=now() WHERE id=${lit(id(3))};`)
invoke('bt_plan04_accept_pending',[invitation.id],'authenticated',id(3));denied(()=>invoke('bt_plan04_accept_mechanic',[invitation.token],'authenticated',id(3)),'42501','Original token invalid after confirmed recipient acceptance');pass('Confirmed email invitation recovery requires no retained browser token')
const v2=sql(`INSERT INTO public.vehicles(workshop_id,customer_id,plate,make,model) VALUES(${lit(wid)},${lit(customerId)},'QA9999','Synthetic','Active') RETURNING id;`,'authenticated')
const o2=sql(`INSERT INTO public.work_orders(workshop_id,vehicle_id,complaint,intake_odometer) VALUES(${lit(wid)},${lit(v2)},'Active synthetic service',120000) RETURNING id;`,'authenticated')
const f2=sql(`INSERT INTO public.inspection_findings(workshop_id,order_id,vehicle_id,category,result) VALUES(${lit(wid)},${lit(o2)},${lit(v2)},'General','ok') RETURNING id;`,'authenticated',id(4))
sql(`UPDATE public.work_orders SET status='ready' WHERE id=${lit(o2)};`,'authenticated');denied(()=>sql(`UPDATE public.inspection_findings SET result='not_checked' WHERE id=${lit(f2)};`,'authenticated',id(4)),'42501','Ready without handover is inspection read-only');sql(`UPDATE public.work_orders SET status='in_service' WHERE id=${lit(o2)};`,'authenticated');pass('Manager may explicitly resume undelivered ready order under existing contract')
invoke('bt_plan04_manage_mechanic',[wid,'disable',null,mid,randomUUID()]);grant(owner,randomUUID(),'full','revoke')
assert.equal(sql(`SELECT to_json(enabled) FROM bt_flow_live_private.rollout WHERE workshop_id=${lit(wid)};`),true)
denied(()=>sql(`UPDATE public.inspection_findings SET result='not_checked' WHERE id=${lit(f2)};`,'authenticated',id(5)),'42501','Revocation while enabled denies direct finding UPDATE')
denied(()=>sql(`INSERT INTO public.inspection_findings(workshop_id,order_id,vehicle_id,category,result) VALUES(${lit(wid)},${lit(o2)},${lit(v2)},'General','ok');`,'authenticated',id(5)),'42501','Revocation while enabled denies direct finding INSERT')
denied(()=>sql(`UPDATE public.work_orders SET complaint='Blocked after revoke' WHERE id=${lit(o2)};`,'authenticated'),'42501','Revocation denies direct operational order UPDATE')
denied(()=>invoke('bt_plan04_manage_mechanic',[wid,'reactivate',null,mid,randomUUID()]),'23514','Revoked plan denies reactivation without deleting member')
assert.equal(sql(`SELECT count(*) FROM public.inspection_findings WHERE workshop_id=${lit(wid)};`,'authenticated',id(5)),2);assert.equal(sql(`SELECT count(*) FROM public.quote_revisions WHERE workshop_id=${lit(wid)};`,'authenticated'),1);pass('Historical findings and issued document revisions remain readable after revocation')
sql(`UPDATE public.customers SET full_name='Basic legitimate customer edit' WHERE id=${lit(customerId)};UPDATE public.vehicles SET odometer_km=120000 WHERE id=${lit(v2)};`,'authenticated');assert.equal(sql(`SELECT odometer_km FROM public.vehicles WHERE id=${lit(v2)};`,'authenticated'),120000);pass('Basic CP03 customer and vehicle maintenance remains legitimate and persisted exactly')
grant(owner);sql(`UPDATE public.inspection_findings SET result='not_checked' WHERE id=${lit(f2)};`,'authenticated',id(5));pass('Full restoration permits active inspection again without losing data')
// Reserve all eight seats, including pending invitations, then deny reactivation.
for(let n=10;n<=15;n++)invoke('bt_plan04_manage_mechanic',[wid,'invite','seat-'+n+'@invalid.test',null,randomUUID()])
denied(()=>invoke('bt_plan04_manage_mechanic',[wid,'reactivate',null,mid,randomUUID()]),'23514','Pending invitations count against reactivation capacity')
// Schema rollback is tested only in the disposable lab; no business rows are dropped.
const beforeRollback=sql(`SELECT jsonb_build_array((SELECT count(*) FROM public.workshop_memberships),(SELECT count(*) FROM public.inspection_findings),(SELECT count(*) FROM public.quote_revisions));`)
sql(await readFile('docs/sql/BT_PILOT_FIX_01_ROLLBACK.sql','utf8'));assert.deepEqual(sql(`SELECT jsonb_build_array((SELECT count(*) FROM public.workshop_memberships),(SELECT count(*) FROM public.inspection_findings),(SELECT count(*) FROM public.quote_revisions));`),beforeRollback);pass('Candidate rollback preserves members/findings/revisions in isolated lab')
await mkdir(out,{recursive:true});await writeFile(out+'/server-results.json',JSON.stringify(results,null,2));console.log('BT_PILOT_FIX_SERVER_PASS',results.length)
