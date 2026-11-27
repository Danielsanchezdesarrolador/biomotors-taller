import {archiveZipManifest,archiveZipName,verifyOriginalArchiveZip,MAX_ARCHIVE_BYTES} from './originalZip'
import {CommercialFailure} from '../plans/commercialErrors'
import {documentFence} from '../auth/documentAccess'
import {documentOperationKey,assertDocumentOperation,DocumentOperationExpired,isDocumentOperationNotCurrent} from '../documents/operation'
import {commercialDocumentRequest} from '../cp05/documentClient'
import type {SupabaseClient} from '@supabase/supabase-js'
import type {Context} from '../auth/controller'
import {ArchiveFailure,archiveDownloadFailure,archiveId,validateDocumentSet,verifyArchivedBytes,type ArchiveRow,type ArchivedDocument,type DocumentKind} from './contracts'
export function finalArchiveRepository(client:SupabaseClient,context:Context){
 const wid=archiveId(context.workshop.id),uid=archiveId(context.userId);let closed=false
 const valid=()=>{if(closed||!['owner','admin'].includes(context.role))throw new ArchiveFailure('denied')}
 async function guard(){valid();const r=await client.auth.getUser();valid();if(r.error||r.data.user?.id!==uid||!r.data.user.email_confirmed_at)throw new ArchiveFailure('denied')}
 function error(code?:string):never{throw new ArchiveFailure(code==='42501'?'denied':code==='55000'?'disabled':'unavailable')}
 async function rpc(name:string,args:Record<string,unknown>){await guard();const r=await client.rpc(name,{p_workshop_id:wid,...args});valid();if(r.error)error(r.error.code);return r.data}
 async function documents(rid:string){return validateDocumentSet(await rpc('bt_final_archive_document',{p_revision_id:archiveId(rid)}),wid,rid)}
 return {
  async list(query:string,vehicleId?:string,after?:{at:string;id:string}):Promise<ArchiveRow[]>{
   if(query.length>80||after&&!Number.isFinite(Date.parse(after.at)))throw new ArchiveFailure('invalid')
   const rows=await rpc('bt_final_archive_catalog',{p_query:query.trim(),p_vehicle_id:vehicleId?archiveId(vehicleId):null,p_after_time:after?.at??null,p_after_id:after?archiveId(after.id):null})
   if(!Array.isArray(rows)||rows.length>31)throw new ArchiveFailure('unavailable')
   for(const row of rows){if(!row||row.workshopId!==wid||![row.revisionId,row.quoteId,row.orderId,row.customerId,row.vehicleId].every(x=>typeof x==='string'&&archiveId(x))||vehicleId&&row.vehicleId!==vehicleId)throw new ArchiveFailure('denied')
    if(typeof row.customerName!=='string'||typeof row.canArchive!=='boolean'||!Number.isSafeInteger(row.total)||row.total<0||!Number.isSafeInteger(row.revision)||row.revision<1||!Number.isFinite(Date.parse(row.issuedAt)))throw new ArchiveFailure('unavailable')}
   return rows
  },documents,
  async bytes(rid:string,kind:DocumentKind):Promise<{bytes:Uint8Array;doc:ArchivedDocument;expiresAt?:number;operationKey?:string}>{
   const fence=documentFence(),operationKey=documentOperationKey(uid,wid,rid),requestId=kind==='quote'?commercialDocumentRequest(context,rid):undefined
   const set=await documents(rid),doc=set.documents.find(x=>x.kind===kind);if(!doc)throw new ArchiveFailure('missing')
   const r=await client.functions.invoke('bt-final-archive',{body:{action:'download',workshopId:wid,revisionId:archiveId(rid),kind,...(kind==='quote'?{requestId}:{})}})
   valid()
   if(r.error){if(requestId&&(r.error as {context?:Response}).context?.status===409&&await isDocumentOperationNotCurrent(r.error))throw new DocumentOperationExpired(operationKey,'invalidated');throw await archiveDownloadFailure(r.error,kind==='quote')}
   if(!(r.data instanceof Blob))throw new ArchiveFailure('unavailable')
   const bytes=await verifyArchivedBytes(new Uint8Array(await r.data.arrayBuffer()),doc)
   const checked=await documents(rid);valid()
   if(JSON.stringify(checked.documents.find(x=>x.kind===kind))!==JSON.stringify(doc))throw new ArchiveFailure('denied')
   fence.assert();if(requestId)assertDocumentOperation(operationKey,requestId)
   return {bytes,doc,...(requestId?{expiresAt:Date.now()+300000,operationKey}:{})}
  },
  async zip(rid:string){
   const fence=documentFence(),operationKey=documentOperationKey(uid,wid,rid),requestId=commercialDocumentRequest(context,rid)
   const set=await documents(rid);archiveZipManifest(set)
   const r=await client.functions.invoke('bt-final-archive',{body:{action:'zip',workshopId:wid,revisionId:archiveId(rid),requestId}});valid()
   if(r.error){const status=(r.error as {context?:Response}).context?.status;if(status===409&&await isDocumentOperationNotCurrent(r.error))throw new DocumentOperationExpired(operationKey,'invalidated');if(status===413)throw new ArchiveFailure('too_large');throw await archiveDownloadFailure(r.error,true)}
   if(!(r.data instanceof Blob))throw new ArchiveFailure('unavailable')
   if(r.data.size>MAX_ARCHIVE_BYTES+2048)throw new ArchiveFailure('too_large')
   const bytes=new Uint8Array(await r.data.arrayBuffer())
   try{
    await verifyOriginalArchiveZip(bytes,set)
    if(JSON.stringify(await documents(rid))!==JSON.stringify(set))throw new ArchiveFailure('denied')
    const status=await rpc('bt_commercial_status',{})
    if(status?.workshopId!==wid)throw new ArchiveFailure('denied');if(!['plus','full'].includes(status.plan))throw new CommercialFailure('plan')
    fence.assert();assertDocumentOperation(operationKey,requestId);valid()
    return {bytes,fileName:archiveZipName(set)}
   }catch(error){bytes.fill(0);throw error}
  },
  async archive(row:ArchiveRow,requestId:string){
   if(row.workshopId!==wid||!row.deliveryId||!row.canArchive)throw new ArchiveFailure('invalid')
   await guard()
   const r=await client.functions.invoke('bt-final-archive',{body:{action:'archive',workshopId:wid,revisionId:archiveId(row.revisionId),orderId:archiveId(row.orderId),deliveryId:archiveId(row.deliveryId),requestId:archiveId(requestId)}})
   valid()
   if(r.error){const status=(r.error as {context?:Response}).context?.status;throw new ArchiveFailure(status===401||status===403?'denied':status===503?'disabled':status===400?'invalid':'unavailable')}
   const m=r.data?.manifest
   if(m?.workshopId!==wid||m.revisionId!==row.revisionId||m.orderId!==row.orderId||m.deliveryId!==row.deliveryId)throw new ArchiveFailure('denied')
   // A confirmed receipt stays successful even if the following UI read fails.
   return {revisionId:row.revisionId,confirmed:true as const}
  },dispose(){closed=true}
 }
}
export type FinalArchivePort=ReturnType<typeof finalArchiveRepository>
