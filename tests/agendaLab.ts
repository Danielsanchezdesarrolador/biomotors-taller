/** Candidate-only PostgreSQL 17 integration. No hosted connections or real credentials. */
import {spawn,spawnSync} from 'node:child_process'
import {createServer} from 'node:http'
import {readFile,mkdir,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import type {SupabaseClient} from '@supabase/supabase-js'
import {finalArchivePorts} from '../server/com/finalArchivePorts'
import {quotePdf} from '../src/cp05/pdf'
import type {Quote,Revision} from '../src/cp05/contracts'
import {prepareClosingPacket} from '../src/entrega/finalPackage'
import {readFlowEvidence} from '../src/historial/flowEvidence'
import {shiftDay,weekStart} from '../src/agenda/contracts'
const lab=process.env.BT_AGENDA_LAB||'',out=process.env.BT_AGENDA_EVIDENCE_DIR||'/tmp/bt-agenda-evidence'
assert.match(lab,/^bt-agenda-[0-9]+$/)
const id=(n:number)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0'),wid='c943ad51-6d90-447b-8aa7-68866f69a4bc',actor=id(7)
const lit=(value:unknown)=>value===null||value===undefined?'NULL':typeof value==='boolean'?String(value):"'"+String(typeof value==='object'?JSON.stringify(value):value).replaceAll("'","''")+"'"
function sql(query:string,role='postgres',uid=actor):any{
 const r=spawnSync('docker',['exec','-i',lab,'psql','-X','-qAt','-v','ON_ERROR_STOP=1','-v','VERBOSITY=verbose','-U','postgres','-d','bytetorque'],{input:`SET ROLE ${role};SELECT set_config('request.jwt.claim.sub',${lit(uid)},false);\n${query}`,encoding:'utf8'})
 if(r.status){const error=new Error(r.stderr) as Error&{code:string};error.code=/ERROR:\s+([A-Z0-9]{5}):/.exec(r.stderr)?.[1]||'XX000';throw error}
 const line=r.stdout.trim().split('\n').at(-1)||'null';try{return JSON.parse(line)}catch{return line}
}
let passes=0
function pass(name:string){passes++;console.log('PASS',name)}
function denied(fn:()=>unknown,code:string,name:string){assert.throws(fn,(e:unknown)=>(e as {code:string}).code===code);pass(name)}
const methods:Record<string,string[]>={bt_final_archive_source:['p_workshop_id','p_order_id','p_revision_id','p_delivery_id'],bt_final_archive_document:['p_workshop_id','p_revision_id'],bt_final_archive_commit:['p_workshop_id','p_order_id','p_revision_id','p_delivery_id','p_request_id','p_actor_id','p_manifest'],bt_agenda_catalog:['p_workshop_id','p_first_day','p_last_day'],bt_agenda_command:['p_workshop_id','p_request_id','p_kind','p_input'],bt_cp05_open_quote:['p_workshop_id','p_order_id','p_request_id'],bt_cp05_save_quote:['p_workshop_id','p_quote_id','p_expected_version','p_request_id','p_data'],bt_flow_record_quote_approval:['p_workshop_id','p_quote_id','p_revision_id','p_request_id','p_method','p_note'],bt_flow_record_execution:['p_workshop_id','p_quote_id','p_revision_id','p_request_id','p_decisions','p_pending_note','p_operator_reviewed'],bt_flow_record_handover:['p_workshop_id','p_report_id','p_request_id','p_checklist','p_handover_method','p_handover_note','p_operator_confirmed'],bt_final_archive_catalog:['p_workshop_id','p_query','p_vehicle_id','p_after_time','p_after_id']}
function rpc(name:string,args:Record<string,unknown>,role='authenticated',uid=actor){assert.ok(methods[name]);return sql(`SELECT public.${name}(${methods[name].map(k=>lit(args[k])).join(',')});`,role,uid)}
function command(kind:string,input:Record<string,unknown>,request=crypto.randomUUID(),uid=actor){return rpc('bt_agenda_command',{p_workshop_id:wid,p_request_id:request,p_kind:kind,p_input:input},'authenticated',uid)}
const today=sql("SELECT (statement_timestamp() AT TIME ZONE 'America/Santiago')::date"),day=shiftDay(today,1),start=weekStart(day),end=shiftDay(start,6)
const catalog=()=>rpc('bt_agenda_catalog',{p_workshop_id:wid,p_first_day:start,p_last_day:end})
sql(`INSERT INTO auth.users(id,email) VALUES(${lit(actor)},'owner@invalid.test'),(${lit(id(8))},'mechanic@invalid.test'),(${lit(id(9))},'other@invalid.test'),(${lit(id(10))},'admin@invalid.test'),(${lit(id(11))},'reception@invalid.test');
 INSERT INTO public.workshops(id,name) VALUES(${lit(wid)},'Taller ByteTorque · datos ficticios'),(${lit(id(1))},'Otro taller ficticio');
 INSERT INTO public.workshop_memberships(workshop_id,user_id,role) VALUES(${lit(wid)},${lit(actor)},'owner'),(${lit(wid)},${lit(id(8))},'mechanic'),(${lit(id(1))},${lit(id(9))},'owner'),(${lit(wid)},${lit(id(10))},'admin'),(${lit(wid)},${lit(id(11))},'reception');
 INSERT INTO bt_flow_live_private.rollout(workshop_id,enabled) VALUES(${lit(wid)},true);
 INSERT INTO bt_com_private.rollout(workshop_id,archive_read_enabled,archive_enabled) VALUES(${lit(wid)},true,true);`)
denied(catalog,'42501','Agenda OFF after schema installation')
sql(`INSERT INTO bt_agenda_private.rollout(workshop_id,enabled) VALUES(${lit(wid)},true);`)
for(const [uid,name] of [[id(8),'mechanic'],[id(9),'cross-tenant']])denied(()=>command('prepare',{vehicle_id:id(50),service:'Servicio ficticio'},crypto.randomUUID(),uid),'42501',name+' denied by live backend')
denied(()=>command('prepare',{vehicle_id:id(50),service:'Servicio ficticio',actor_id:actor}),'22023','unknown actor field denied')
denied(()=>rpc('bt_agenda_catalog',{p_workshop_id:wid,p_first_day:start,p_last_day:shiftDay(start,50)}),'22023','bounded date range')
const assets={font:new Uint8Array(await readFile('public/cp05/DejaVuSans.ttf')),logo:new Uint8Array(await readFile('assets/brand/generated/icon-192.png'))}
const hash=(b:Uint8Array)=>createHash('sha256').update(b).digest('hex')
const docs=new Map<string,Uint8Array>()
function customer(n:number){sql(`INSERT INTO public.customers(workshop_id,id,full_name,mobile_e164,email,created_by) VALUES(${lit(wid)},${lit(id(100+n))},${lit(['Rodrigo Pérez','Francisca Muñoz','Pablo Herrera','Valentina Soto','Diego Contreras','Camila Torres','Andrés Núñez','María Rojas'][n-1]||'Cliente ficticio '+n)},'+56911112222','ficticio@invalid.test',${lit(actor)});
 INSERT INTO public.vehicles(workshop_id,id,customer_id,plate,make,model,model_year,created_by) VALUES(${lit(wid)},${lit(id(200+n))},${lit(id(100+n))},${lit('QA'+String(n).padStart(4,'0'))},'Vehículo','Ficticio',2023,${lit(actor)});`)}
async function issue(prepared:any,n:number){
 const item=id(300+n),request=crypto.randomUUID(),draft={price_basis:'net',valid_days:15,terms:'Condiciones ficticias de prueba',comments:'',items:[{id:item,description:'Servicio ficticio '+n,type:'Servicio',quantity100:100,unit_price:70000}]}
 const saved=sql(`SELECT public.bt_cp05_save_quote(${lit(wid)},${lit(prepared.id)},${prepared.version},gen_random_uuid(),${lit(draft)});`,'authenticated')
 const reserved=sql(`SELECT public.bt_cp05_prepare_issue(${lit(wid)},${lit(prepared.id)},${saved.version},${lit(request)},${lit(actor)});`,'service_role')
 assert.equal(reserved.payload.order.intake_phase,'planned')
 const bytes=await quotePdf(reserved.payload,assets),path=wid+'/quotes/'+prepared.id+'/r'+reserved.revision+'/'+reserved.payload_sha256+'.pdf'
 docs.set('cp05-quote-documents/'+path,bytes)
 sql(`INSERT INTO storage.objects(bucket_id,name,metadata) VALUES('cp05-quote-documents',${lit(path)},${lit({size:bytes.length,mimetype:'application/pdf'})});`)
 const revision=sql(`SELECT public.bt_cp05_finish_issue(${lit(wid)},${lit(request)},${lit(actor)},${lit(path)},${lit(hash(bytes))},${bytes.length});`,'service_role') as Revision
 return {quoteId:prepared.id,orderId:prepared.order_id,revision,item,bytes}
}
function approve(qid:string,rid:string){return rpc('bt_flow_record_quote_approval',{p_workshop_id:wid,p_quote_id:qid,p_revision_id:rid,p_request_id:crypto.randomUUID(),p_method:'phone',p_note:'Cliente ficticio autoriza el presupuesto íntegro.'})}
const prepared:any[]=[],issued:Awaited<ReturnType<typeof issue>>[]=[],appointments:any[]=[]
for(let n=1;n<=8;n++){customer(n);const request=crypto.randomUUID(),input={vehicle_id:id(200+n),service:'Servicio solicitado ficticio '+n};const p=command('prepare',input,request);assert.deepEqual(command('prepare',input,request),p);assert.equal(command('prepare',input).order_id,p.order_id);prepared.push(p);issued.push(await issue(p,n))}
pass('8 real planned OTs, saved drafts, immutable CP05 issuance and replay without duplicate orders')
denied(()=>command('prepare',{vehicle_id:id(201),service:'Otra solicitud incompatible'}),'40001','same vehicle active request conflict')
const input={quote_id:issued[0].quoteId,revision_id:issued[0].revision.id,local_start:day+'T08:30',duration_minutes:60,notes:'Prueba ficticia',tentative:false}
denied(()=>command('schedule',input),'55000','approval required for confirmed booking')
appointments.push(command('schedule',{...input,tentative:true}).appointment)
denied(()=>command('receive',{id:appointments[0].id,version:1,odometer:1000,complaint:'Recepción ficticia',confirmed:true}),'55000','unapproved tentative receipt blocked')
for(let n=0;n<8;n++)if(n!==4)approve(issued[n].quoteId,issued[n].revision.id)
appointments[0]=command('confirm',{id:appointments[0].id,version:1}).appointment
for(let n=1;n<8;n++)appointments.push(command('schedule',{...input,quote_id:issued[n].quoteId,revision_id:issued[n].revision.id,local_start:shiftDay(day,n>4?1:0)+'T'+['08:30','08:30','14:00','16:30','09:00','11:00','14:30','08:30'][n],tentative:n===4}).appointment)
pass('pending → approved → confirmed, 8 bookings and simultaneous different vehicles')
const rescheduled=command('reschedule',{id:appointments[1].id,version:1,local_start:day+'T10:30',duration_minutes:90,notes:'Reprogramación ficticia'}).appointment
assert.equal(rescheduled.version,2);appointments[1]=rescheduled
denied(()=>command('reschedule',{id:appointments[1].id,version:1,local_start:day+'T11:30',duration_minutes:60,notes:''}),'40001','stale appointment version rejected')
denied(()=>command('reschedule',{id:appointments[1].id,version:2,local_start:'2026-01-01T10:00',duration_minutes:60,notes:''}),'22023','past dates rejected')
const nextYear=Number(today.slice(0,4))+1
// Chile skips 00:00 on DST change; SQL must not silently shift invalid local times.
const september=new Date(`${nextYear}-09-01T12:00:00Z`);while(september.getUTCDay()!==0)september.setUTCDate(september.getUTCDate()+1)
denied(()=>command('reschedule',{id:appointments[1].id,version:2,local_start:september.toISOString().slice(0,10)+'T00:30',duration_minutes:60,notes:''}),'22023','nonexistent Chile DST time rejected')
const cancelled=command('cancel',{id:appointments[5].id,version:1,reason:'Reprogramación solicitada por cliente ficticio'}).appointment
assert.equal(cancelled.status,'cancelled');assert.equal(sql(`SELECT count(*) FROM public.quote_revisions WHERE quote_id=${lit(issued[5].quoteId)};`),1);pass('cancellation retains issued document and original OT')
denied(()=>command('receive',{id:cancelled.id,version:cancelled.version,odometer:1000,complaint:'Recepción ficticia',confirmed:true}),'40001','cancelled visit cannot receive')
denied(()=>sql(`UPDATE public.work_orders SET status='inspecting' WHERE workshop_id=${lit(wid)} AND id=${lit(issued[0].orderId)};`,'authenticated'),'55000','CP04 cannot advance planned OT before receipt')
denied(()=>sql(`INSERT INTO public.inspection_findings(workshop_id,order_id,vehicle_id,category,result,note) VALUES(${lit(wid)},${lit(issued[0].orderId)},${lit(id(201))},'General','ok',NULL);`,'authenticated'),'55000','no inspection before physical intake')
denied(()=>sql(`UPDATE public.work_orders SET intake_phase='received' WHERE id=${lit(issued[0].orderId)};`,'authenticated'),'42501','client cannot forge physical intake')
const receiveInput={id:appointments[2].id,version:1,odometer:50000,complaint:'Recepción física ficticia confirmada',confirmed:true},request=crypto.randomUUID()
const beforeHash=hash(issued[2].bytes),received=command('receive',receiveInput,request)
assert.equal(received.order_id,issued[2].orderId);assert.deepEqual(command('receive',receiveInput,request),received);assert.deepEqual(command('receive',receiveInput).order_id,received.order_id)
assert.equal(sql(`SELECT count(*) FROM public.bt_agenda_receipts WHERE order_id=${lit(received.order_id)};`),1)
assert.equal(sql(`SELECT intake_phase FROM public.work_orders WHERE id=${lit(received.order_id)};`),'received');pass('receipt is atomic, append-only and idempotent, same OT/quote')
denied(()=>command('receive',{...receiveInput,confirmed:false}),'40001','repeated receipt still requires confirmation')
denied(()=>command('receive',{...receiveInput,odometer:999}),'40001','receipt cannot be overwritten by new request')
denied(()=>command('receive',{...receiveInput,odometer:999},request),'22023','request id bound to exact input')
denied(()=>sql(`UPDATE public.bt_agenda_receipts SET odometer=999 WHERE order_id=${lit(received.order_id)};`),'42501','immutable reception evidence')
const qid=issued[2].quoteId,rid=issued[2].revision.id,orderId=issued[2].orderId,item=issued[2].item
sql(`UPDATE public.work_orders SET status='inspecting' WHERE id=${lit(orderId)};`,'authenticated')
sql(`INSERT INTO public.inspection_findings(workshop_id,order_id,vehicle_id,category,result,note) VALUES(${lit(wid)},${lit(orderId)},${lit(id(203))},'General','ok',NULL);`,'authenticated')
sql(`UPDATE public.work_orders SET status='in_service' WHERE id=${lit(orderId)};`,'authenticated')
const execution=rpc('bt_flow_record_execution',{p_workshop_id:wid,p_quote_id:qid,p_revision_id:rid,p_request_id:crypto.randomUUID(),p_decisions:{[item]:'performed'},p_pending_note:'',p_operator_reviewed:true})
sql(`UPDATE public.work_orders SET status='ready' WHERE id=${lit(orderId)};`,'authenticated')
const delivery=rpc('bt_flow_record_handover',{p_workshop_id:wid,p_report_id:execution.id,p_request_id:crypto.randomUUID(),p_checklist:{vehicleChecked:true,workChecked:true,documentsChecked:true,pendingExplained:true},p_handover_method:'in_person',p_handover_note:'Entrega ficticia declarada por responsable.',p_operator_confirmed:true})
const source=sql(`SELECT public.bt_final_archive_source(${lit(wid)},${lit(orderId)},${lit(rid)},${lit(delivery.id)});`,'authenticated')
const packet=prepareClosingPacket(source.quote as Quote,source.revision as Revision,source.evidence)
assert.equal(packet.order.odometer,50000);assert.equal(packet.order.complaint,receiveInput.complaint);assert.equal(packet.order.openedAt,source.evidence.receipts[0].received_at);assert.equal(hash(issued[2].bytes),beforeHash)
const payload=sql(`SELECT payload FROM public.quote_revisions WHERE id=${lit(rid)};`)
assert.equal(payload.order.intake_phase,'planned');assert.equal(payload.order.intake_odometer,null)
pass('actual CP04 → LIVE execution → handover → final archive source uses receipt, historical quote bytes untouched')

let renders=0,uploads=0
const archiveClient=(role:string)=>({auth:{getUser:async()=>({data:{user:{id:actor,email_confirmed_at:'2026-11-25'}}})},rpc:async(name:string,args:Record<string,unknown>)=>{try{return {data:rpc(name,args,role),error:null}}catch(e){return {data:null,error:{code:(e as {code:string}).code}}}},storage:{from:(bucket:string)=>({download:async(path:string)=>{const bytes=docs.get(bucket+'/'+path);return bytes?{data:new Blob([bytes as Uint8Array<ArrayBuffer>]),error:null}:{data:null,error:{code:'404'}}},upload:async(path:string,bytes:Uint8Array,options:{upsert:boolean})=>{assert.equal(options.upsert,false);assert.ok(!docs.has(bucket+'/'+path));docs.set(bucket+'/'+path,new Uint8Array(bytes));uploads++;sql(`INSERT INTO storage.objects(bucket_id,name,metadata) VALUES(${lit(bucket)},${lit(path)},${lit({size:bytes.length,mimetype:'application/pdf'})});`);return {data:{path},error:null}}})}}) as unknown as SupabaseClient
const archive=finalArchivePorts(archiveClient('authenticated'),archiveClient('service_role'),async()=>{renders++;return assets})
const archiveRequest={workshopId:wid,orderId,revisionId:rid,deliveryId:delivery.id,requestId:crypto.randomUUID()}
await archive.archive(archiveRequest)
for(const kind of ['quote','report','handover'] as const){const downloaded=await archive.download(wid,rid,kind);assert.equal(hash(downloaded.bytes),downloaded.doc.sha256);await writeFile(out+'/'+kind+'.pdf',downloaded.bytes)}
const initialRenders=renders,initialUploads=uploads
await archive.archive({...archiveRequest,requestId:crypto.randomUUID()})
assert.equal(renders,initialRenders);assert.equal(uploads,initialUploads);assert.equal(hash((await archive.download(wid,rid,'quote')).bytes),beforeHash)
pass('real final-archive adapter commits 3 original PDFs, verifies readback and retries without rendering or overwriting')

const flow=await readFlowEvidence(wid,id(203),[source.quote],[source.revision],async(table,ids,column,foreign='quote_id',vehicleId)=>sql(`SELECT coalesce(jsonb_agg(t ORDER BY ${column},id),'[]') FROM public.${table} t WHERE workshop_id=${lit(wid)} AND ${foreign} IN (${ids.map(lit).join(',')})${vehicleId?' AND vehicle_id='+lit(vehicleId):''};`,'authenticated'))
assert.equal(flow.receipts?.length,1);assert.equal(prepareClosingPacket(source.quote,source.revision,flow).order.odometer,50000)
assert.throws(()=>prepareClosingPacket(source.quote,source.revision,{...flow,receipts:[]}));assert.throws(()=>prepareClosingPacket(source.quote,source.revision,{...flow,receipts:flow.receipts?.map(r=>({...r,workshop_id:id(1)}))}));pass('history validates immutable receipt and rejects missing or cross-tenant evidence')
// A stale revision remains visible, but no confirmation/reception can reuse its approval.
const stale=issued[3],staleQuote=sql(`SELECT row_to_json(q) FROM public.quotes q WHERE id=${lit(stale.quoteId)};`)
sql(`SELECT public.bt_cp05_revise_quote(${lit(wid)},${lit(stale.quoteId)},${staleQuote.version},gen_random_uuid(),'Cambio ficticio presupuesto');`,'authenticated')
denied(()=>command('receive',{id:appointments[3].id,version:1,odometer:10,complaint:'Ingreso ficticio',confirmed:true}),'40001','revised quote blocks outdated reception')
assert.equal(catalog().entries.find((a:any)=>a.id===appointments[3].id).revision_changed,true)
command('cancel',{id:appointments[3].id,version:1,reason:'Presupuesto modificado'});pass('stale revision can cancel without destroying document')
sql(`UPDATE public.workshop_memberships SET status='disabled' WHERE workshop_id=${lit(wid)} AND user_id=${lit(id(10))};`)
denied(()=>command('prepare',{vehicle_id:id(201),service:'Prueba de revocación'},crypto.randomUUID(),id(10)),'42501','membership revocation checked per command')
assert.equal(sql(`SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='bt_agenda_private' AND c.relkind='r' AND NOT c.relrowsecurity;`),0)
assert.equal(sql(`SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN ('bt_agenda_command','bt_agenda_catalog') AND p.prosecdef;`),0)
denied(()=>sql('SELECT * FROM bt_agenda_private.appointments;','authenticated'),'42501','private tables inaccessible directly')
denied(()=>sql(`SELECT public.bt_agenda_catalog(${lit(wid)},${lit(start)},${lit(end)});`,'anon'),'42501','anonymous API denied')
assert.equal(sql(`SELECT count(*) FROM public.bt_agenda_receipts;`,'authenticated',id(9)),0);pass('RLS on all new tables, invoker API and cross-tenant receipt isolation')

// Existing REG lifecycle commands remain authoritative for cancelling a planned OT.
sql(`INSERT INTO bt_records_private.rollout(workshop_id,enabled) VALUES(${lit(wid)},true);`)
const inspect=sql(`SELECT public.bt_records_inspect(${lit(wid)},'work_orders',${lit(issued[7].orderId)});`,'authenticated')
sql(`SELECT public.bt_records_execute(${lit(wid)},'work_orders',${lit(issued[7].orderId)},'cancel',${lit(inspect.token)},gen_random_uuid(),'Cancelación ficticia de solicitud');`,'authenticated')
command('cancel',{id:appointments[7].id,version:1,reason:'OT cancelada mediante REG'})
pass('REG can cancel planned OT and Agenda retains cancellable appointment history')


customer(9)
const concurrentInput={vehicle_id:id(209),service:'Solicitud concurrente ficticia'},concurrentRequest=crypto.randomUUID()
function concurrentPrepare(){return new Promise<any>((resolve,reject)=>{const p=spawn('docker',['exec','-i',lab,'psql','-X','-qAt','-v','ON_ERROR_STOP=1','-U','postgres','-d','bytetorque']);let output='',err='';p.stdout.on('data',c=>output+=c);p.stderr.on('data',c=>err+=c);p.on('exit',code=>{if(code)return reject(new Error(err));resolve(JSON.parse(output.trim().split('\n').at(-1)!))});p.stdin.end(`SET ROLE authenticated;SELECT set_config('request.jwt.claim.sub',${lit(actor)},false);SELECT public.bt_agenda_command(${lit(wid)},${lit(concurrentRequest)},'prepare',${lit(concurrentInput)});`)})}
const [ca,cb]=await Promise.all([concurrentPrepare(),concurrentPrepare()]);assert.deepEqual(ca,cb)
assert.equal(sql(`SELECT count(*) FROM public.work_orders WHERE vehicle_id=${lit(id(209))};`),1)
pass('two simultaneous database sessions yield one planned OT and one quote')
customer(10)
const state=catalog();assert.equal(state.stats.received,1);assert.equal(state.entries.length,8);pass('catalog counts persisted bookings and actual receipt date')
await mkdir(out,{recursive:true});await writeFile(out+'/sql-results.json',JSON.stringify({passes,base:'1161688e3c4ced40f5c9355140bd9faa9cfc52ba',day,hostedConnections:0},null,2))
if(process.env.BT_AGENDA_BROWSER!=='true'){console.log('AGENDA_SQL_PASS',passes);process.exit(0)}
// Loopback PostgREST transport double; ALL business writes execute candidate SQL + existing RPCs.
const allowedTables=new Set(['workshops','workshop_memberships','customers','vehicles','work_orders','quotes','quote_items','quote_revisions','quote_events','quote_delivery_events','inspection_findings','bt_flow_quote_approvals','bt_flow_execution_reports','bt_flow_visit_deliveries','bt_agenda_receipts'])
const bridge=createServer(async(req,res)=>{res.setHeader('Access-Control-Allow-Origin','http://127.0.0.1:47131');res.setHeader('Access-Control-Allow-Headers','*');res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,OPTIONS');if(req.method==='OPTIONS'){res.end();return}
 try{
 const url=new URL(req.url||'/','http://127.0.0.1:4179'),name=url.pathname.split('/').pop()||'';let data:any
 if(url.pathname==='/fixture'){data={context:{userId:actor,workshop:{id:wid,name:'Taller ByteTorque · datos ficticios',status:'active'},role:'owner'},day}}
 else if(url.pathname.startsWith('/rest/v1/rpc/')&&req.method==='POST'){let body='';for await(const chunk of req)body+=chunk;data=rpc(name,JSON.parse(body))}
 else if(url.pathname.startsWith('/rest/v1/')&&allowedTables.has(name)&&req.method==='GET'){
  const filters:string[]=[]
  for(const [key,value] of url.searchParams){if(['select','order','limit','offset'].includes(key))continue;if(key.includes('.')){assert.ok(key.endsWith('archived_at'));continue}assert.match(key,/^[a-z_]+$/);const dot=value.indexOf('.'),op=value.slice(0,dot),v=value.slice(dot+1);if(op==='eq')filters.push(`${key}=${lit(v)}`);else if(op==='is'&&v==='null')filters.push(`${key} IS NULL`);else if(op==='neq')filters.push(`${key}<>${lit(v)}`);else if(op==='in'){filters.push(`${key} IN (${v.slice(1,-1).split(',').map(lit).join(',')})`)}else throw Error('UNSUPPORTED_LOCAL_FILTER')}
  const orders=(url.searchParams.get('order')||'').split(',').filter(Boolean).map(x=>{assert.match(x,/^[a-z_]+\.(asc|desc)$/);return x.replace('.',' ')}).join(',')
  data=sql(`SELECT coalesce(jsonb_agg(t),'[]') FROM (SELECT * FROM public.${name}${filters.length?' WHERE '+filters.join(' AND '):''}${orders?' ORDER BY '+orders:''} LIMIT ${Math.min(Number(url.searchParams.get('limit')||1000),1000)}) t;`,'authenticated')
  if(req.headers.accept?.includes('vnd.pgrst.object'))data=data[0]||null
 }else throw Error('LOCAL_ROUTE_NOT_IMPLEMENTED')
 res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data))
 }catch(e){res.statusCode=400;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({code:(e as {code?:string}).code||'XX000',message:'Local diagnostic failure'}))}})
bridge.listen(4179,'127.0.0.1',()=>console.log('AGENDA_SQL_PASS',passes,'BROWSER_BRIDGE_READY'))
