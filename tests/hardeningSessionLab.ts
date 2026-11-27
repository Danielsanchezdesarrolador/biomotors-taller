/** Pending delta only. Actual approved SQL function bodies + actual metered HTTP code. */
import {spawnSync} from 'node:child_process'
import {readFile,mkdir,writeFile} from 'node:fs/promises'
import {createHash,randomUUID} from 'node:crypto'
import assert from 'node:assert/strict'
import type {SupabaseClient} from '@supabase/supabase-js'
import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {meteredDocument,CommercialOperationNotCurrent} from '../server/commercial/meteredDocument'
import {commercialDocumentHandler} from '../server/commercial/documentHandler'
import {documentOperationKey,documentOperation,DocumentOperationExpired,restartDocumentOperation,isDocumentOperationNotCurrent} from '../src/documents/operation'
import {DocumentOperationNotice} from '../src/documents/DocumentOperationNotice'
const lab=process.env.BT_HARDENING_DELTA_LAB||'',out=process.env.BT_HARDENING_DELTA_EVIDENCE||'/tmp/bt-hardening-session-evidence'
assert.match(lab,/^bt-hardening-session-\d+$/)
const id=(n:number)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0'),wid=id(1),uid=id(2),oldSid=id(3),newSid=id(4),oid=id(7),qid=id(8),origin='https://synthetic.invalid'
const quote=(v:unknown)=>v===null||v===undefined?'NULL':typeof v==='boolean'?String(v):"'"+String(typeof v==='object'?JSON.stringify(v):v).replaceAll("'","''")+"'"
function sql(query:string,role='postgres',sid=oldSid,actor=uid):any{
 assert.ok(['postgres','authenticated','service_role','anon'].includes(role))
 const claims=JSON.stringify({sub:actor,session_id:sid}),input=`SET ROLE ${role};SELECT set_config('request.jwt.claims',${quote(claims)},false);\n${query}`
 const p=spawnSync('docker',['exec','-i',lab,'psql','-X','-qAt','-v','ON_ERROR_STOP=1','-v','VERBOSITY=verbose','-U','postgres','-d','delta'],{input,encoding:'utf8'})
 if(p.status){const error=new Error(p.stderr) as Error&{code:string};error.code=/ERROR:\s+([A-Z0-9]{5}):/.exec(p.stderr)?.[1]||'XX000';throw error}
 const value=p.stdout.trim().split('\n').at(-1)||'null';try{return JSON.parse(value)}catch{return value}
}
const invoke=(name:string,args:unknown[],role='authenticated',sid=oldSid,actor=uid)=>sql(`SELECT public.${name}(${args.map(quote).join(',')});`,role,sid,actor)
const results:{name:string;status:string}[]=[],functionHashes:Record<string,string>={}
function pass(name:string){results.push({name,status:'PASS'});console.log('PASS',name)}
function denied(call:()=>unknown,message:string){assert.throws(call,(e:unknown)=>(e as Error).message.includes(message))}
const commercial=await readFile('docs/sql/BT_WORKSHOP_COMMERCIAL_01_CANDIDATE.sql','utf8')
function extract(source:string,name:string){const start=source.indexOf('CREATE FUNCTION '+name+'(');assert.ok(start>=0,name);const definition=source.slice(start,source.indexOf('$$;',start)+3);functionHashes[name]=createHash('sha256').update(definition).digest('hex');return definition}
const tableStart=commercial.indexOf('CREATE TABLE bt_commercial_private.consumption ('),table=commercial.slice(tableStart,commercial.indexOf('\n);',tableStart)+3)
sql(`CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;
CREATE SCHEMA auth;CREATE SCHEMA bt_platform_private;CREATE SCHEMA bt_commercial_private;
CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$SELECT coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$SELECT (auth.jwt()->>'sub')::uuid$$;
CREATE TABLE auth.users(id uuid PRIMARY KEY,email_confirmed_at timestamptz,banned_until timestamptz);
CREATE TABLE auth.sessions(id uuid PRIMARY KEY,user_id uuid,not_after timestamptz);
CREATE TABLE public.workshops(id uuid PRIMARY KEY,name text,status text);
CREATE TABLE public.workshop_memberships(workshop_id uuid,user_id uuid,role text,status text);
CREATE TABLE bt_platform_private.subscriptions(workshop_id uuid,plan text,state text,is_lifetime boolean,expires_at timestamptz);
CREATE TABLE bt_platform_private.mechanic_extras(workshop_id uuid,seats integer,expires_at timestamptz);
CREATE TABLE public.customers(id uuid PRIMARY KEY,workshop_id uuid,full_name text,email text,mobile_e164 text);
CREATE TABLE public.vehicles(id uuid PRIMARY KEY,workshop_id uuid,customer_id uuid,plate text,make text,model text,model_year integer,odometer_km integer);
CREATE TABLE public.work_orders(id uuid PRIMARY KEY,workshop_id uuid,vehicle_id uuid,complaint text,intake_odometer integer,status text,opened_at timestamptz,updated_at timestamptz);
CREATE TABLE public.quote_revisions(id uuid PRIMARY KEY,workshop_id uuid);
CREATE TABLE public.inspection_findings(id uuid,workshop_id uuid,order_id uuid,vehicle_id uuid);
`+table+`ALTER TABLE bt_commercial_private.consumption ENABLE ROW LEVEL SECURITY;ALTER TABLE bt_commercial_private.consumption FORCE ROW LEVEL SECURITY;
REVOKE ALL ON SCHEMA bt_commercial_private FROM PUBLIC,anon,authenticated,service_role;REVOKE ALL ON bt_commercial_private.consumption FROM PUBLIC,anon,authenticated,service_role;`)
sql(extract(await readFile('docs/sql/BT_PLAN_04B_WORKSHOPS_CANDIDATE.sql','utf8'),'bt_platform_private.actor'))
sql(extract(await readFile('docs/sql/BT_PLAN_04C_MECHANICS_CANDIDATE.sql','utf8'),'bt_platform_private.seats'))
for(const name of ['bt_commercial_private.plan','bt_commercial_private.week_start','bt_commercial_private.authorize','bt_commercial_private.assert_capability','public.bt_commercial_status','public.bt_commercial_reserve','public.bt_commercial_finish','public.bt_commercial_cached'])sql(extract(commercial,name))
sql(`REVOKE ALL ON ALL FUNCTIONS IN SCHEMA bt_commercial_private FROM PUBLIC,anon,authenticated,service_role;
REVOKE ALL ON FUNCTION bt_platform_private.actor(),bt_platform_private.seats(uuid) FROM PUBLIC,anon,authenticated,service_role;
REVOKE ALL ON FUNCTION public.bt_commercial_status(uuid),public.bt_commercial_reserve(uuid,text,uuid,uuid,text),public.bt_commercial_finish(uuid,uuid,boolean,bytea),public.bt_commercial_cached(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.bt_commercial_status(uuid),public.bt_commercial_reserve(uuid,text,uuid,uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bt_commercial_finish(uuid,uuid,boolean,bytea),public.bt_commercial_cached(uuid,uuid) TO service_role;
INSERT INTO auth.users VALUES('${uid}',now(),NULL);
INSERT INTO auth.sessions VALUES('${oldSid}','${uid}',NULL),('${newSid}','${uid}',NULL);
INSERT INTO public.workshops VALUES('${wid}','Taller sintético','active');INSERT INTO public.workshop_memberships VALUES('${wid}','${uid}','owner','active');
INSERT INTO bt_platform_private.subscriptions VALUES('${wid}','full','active',true,NULL);
INSERT INTO public.customers VALUES('${id(5)}','${wid}','Cliente sintético',NULL,NULL);
INSERT INTO public.vehicles VALUES('${id(6)}','${wid}','${id(5)}','QA1234','Sintético','Contrato SQL',2020,120000);
INSERT INTO public.work_orders VALUES('${oid}','${wid}','${id(6)}','Prueba sintética',120000,'inspecting','2026-11-27T12:00:00Z','2026-11-27T12:00:00Z');
INSERT INTO public.quote_revisions VALUES('${qid}','${wid}');`)
const pdf=new TextEncoder().encode('%PDF-1.7\nSynthetic server-confirmed original\n%%EOF'),hex=(b:Uint8Array)=>Buffer.from(b).toString('hex')
let callerSid=oldSid,renderCount=0
const rpcArgs:Record<string,string[]>={bt_commercial_reserve:['p_workshop_id','p_capability','p_resource_id','p_request_id','p_snapshot_hash'],bt_commercial_finish:['p_request_id','p_actor_id','p_success','p_bytes'],bt_commercial_cached:['p_request_id','p_actor_id'],bt_commercial_status:['p_workshop_id']}
function client(sid:string,role='authenticated',actor=uid){return {
 auth:{getUser:async()=>({error:null,data:{user:sql(`SELECT row_to_json(u) FROM auth.users u WHERE id=${quote(actor)};`)}})},
 rpc:async(name:string,args:Record<string,unknown>)=>{assert.ok(name in rpcArgs,name);try{return {data:invoke(name,rpcArgs[name].map(k=>args[k]??(k==='p_snapshot_hash'?'':null)),role,sid,actor),error:null}}catch(e){const error=e as Error&{code:string};return {data:null,error:{code:error.code,message:error.message.match(/ERROR:\s+[A-Z0-9]+:\s+([^\n]+)/)?.[1]??error.message}}}},
 from:(table:string)=>{assert.ok(['workshops','customers','vehicles','work_orders','inspection_findings'].includes(table));const filters:Record<string,unknown>={};const read=()=>{const where=Object.entries(filters).map(([k,v])=>{assert.ok(['workshop_id','id','order_id'].includes(k));return k+'='+quote(v)}).join(' AND ');return {error:null,data:sql(`SELECT coalesce(json_agg(t),'[]'::json) FROM (SELECT * FROM public.${table} WHERE ${where}) t;`)}};const q={select:()=>q,eq:(k:string,v:unknown)=>{filters[k]=v;return q},single:async()=>{const r=read();return {...r,data:r.data[0]??null}},maybeSingle:async()=>{const r=read();return {...r,data:r.data[0]??null}},then:(r:(v:unknown)=>unknown)=>Promise.resolve(read()).then(r)};return q}
} as unknown as SupabaseClient}
const trusted=client(newSid,'service_role'),reserve=(rid:string,cap='multipunto',sid=callerSid)=>invoke('bt_commercial_reserve',[wid,cap,cap==='quote'?qid:oid,rid,cap==='multipunto'?'a'.repeat(64):''],'authenticated',sid)
const finish=(rid:string,success=true,bytes=pdf)=>invoke('bt_commercial_finish',[rid,uid,success,'\\x'+hex(bytes)],'service_role')
const counts=()=>sql(`SELECT json_build_object('rows',count(*),'confirmed',count(*) FILTER(WHERE state='confirmed'),'reserved',count(*) FILTER(WHERE state='reserved' AND expires_at>now())) FROM bt_commercial_private.consumption;`)
const expire=(rid:string)=>sql(`UPDATE bt_commercial_private.consumption SET expires_at=now()-interval '1 second' WHERE request_id=${quote(rid)};`)
const reset=()=>{sql(`DELETE FROM bt_commercial_private.consumption;UPDATE bt_platform_private.subscriptions SET plan='full';UPDATE public.workshop_memberships SET status='active';INSERT INTO auth.sessions VALUES('${oldSid}','${uid}',NULL),('${newSid}','${uid}',NULL) ON CONFLICT(id) DO UPDATE SET not_after=NULL;`);callerSid=oldSid}
// Optional new race case: do not rerun the other already-passed delta cases for this addition.
if(process.env.BT_HARDENING_DELTA_FOCUS==='cache-race'){
 const rid=randomUUID();reserve(rid);finish(rid);sql(`DELETE FROM auth.sessions WHERE id='${oldSid}';`)
 const delegate=trusted.rpc.bind(trusted) as unknown as (name:string,args:Record<string,unknown>)=>Promise<{data:unknown;error:unknown}>
 const revokedDuringRead={rpc:async(name:string,args:Record<string,unknown>)=>{const result=await delegate(name,args);if(name==='bt_commercial_cached'&&result.error)sql(`DELETE FROM auth.sessions WHERE id='${newSid}';`);return result}} as unknown as SupabaseClient
 await assert.rejects(meteredDocument(client(newSid),revokedDuringRead,{workshopId:wid,capability:'multipunto',resourceId:oid,requestId:rid,snapshotHash:'a'.repeat(64)},async()=>{throw Error('MUST_NOT_RENDER_OR_FALL_BACK')}),(e:unknown)=>e instanceof Error&&!(e instanceof CommercialOperationNotCurrent)&&e.message==='CACHED_DOCUMENT_DENIED')
 assert.equal(counts().confirmed,1);assert.equal(counts().rows,1)
 pass('Revocation between reserve/cache and recovery status recheck denies bytes and does not offer an authorized renewal')
 await mkdir(out,{recursive:true});await writeFile(out+'/race-results.json',JSON.stringify({status:'PASS',cases:results,count:1,functionSHA256:functionHashes,sourceSQLModified:false,scope:'Actual SQL revocation injected between cached rejection and read-only current-authority recheck; no canned status response',previous34Cases:'HISTORICAL_NOT_REPEATED'},null,2)+'\n')
 console.log('HARDENING_SESSION_SQL_RACE_PASS',1);process.exit(0)
}
// Case 1: unconsumed expirations recover the same UUID; no previous paid operation is renewed.
for(const state of ['reserved','failed']){
 reset();const rid=randomUUID();reserve(rid);if(state==='failed')finish(rid,false);expire(rid);assert.equal(counts().confirmed,0)
 const recovered=reserve(rid);assert.equal(recovered.request_id,rid);assert.equal(recovered.state,'reserved');assert.equal(counts().rows,1);assert.equal(counts().confirmed,0)
 finish(rid);finish(rid);assert.equal(counts().confirmed,1);assert.equal(counts().rows,1)
 pass(`Expired unconsumed ${state} operation recovers the same UUID and confirms exactly once`)
}
reset();{
 const rid=randomUUID();reserve(rid);expire(rid);let arrivals=0,release!:()=>void;const barrier=new Promise<void>(r=>{release=r})
 const read=async()=>{if(++arrivals===2)release();await barrier;return pdf}
 const input={workshopId:wid,capability:'multipunto' as const,resourceId:oid,requestId:rid,snapshotHash:'a'.repeat(64)}
 const replies=await Promise.all([meteredDocument(client(oldSid),trusted,input,read),meteredDocument(client(oldSid),trusted,input,read)])
 assert.deepEqual(replies[0],replies[1]);assert.equal(counts().confirmed,1);assert.equal(counts().rows,1);pass('Concurrent recovery of an expired unconsumed UUID through actual metered code does not duplicate consumption')
}
reset();{
 const rid=randomUUID();reserve(rid);finish(rid);const timestamp=sql(`SELECT confirmed_at FROM bt_commercial_private.consumption WHERE request_id=${quote(rid)};`);expire(rid)
 denied(()=>reserve(rid),'CONSUMPTION_REPLAY_EXPIRED');assert.equal(counts().confirmed,1);assert.equal(sql(`SELECT confirmed_at FROM bt_commercial_private.consumption WHERE request_id=${quote(rid)};`),timestamp)
 await assert.rejects(meteredDocument(client(oldSid),trusted,{workshopId:wid,capability:'multipunto',resourceId:oid,requestId:rid,snapshotHash:'a'.repeat(64)},async()=>{throw Error('MUST_NOT_RENDER')}),CommercialOperationNotCurrent)
 assert.equal(counts().rows,1);pass('Expired confirmed UUID remains consumed and is rejected; metered layer does not renew it or render')
}
reset();{
 const rid=randomUUID();reserve(rid,'quote');finish(rid);expire(rid);sql("UPDATE bt_platform_private.subscriptions SET plan='basic';")
 denied(()=>reserve(rid,'quote'),'CONSUMPTION_REPLAY_EXPIRED');denied(()=>reserve(randomUUID(),'quote'),'COMMERCIAL_QUOTA_EXHAUSTED');assert.equal(counts().confirmed,1);assert.equal(counts().rows,1)
 pass('A new UUID cannot reset the Basic window or bypass the consumption of an expired confirmed quote')
}
// Case 2: actual HTTP + real SQL after logout/login, not a canned 409 response.
reset();const assets={font:new Uint8Array(await readFile('public/cp05/DejaVuSans.ttf')),logo:new Uint8Array(await readFile('assets/brand/generated/icon-192.png')),light:new Uint8Array(await readFile('apps/android/assets/brand/logo-horizontal.png')),dark:new Uint8Array(await readFile('apps/android/assets/brand/logo-horizontal-dark.png'))}
const handler=commercialDocumentHandler({user:authorization=>client(authorization.slice(7)),trusted:()=>trusted,assets:async()=>{renderCount++;return assets}},origin)
const http=(rid:string,sid=callerSid)=>handler(new Request(origin+'/documents',{method:'POST',headers:{origin,authorization:'Bearer '+sid,'content-type':'application/json'},body:JSON.stringify({action:'multipunto',workshopId:wid,orderId:oid,requestId:rid})}))
const key=documentOperationKey(uid,wid,'session-recovery:'+oid),originalId=documentOperation(key).id
let response=await http(originalId);assert.equal(response.status,200);const originalBytes=new Uint8Array(await response.arrayBuffer());assert.equal(counts().confirmed,1);assert.equal(renderCount,1)
sql(`DELETE FROM auth.sessions WHERE id='${oldSid}';`);callerSid=newSid
// Contract itself: reserve sees the current session, cached still sees the revoked original.
assert.equal(invoke('bt_commercial_reserve',[wid,'multipunto',oid,originalId,sql(`SELECT snapshot_hash FROM bt_commercial_private.consumption WHERE request_id=${quote(originalId)};`)],'authenticated',newSid).state,'confirmed')
denied(()=>invoke('bt_commercial_cached',[originalId,uid],'service_role'),'CACHED_AUTHORITY_REVOKED')
pass('Relogin with same user passes current reserve but original-session cache is denied by the real SQL contract')
response=await http(originalId);assert.equal(response.status,409);assert.deepEqual(await response.clone().json(),{error:'DOCUMENT_OPERATION_NOT_CURRENT'});assert.equal(await isDocumentOperationNotCurrent({context:response}),true);assert.equal(renderCount,1);assert.equal(counts().confirmed,1);assert.equal(counts().rows,1);assert.equal(documentOperation(key).id,originalId)
const error=new DocumentOperationExpired(key,'invalidated'),notice=renderToStaticMarkup(createElement(DocumentOperationNotice,{error,onRestart:()=>{throw Error('MUST_NOT_AUTORENEW')}}));assert.ok(notice.includes('Iniciar nueva operación documental'));assert.equal(counts().confirmed,1);assert.equal(documentOperation(key).id,originalId)
pass('Real cache denial becomes safe HTTP 409 and the real renewal UI is offered without render, new UUID or automatic consumption')
restartDocumentOperation(error);const renewed=documentOperation(key).id;assert.notEqual(renewed,originalId);assert.equal(counts().rows,1);assert.equal(counts().confirmed,1)
response=await http(renewed);assert.equal(response.status,200);const renewedBytes=new Uint8Array(await response.arrayBuffer());assert.equal(counts().confirmed,2);assert.equal(counts().rows,2);assert.equal(renderCount,2)
const storedSession=sql(`SELECT session_id FROM bt_commercial_private.consumption WHERE request_id=${quote(renewed)};`);assert.equal(storedSession,newSid)
response=await http(renewed);assert.equal(response.status,200);assert.deepEqual(new Uint8Array(await response.arrayBuffer()),renewedBytes);assert.equal(counts().confirmed,2);assert.equal(renderCount,2)
pass('Explicit user renewal is metadata-only until requested; a new-session UUID confirms once and its retries never render or consume again')
// Revoke CURRENT authority: recovery must remain denied instead of manufacturing a renewal hint.
sql(`DELETE FROM auth.sessions WHERE id='${newSid}';`);response=await http(renewed);assert.equal(response.status,403);assert.notEqual((await response.json()).error,'DOCUMENT_OPERATION_NOT_CURRENT');assert.equal(counts().confirmed,2);assert.equal(renderCount,2)
pass('Revoked current session cannot obtain bytes or an authorized recovery hint')
sql(`INSERT INTO auth.sessions VALUES('${newSid}','${uid}',NULL);UPDATE public.workshop_memberships SET status='disabled';`);response=await http(renewed);assert.equal(response.status,403);assert.equal(counts().confirmed,2);assert.equal(renderCount,2)
pass('Disabled current membership remains fail-closed after logout/login')
// A reservation not yet expired still bound to a revoked original session cannot be confirmed.
reset();{
 const rid=randomUUID();reserve(rid);sql(`DELETE FROM auth.sessions WHERE id='${oldSid}';`)
 assert.equal(reserve(rid,'multipunto',newSid).state,'reserved')
 await assert.rejects(meteredDocument(client(newSid),trusted,{workshopId:wid,capability:'multipunto',resourceId:oid,requestId:rid,snapshotHash:'a'.repeat(64)},async()=>pdf),CommercialOperationNotCurrent)
 assert.equal(counts().confirmed,0);assert.equal(counts().rows,1);assert.equal(sql(`SELECT session_id FROM bt_commercial_private.consumption WHERE request_id=${quote(rid)};`),oldSid)
 expire(rid);const rebound=reserve(rid,'multipunto',newSid);assert.equal(rebound.state,'reserved');assert.equal(sql(`SELECT session_id FROM bt_commercial_private.consumption WHERE request_id=${quote(rid)};`),newSid);finish(rid);assert.equal(counts().confirmed,1);assert.equal(counts().rows,1)
 pass('Unconsumed old-session reservation preserves guards while live, then rebinds the same UUID only after expiry and confirms once')
}
await mkdir(out,{recursive:true});await writeFile(out+'/relogin-original.pdf',originalBytes);await writeFile(out+'/relogin-explicit-new.pdf',renewedBytes)
await writeFile(out+'/results.json',JSON.stringify({status:'PASS',cases:results,count:results.length,functionSHA256:functionHashes,sourceSQLModified:false,scope:'Actual unchanged reserve/status/actor/finish/cached bodies in a minimal synthetic schema, actual HTTP/metered/renewal UI code; no canned SQL responses, no hosted JWT/RLS audit',network:'Docker --network none, no published ports',previous34Cases:'HISTORICAL_NOT_REPEATED'},null,2)+'\n');console.log('HARDENING_SESSION_SQL_HTTP_PASS',results.length)
