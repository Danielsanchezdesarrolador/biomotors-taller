import {originalArchiveZip,archiveZipManifest} from '../../src/expedientes/originalZip'
import {CommercialFailure} from '../../src/plans/commercialErrors'
import {meteredDocument} from '../commercial/meteredDocument'
/** Concrete trusted SDK adapter. No keys or SDK construction; no storage paths from HTTP. */
import type {SupabaseClient} from '@supabase/supabase-js'
import {archiveClosingCandidate,type ClosingArchiveRequest,type ClosingArchiveManifest,type VerifiedClosingSnapshot} from './closingArchiveCandidate'
import {closingDocumentPdf} from '../../src/entrega/finalPdf'
import {ArchiveFailure,validateDocumentSet,verifyArchivedBytes,type DocumentKind,type ArchiveDocumentSet} from '../../src/expedientes/contracts'
async function rpc<T>(client:SupabaseClient,name:string,args:Record<string,unknown>):Promise<T>{
 const r=await client.rpc(name,args)
 if(r.error)throw new ArchiveFailure(r.error.code==='42501'?'denied':r.error.code==='55000'?'disabled':'unavailable')
 if(!r.data)throw new ArchiveFailure('missing')
 return r.data as T
}
export function finalArchivePorts(user:SupabaseClient,trusted:SupabaseClient,assets:()=>Promise<{font:Uint8Array;logo:Uint8Array;wordmark?:Uint8Array;boldFont?:Uint8Array}>){
 async function authenticate(){const r=await user.auth.getUser();if(r.error||!r.data.user?.email_confirmed_at)throw new ArchiveFailure('denied');return {id:r.data.user.id,confirmed:true}}
 async function documents(wid:string,rid:string){await authenticate();return validateDocumentSet(await rpc(user,'bt_final_archive_document',{p_workshop_id:wid,p_revision_id:rid}),wid,rid)}
 async function read(bucket:string,path:string){const r=await trusted.storage.from(bucket).download(path);if(r.error||!r.data)throw new ArchiveFailure('missing');if(r.data.size<12||r.data.size>20_000_000)throw new ArchiveFailure('integrity');return new Uint8Array(await r.data.arrayBuffer())}
 async function readDocument(wid:string,rid:string,kind:DocumentKind){
  const set=await documents(wid,rid),doc=set.documents.find(d=>d.kind===kind)
  if(!doc)throw new ArchiveFailure('missing')
  const bytes=await verifyArchivedBytes(await read(doc.bucket,doc.path),doc)
  const current=await documents(wid,rid),still=current.documents.find(d=>d.kind===kind)
  if(!still||JSON.stringify(still)!==JSON.stringify(doc))throw new ArchiveFailure('denied')
  return {bytes,doc}
 }
 async function archive(request:ClosingArchiveRequest){
  const actor=await authenticate()
  const args={p_workshop_id:request.workshopId,p_order_id:request.orderId,p_revision_id:request.revisionId,p_delivery_id:request.deliveryId}
  const source=await rpc<VerifiedClosingSnapshot|{completed:ClosingArchiveManifest}>(user,'bt_final_archive_source',args)
  if('completed' in source){
   for(const kind of ['quote','report','handover'] as const)await readDocument(request.workshopId,request.revisionId,kind)
   return source.completed // A completed retry NEVER loads fonts, renders or uploads.
  }
  return archiveClosingCandidate({approved:true},{
   authenticate,
   load:async()=>source,
   originalPdf:async path=>read('cp05-quote-documents',path),
   render:async(packet,kind)=>closingDocumentPdf(packet,kind,await assets()),
   putIfAbsent:async(path,bytes)=>{
    const bucket=trusted.storage.from('bt-closing-documents')
    const put=await bucket.upload(path,bytes,{contentType:'application/pdf',upsert:false})
    if(put.error){ // Existing-object retry is accepted ONLY if read-back is byte-identical.
     const old=await read('bt-closing-documents',path)
     if(old.length!==bytes.length||old.some((v,i)=>v!==bytes[i]))throw new ArchiveFailure('integrity')
    }
   },
   readBack:async path=>read('bt-closing-documents',path),
   recheck:async()=>{await authenticate();await rpc(user,'bt_final_archive_source',args);return true},
   commit:async(requestId,manifest)=>rpc<ClosingArchiveManifest>(trusted,'bt_final_archive_commit',{
    ...args,p_request_id:requestId,p_actor_id:actor.id,p_manifest:manifest
   })
  },request)
 }
 async function download(wid:string,rid:string,kind:DocumentKind,requestId:string=crypto.randomUUID()){
  if(kind!=='quote')return readDocument(wid,rid,kind)
  const result=await readDocument(wid,rid,kind)
  return {...result,bytes:await meteredDocument(user,trusted,{workshopId:wid,capability:'quote',resourceId:rid,requestId},async()=>result.bytes)}
 }
 async function zip(wid:string,rid:string,requestId:string){
  const actor=await authenticate()
  async function authorizeZip(){const current=await authenticate();if(current.id!==actor.id)throw new ArchiveFailure('denied');const status=await rpc<{workshopId:string;plan:string}>(user,'bt_commercial_status',{p_workshop_id:wid});if(status.workshopId!==wid)throw new ArchiveFailure('denied');if(!['plus','full'].includes(status.plan))throw new CommercialFailure('plan');return status.plan}
  const plan=await authorizeZip(),set=await documents(wid,rid);archiveZipManifest(set)
  const files:Uint8Array[]=[];let temporary:Uint8Array|undefined
  try{
   for(const kind of ['quote','report','handover'] as const){const result=await download(wid,rid,kind,requestId);files.push(result.bytes)}
   const result=await originalArchiveZip(set,files);temporary=result.bytes
   // Recheck after every asynchronous build/hash step, including original paid receipt/session.
   if(await authorizeZip()!==plan||JSON.stringify(await documents(wid,rid))!==JSON.stringify(set))throw new ArchiveFailure('denied')
   await meteredDocument(user,trusted,{workshopId:wid,capability:'quote',resourceId:rid,requestId},async()=>{throw new ArchiveFailure('denied')})
   temporary=undefined;return result
  }finally{temporary?.fill(0);for(const bytes of files)bytes.fill(0)}
 }
 return {authenticate,documents,download,archive,zip}
}
export type FinalArchiveMetadata=ArchiveDocumentSet
