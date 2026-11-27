import {it,expect,vi} from 'vitest'
import type {SupabaseClient} from '@supabase/supabase-js'
import {createHash} from 'node:crypto'
import {commercialDocumentHandler} from '../../server/commercial/documentHandler'
import {finalArchiveHandler} from '../../server/com/finalArchiveHandler'
import {documentHandlerCandidate} from '../../server/cp05/documentHandlerCandidate'
import {meteredDocument,CommercialOperationNotCurrent} from '../../server/commercial/meteredDocument'
const id=(n:number)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0'),wid=id(1),uid=id(2),rid=id(3),qid=id(8),origin='https://synthetic.invalid'
const pdf=new TextEncoder().encode('%PDF-1.7\nSYNTHETIC ORIGINAL\n%%EOF'),hash=createHash('sha256').update(pdf).digest('hex'),path=wid+'/quotes/'+qid+'/r1/'+'a'.repeat(64)+'.pdf'
function fixture(invalidation='CONSUMPTION_REPLAY_EXPIRED'){
 const records:Record<string,Record<string,unknown>>={workshop_memberships:{workshop_id:wid,user_id:uid,role:'owner',status:'active'},workshops:{id:wid,name:'Sintético',status:'active'},work_orders:{id:id(7),workshop_id:wid,vehicle_id:id(6)},vehicles:{id:id(6),workshop_id:wid,customer_id:id(5)},customers:{id:id(5),workshop_id:wid,full_name:'Cliente sintético'},quote_revisions:{id:rid,workshop_id:wid,quote_id:qid,revision:1,payload_sha256:'a'.repeat(64),pdf_object_path:path,pdf_sha256:hash,pdf_size:pdf.length}}
 const user={auth:{getUser:async()=>({data:{user:{id:uid,email_confirmed_at:'synthetic'}},error:null})},rpc:vi.fn(async(name:string,args:Record<string,unknown>)=>{
  expect(args.p_workshop_id).toBe(wid)
  if(name==='bt_commercial_reserve')return {data:null,error:{code:'42501',message:invalidation}}
  if(name==='bt_commercial_status')return {data:{workshopId:wid,inspectionEnabled:true,plan:'full'},error:null}
  if(name==='bt_final_archive_document')return {data:{workshopId:wid,revisionId:rid,quoteId:qid,orderId:id(7),vehicleId:id(6),customerId:id(5),revision:1,issuedAt:'2026-11-27T12:00:00Z',complete:false,documents:[{kind:'quote',fileName:'quote.pdf',bucket:'cp05-quote-documents',path,sha256:hash,byteLength:pdf.length,contentType:'application/pdf'}]},error:null}
  throw Error('Unexpected RPC '+name)
 }),from:(table:string)=>{const filters:Record<string,unknown>={};const get=()=>({data:table==='inspection_findings'?[]:Object.entries(filters).every(([k,v])=>records[table]?.[k]===v)?records[table]:null,error:null});const q={select:()=>q,eq:(k:string,v:unknown)=>{filters[k]=v;return q},maybeSingle:async()=>get(),single:async()=>get(),then:(r:(v:unknown)=>unknown)=>Promise.resolve(get()).then(r)};return q}} as unknown as SupabaseClient
 const trusted={rpc:vi.fn(),storage:{from:()=>({download:async()=>({data:new Blob([pdf]),error:null})})}} as unknown as SupabaseClient
 const assets=vi.fn(async()=>{throw Error('MUST_NOT_RENDER_EXPIRED_OPERATION')})
 return {user,trusted,assets}
}
it.each(['cp05','archive','multipunto','multipunto-changed'] as const)('%s full HTTP exposes only safe operation-invalidated code and no PDF for expired authorization',async kind=>{
 const f=fixture(kind==='multipunto-changed'?'CONSUMPTION_CONFLICT':undefined),handler=kind==='cp05'?documentHandlerCandidate({archiveApproved:true,emailApproved:false,pilotWorkshopId:wid,allowedOrigin:origin},{userClient:()=>f.user,trustedClient:()=>f.trusted,assets:f.assets,provider:()=>{throw Error('EMAIL_OFF')}}):kind==='archive'?finalArchiveHandler({read:true,write:false,origin},{userClient:()=>f.user,trustedClient:()=>f.trusted,assets:f.assets}):commercialDocumentHandler({user:()=>f.user,trusted:()=>f.trusted,assets:f.assets},origin)
 const body=kind.startsWith('multipunto')?{action:'multipunto',workshopId:wid,orderId:id(7),requestId:id(4)}:{action:'download',workshopId:wid,revisionId:rid,requestId:id(4),...(kind==='archive'?{kind:'quote'}:{})}
 const response=await handler(new Request(origin+'/documents',{method:'POST',headers:{origin,authorization:'Bearer synthetic','content-type':'application/json'},body:JSON.stringify(body)}))
 expect(response.status).toBe(409);expect(await response.json()).toEqual({error:'DOCUMENT_OPERATION_NOT_CURRENT'});expect(f.assets).not.toHaveBeenCalled();expect(f.trusted.rpc).not.toHaveBeenCalled()
})
it('expiry or plan change during finish withholds render bytes and permits no automatic replacement reservation',async()=>{
 const f=fixture();vi.mocked(f.user.rpc).mockResolvedValueOnce({data:{workshop_id:wid,actor_id:uid,resource_id:rid,request_id:id(4),state:'reserved'},error:null} as never)
 vi.mocked(f.trusted.rpc).mockResolvedValueOnce({data:null,error:{message:'PLAN_CHANGED_RETRY'}} as never).mockResolvedValue({data:null,error:null} as never)
 await expect(meteredDocument(f.user,f.trusted,{workshopId:wid,capability:'quote',resourceId:rid,requestId:id(4)},async()=>pdf)).rejects.toBeInstanceOf(CommercialOperationNotCurrent)
 expect(f.user.rpc).toHaveBeenCalledTimes(1);expect(vi.mocked(f.trusted.rpc).mock.calls.at(-1)?.[1]).toMatchObject({p_success:false})
})
