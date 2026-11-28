import type {SupabaseClient} from '@supabase/supabase-js'
import {MPError,sha,unhex,hex,type MPJob,type MPStatus,type MPWorker,type MPDocument} from './protocol'
import {renderMultipunto,type MPAssets} from './renderer'
const bucket='bt-inspection-documents'
export async function rpc<T>(client:SupabaseClient,name:string,args:Record<string,unknown>):Promise<T>{const r=await client.rpc(name,args);if(r.error){const code=/MP_[A-Z_]+/.exec(r.error.message)?.[0]??'MP_PERMISSION_DENIED';throw new MPError(code,(code==='MP_QUOTA_EXHAUSTED'||code==='MP_READ_RATE_LIMIT')?429:code.includes('INVALID_REQUEST')?400:code==='MP_ORIGINAL_MISSING'?404:code.includes('DISABLED')||code.includes('GATE_CLOSED')?503:code.includes('SESSION')?401:code.includes('DENIED')||code==='MP_PLAN_REQUIRED'?403:409)}return r.data as T}
export function multipuntoService(user:SupabaseClient,trusted:SupabaseClient,assets:()=>Promise<MPAssets>){
 const worker=(j:MPJob,action:string,extra={})=>rpc<MPWorker>(trusted,'bt_mp_worker',{p_job_id:j.id,p_generation:j.generation,p_action:action,...extra})
 async function process(j:MPJob){
  const current=await rpc<MPStatus>(user,'bt_mp_status',{p_workshop_id:j.workshop_id,p_job_id:j.id})
  if(current.state==='NOT_PREPARED')throw new MPError('MP_OPERATION_NOT_FOUND',404)
  if(current.generation!==j.generation)throw new MPError('MP_WORKER_FENCED')
  j=current
  if(['ISSUED','DRAFT_CONFIRMED'].includes(j.state))return rpc<Record<string,unknown>>(user,'bt_mp_complete',{p_workshop_id:j.workshop_id,p_job_id:j.id})
  if(j.state==='IN_PROGRESS')return j
  try{
  let work=await worker(j,'claim')
  if(!work.artifact){const rendered=await renderMultipunto(work,await assets());work=await worker(j,'stage',{p_bytes:'\\x'+hex(rendered),p_hash:await sha(rendered)})}
  const a=work.artifact;if(!a)throw new MPError('MP_INTEGRITY_ERROR')
  const canonical=unhex(a.bytes);if(canonical.length!==a.size||await sha(canonical)!==a.hash)throw new MPError('MP_INTEGRITY_ERROR')
  if(j.kind==='final'){
   if(!a.path||!a.path.startsWith(j.workshop_id+'/inspections/'+j.order_id+'/r'+j.revision+'/'))throw new MPError('MP_INTEGRITY_ERROR')
   const storage=trusted.storage.from(bucket)
   // No overwrite, including recovery after uncertain upload. Always read back canonical bytes.
   const upload=await storage.upload(a.path,canonical,{contentType:'application/pdf',upsert:false})
   if(upload.error&&!['409','400'].includes(String((upload.error as {statusCode?:string}).statusCode)))throw new MPError('MP_ARCHIVE_UNAVAILABLE',503)
   const read=await storage.download(a.path)
   if(read.error||!read.data)throw new MPError('MP_ARCHIVE_UNAVAILABLE',503)
   if(read.data.size!==a.size)throw new MPError('MP_INTEGRITY_ERROR')
   const bytes=new Uint8Array(await read.data.arrayBuffer())
   if(bytes.length!==a.size||await sha(bytes)!==a.hash)throw new MPError('MP_INTEGRITY_ERROR')
   await worker(j,'verified',{p_hash:a.hash})
  }
  return await rpc<Record<string,unknown>>(user,'bt_mp_complete',{p_workshop_id:j.workshop_id,p_job_id:j.id})
  }catch(error){const status=await rpc<MPStatus>(user,'bt_mp_status',{p_workshop_id:j.workshop_id,p_job_id:j.id});if(status.state!=='NOT_PREPARED'&&status.generation===j.generation&&['ISSUED','DRAFT_CONFIRMED'].includes(status.state))return rpc<Record<string,unknown>>(user,'bt_mp_complete',{p_workshop_id:j.workshop_id,p_job_id:j.id});try{await worker(j,'failed')}catch{/* A revoked/expired generation cannot append as an active worker. */}throw error}
 }
 async function read(wid:string,oid:string,documentId:string|null,jobId:string|null){
  const args={p_workshop_id:wid,p_order_id:oid,p_document_id:documentId,p_job_id:jobId}
  const ref=await rpc<{kind:string;document?:MPDocument;bytes?:string;hash?:string;size?:number}>(user,'bt_mp_read',args)
  let bytes:Uint8Array,hash:string,size:number
  if(ref.kind==='final'){
   const d=ref.document!;if(d.workshop_id!==wid||d.order_id!==oid||d.id!==documentId||d.bucket!==bucket||!d.path.startsWith(wid+'/inspections/'+oid+'/r'+d.revision+'/'))throw new MPError('MP_INTEGRITY_ERROR')
   const r=await trusted.storage.from(bucket).download(d.path);if(r.error||!r.data)throw new MPError('MP_ORIGINAL_MISSING',404)
   if(r.data.size!==d.byte_length)throw new MPError('MP_INTEGRITY_ERROR')
   bytes=new Uint8Array(await r.data.arrayBuffer());hash=d.pdf_hash;size=d.byte_length
  }else{bytes=unhex(ref.bytes!);hash=ref.hash!;size=ref.size!}
  if(bytes.length!==size||await sha(bytes)!==hash)throw new MPError('MP_INTEGRITY_ERROR')
  // Revocation during Storage I/O must not release bytes. No rerender or fallback.
  const fresh=await rpc<typeof ref>(user,'bt_mp_read',args)
  if(fresh.kind!==ref.kind||fresh.document?.pdf_hash!==ref.document?.pdf_hash||fresh.hash!==ref.hash)throw new MPError('MP_INTEGRITY_ERROR')
  return bytes
 }
 return {process,read}
}
