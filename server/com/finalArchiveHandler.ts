/** New endpoint candidate; no deployment/secret lookup. Every read checks the live session twice. */
import type {SupabaseClient} from '@supabase/supabase-js'
import {ArchiveFailure,archiveId,type DocumentKind} from '../../src/expedientes/contracts'
import {finalArchivePorts} from './finalArchivePorts'
export function finalArchiveHandler(policy:{read:boolean;write:boolean;origin:string},deps:{userClient:(authorization:string)=>SupabaseClient;trustedClient:()=>SupabaseClient;assets:()=>Promise<{font:Uint8Array;logo:Uint8Array}>}){
 return async(request:Request)=>{
  const origin=request.headers.get('origin')
  const headers={'Cache-Control':'no-store','Vary':'Origin','X-Content-Type-Options':'nosniff',
   ...(origin===policy.origin?{'Access-Control-Allow-Origin':origin}:{}),
   'Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS'}
  const reply=(error:string,status:number)=>Response.json({error},{status,headers})
  if(origin&&origin!==policy.origin)return reply('DENIED',403)
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers})
  if(request.method!=='POST')return reply('METHOD',405)
  if(!policy.read)return reply('DISABLED',503)
  try{
   const authorization=request.headers.get('authorization')||''
   if(!/^Bearer [^\s]+$/.test(authorization))return reply('DENIED',401)
   if(!/^application\/json(?:;|$)/i.test(request.headers.get('content-type')||''))return reply('INVALID',400)
   const reader=request.body?.getReader();if(!reader)return reply('INVALID',400)
   let bytes=0,text='';const decoder=new TextDecoder()
   for(;;){const chunk=await reader.read();if(chunk.done)break;bytes+=chunk.value.length;if(bytes>4096){await reader.cancel();return reply('INVALID',400)}text+=decoder.decode(chunk.value,{stream:true})}
   text+=decoder.decode()
   const body=JSON.parse(text)
   if(!body||typeof body!=='object'||Array.isArray(body))return reply('INVALID',400)
   const id=(value:unknown)=>{if(typeof value!=='string')throw new ArchiveFailure('invalid');return archiveId(value)}
   const wid=id(body.workshopId),rid=id(body.revisionId)
   const allowed=body.action==='archive'?['action','workshopId','revisionId','orderId','deliveryId','requestId']:['action','workshopId','revisionId','kind',...(body.action==='download'&&body.kind==='quote'?['requestId']:[])]
   if(Object.keys(body).some(k=>!allowed.includes(k)))return reply('INVALID',400)
   if(body.action==='archive'&&!policy.write)return reply('DISABLED',503)
   if(!['archive','download'].includes(body.action))return reply('INVALID',400)
   if(body.action==='download'&&!['quote','report','handover'].includes(body.kind))return reply('INVALID',400)
   const downloadRequest=body.action==='download'&&body.kind==='quote'?id(body.requestId):undefined
   const ports=finalArchivePorts(deps.userClient(authorization),deps.trustedClient(),deps.assets)
   if(body.action==='archive'){
    const manifest=await ports.archive({workshopId:wid,revisionId:rid,orderId:id(body.orderId),deliveryId:id(body.deliveryId),requestId:id(body.requestId)})
    return Response.json({manifest},{headers})
   }
   if(!['quote','report','handover'].includes(body.kind))return reply('INVALID',400)
   const {bytes:pdf,doc}=await ports.download(wid,rid,body.kind as DocumentKind,downloadRequest)
   return new Response(pdf.slice().buffer,{headers:{...headers,'Content-Type':'application/pdf',
    'Content-Disposition':'attachment; filename="'+doc.fileName+'"','Content-Length':String(pdf.length)}})
  }catch(error){
   const kind=error instanceof ArchiveFailure?error.kind:'unavailable'
   return reply(kind.toUpperCase(),kind==='denied'?403:kind==='invalid'?400:kind==='disabled'?503:kind==='missing'?404:kind==='integrity'?409:500)
  }
 }
}
