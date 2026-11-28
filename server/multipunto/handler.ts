import type {SupabaseClient} from '@supabase/supabase-js'
import {MPError,uuid,hash,type MPJob} from './protocol'
import type {MPAssets} from './renderer'
import {rpc,multipuntoService} from './service'
export type MPDependencies={user:(authorization:string)=>SupabaseClient;trusted:()=>SupabaseClient;assets:()=>Promise<MPAssets>;origin:string;readEnabled:boolean;writeEnabled:boolean}
/** Separate V2 endpoint. Strict bounded HTTP input; clients cannot submit source/PDF/paths. */
export function multipuntoHandler(deps:MPDependencies){return async(request:Request)=>{
 const headers={'Cache-Control':'no-store','Vary':'Origin','Access-Control-Allow-Origin':deps.origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS'}
 const fail=(code:string,status:number)=>Response.json({error:code},{status,headers})
 if(request.headers.get('origin')&&request.headers.get('origin')!==deps.origin)return fail('MP_ORIGIN_DENIED',403)
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers})
 if(request.method!=='POST')return fail('MP_METHOD_NOT_ALLOWED',405)
 if(!deps.readEnabled)return fail('MP_DISABLED',503)
 try{
  const token=request.headers.get('authorization');if(!token?.match(/^Bearer \S+$/))throw new MPError('MP_SESSION_INVALID',401)
  if(!request.headers.get('content-type')?.startsWith('application/json'))throw new MPError('MP_INVALID_REQUEST',400)
  const reader=request.body?.getReader();if(!reader)throw new MPError('MP_INVALID_REQUEST',400)
  let size=0,text='';const decoder=new TextDecoder('utf-8',{fatal:true});for(;;){const next=await reader.read();if(next.done)break;size+=next.value.length;if(size>8192){await reader.cancel();throw new MPError('MP_REQUEST_TOO_LARGE',413)}text+=decoder.decode(next.value,{stream:true})}text+=decoder.decode()
  let b:Record<string,unknown>;try{b=JSON.parse(text)}catch{throw new MPError('MP_INVALID_REQUEST',400)}
  if(!b||Array.isArray(b)||typeof b!=='object')throw new MPError('MP_INVALID_REQUEST',400)
  const action=b.action,fields:Record<string,string[]>={info:['orderId'],prepare:['orderId','requestId','kind','sourceHash','snapshotHash','maxAdditionalUnits','partialAck','creditId'],resume:['jobId'],renew:['jobId','maxAdditionalUnits'],status:['jobId'],read:['orderId','documentId','jobId']}
  if(typeof action!=='string'||!Object.hasOwn(fields,action)||Object.keys(b).some(k=>!['action','version','workshopId',...fields[action]].includes(k))||b.version!==2)throw new MPError('MP_INVALID_REQUEST',400)
  const wid=uuid(b.workshopId),user=deps.user(token)
  const identity=await user.auth.getUser();if(identity.error||!identity.data.user?.email_confirmed_at)throw new MPError('MP_SESSION_INVALID',401)
  if(['prepare','resume','renew'].includes(action)&&!deps.writeEnabled)throw new MPError('MP_WRITE_DISABLED',503)
  const service=multipuntoService(user,deps.trusted(),deps.assets)
  let result:unknown
  if(action==='info')result=await rpc(user,'bt_mp_info',{p_workshop_id:wid,p_order_id:uuid(b.orderId)})
  else if(action==='status')result=await rpc(user,'bt_mp_status',{p_workshop_id:wid,p_job_id:uuid(b.jobId)})
  else if(action==='read'){
   const bytes=await service.read(wid,uuid(b.orderId),b.documentId===undefined?null:uuid(b.documentId),b.jobId===undefined?null:uuid(b.jobId))
   return new Response(bytes.slice().buffer,{headers:{...headers,'Content-Type':'application/pdf','Content-Disposition':'inline','X-Content-Type-Options':'nosniff'}})
  }else{
   let job:MPJob
   if(action==='prepare'){
    if(!['draft','final'].includes(String(b.kind))||![0,1].includes(b.maxAdditionalUnits as number)||typeof b.partialAck!=='boolean')throw new MPError('MP_INVALID_REQUEST',400)
    job=await rpc(user,'bt_mp_prepare',{p_workshop_id:wid,p_order_id:uuid(b.orderId),p_request_id:uuid(b.requestId),p_kind:b.kind,p_source_hash:hash(b.sourceHash),p_snapshot_hash:hash(b.snapshotHash),p_max_additional_units:b.maxAdditionalUnits,p_partial_ack:b.partialAck,p_credit_id:b.creditId===undefined?null:uuid(b.creditId)})
   }else if(action==='renew'){
    if(b.maxAdditionalUnits!==1)throw new MPError('MP_CONSENT_REQUIRED',400)
    job=await rpc(user,'bt_mp_renew',{p_workshop_id:wid,p_job_id:uuid(b.jobId),p_max_additional_units:1})
   }else job=await rpc(user,'bt_mp_status',{p_workshop_id:wid,p_job_id:uuid(b.jobId)})
   // Prior canonical document and other active attempt do not authorize a new render.
   result=job.id?await service.process(job):job
   if((result as {error?:string}).error)throw new MPError((result as {error:string}).error)
  }
  return Response.json(result,{headers})
 }catch(e){return e instanceof MPError?fail(e.code,e.status):fail('MP_SERVICE_UNAVAILABLE',503)}
}}
