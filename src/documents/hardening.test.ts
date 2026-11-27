import {it,expect,vi,afterEach} from 'vitest'
import {commercialDocumentRequest,documentClient} from '../cp05/documentClient'
import {documentOperationKey,DocumentOperationExpired,restartDocumentOperation,assertDocumentOperation} from './operation'
import {documentFence,invalidateDocuments,documentURL,setDocumentAuthority} from '../auth/documentAccess'
import {finalArchiveRepository} from '../expedientes/repository'
import {createHash} from 'node:crypto'
import type {Context} from '../auth/controller'
import type {SupabaseClient} from '@supabase/supabase-js'
import type {Revision} from '../cp05/contracts'
const id=(n:number)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0')
let serial=3000
const context=():Context=>({userId:id(++serial),workshop:{id:id(1),name:'Sintético',status:'active'},role:'owner'})
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();vi.restoreAllMocks()})
it('quote and final-archive paths preserve identity across local clock expiry until explicit server-directed renewal',()=>{
 vi.useFakeTimers();const c=context(),rid=id(7),first=commercialDocumentRequest(c,rid)
 vi.advanceTimersByTime(240001);expect(commercialDocumentRequest(c,rid)).toBe(first)
 vi.advanceTimersByTime(60000);expect(commercialDocumentRequest(c,rid)).toBe(first)
 const key=documentOperationKey(c.userId,c.workshop.id,rid)
 restartDocumentOperation(new DocumentOperationExpired(key))
 expect(commercialDocumentRequest(c,rid)).not.toBe(first)
})
it('unavailable storage and clock rollback preserve one identity; only the server grants access',()=>{
 vi.useFakeTimers();vi.stubGlobal('sessionStorage',{getItem:()=>{throw Error('UNAVAILABLE')},setItem:()=>{throw Error('UNAVAILABLE')}})
 const c=context(),rid=id(7),now=Date.now(),first=commercialDocumentRequest(c,rid)
 expect(commercialDocumentRequest(c,rid)).toBe(first);vi.setSystemTime(now-1);expect(commercialDocumentRequest(c,rid)).toBe(first)
})
it('tenant and actor identities are isolated, explicit renewal invalidates outstanding operation references',()=>{
 const a=context(),b=context(),rid=id(7),key=documentOperationKey(a.userId,a.workshop.id,rid),old=commercialDocumentRequest(a,rid)
 expect(commercialDocumentRequest(b,rid)).not.toBe(old);expect(commercialDocumentRequest({...a,workshop:{...a.workshop,id:id(9)}},rid)).not.toBe(old)
 restartDocumentOperation(new DocumentOperationExpired(key));expect(()=>assertDocumentOperation(key,old)).toThrow(DocumentOperationExpired)
})
it('authority changes revoke tracked URLs and reject old responses even after Full -> Basic -> Full ABA',()=>{
 vi.useFakeTimers();const revoke=vi.spyOn(URL,'revokeObjectURL').mockImplementation(()=>{});vi.spyOn(URL,'createObjectURL').mockReturnValue('blob:synthetic-only')
 setDocumentAuthority('synthetic-full');const fence=documentFence();documentURL(new Uint8Array([1,2,3]))
 setDocumentAuthority('synthetic-basic');setDocumentAuthority('synthetic-full');expect(revoke).toHaveBeenCalledWith('blob:synthetic-only');expect(fence.current()).toBe(false);expect(()=>fence.assert()).toThrow()
 const current=documentFence();setDocumentAuthority('synthetic-full');expect(current.current()).toBe(true)
})
function clients(c:Context){
 const bytes=new TextEncoder().encode('%PDF-1.7\nSYNTHETIC IMMUTABLE\n%%EOF'),hash=createHash('sha256').update(bytes).digest('hex'),rid=id(7),qid=id(8)
 const revision={id:rid,workshop_id:c.workshop.id,pdf_size:bytes.length,pdf_sha256:hash} as Revision
 const doc={kind:'quote',bucket:'cp05-quote-documents',path:c.workshop.id+'/quotes/'+qid+'/r1/'+'a'.repeat(64)+'.pdf',fileName:'quote.pdf',sha256:hash,byteLength:bytes.length,contentType:'application/pdf'}
 let hold:(()=>Promise<void>)|null=null,deny=false,expired=false
 const invoke=vi.fn(async(_name:string,_args:unknown)=>{if(hold)await hold();return expired?{data:null,error:{context:Response.json({error:'DOCUMENT_OPERATION_NOT_CURRENT'},{status:409})}}:deny?{error:{context:new Response(null,{status:403})},data:null}:{error:null,data:new Blob([bytes])}})
 const user={auth:{getUser:async()=>({error:null,data:{user:{id:c.userId,email_confirmed_at:'synthetic'}}})},functions:{invoke},rpc:async()=>({error:null,data:{workshopId:c.workshop.id,revisionId:rid,quoteId:qid,orderId:id(9),vehicleId:id(10),customerId:id(11),revision:1,issuedAt:'2026-11-27T12:00:00Z',complete:false,documents:[doc]}})} as unknown as SupabaseClient
 return {user,revision,bytes,rid,invoke,hold:(fn:()=>Promise<void>)=>{hold=fn},deny:()=>{deny=true},expireServer:()=>{expired=true}}
}
it('every quote and final archive action invokes server with the same UUID even when the client clock passes five minutes',async()=>{
 vi.useFakeTimers();const c=context(),f=clients(c),quote=documentClient(f.user,c,{archive:true,email:false}),archive=finalArchiveRepository(f.user,c)
 expect(await quote.download(f.revision)).toEqual(f.bytes);expect((await archive.bytes(f.rid,'quote')).bytes).toEqual(f.bytes)
 expect(f.invoke).toHaveBeenCalledTimes(2);const bodies=f.invoke.mock.calls.map(c=>(c[1] as {body:{requestId:string}}).body.requestId);expect(bodies[0]).toBe(bodies[1])
 vi.advanceTimersByTime(300001);await quote.download(f.revision);await archive.bytes(f.rid,'quote');expect(f.invoke).toHaveBeenCalledTimes(4);expect(f.invoke.mock.calls.every(c=>(c[1] as {body:{requestId:string}}).body.requestId===bodies[0])).toBe(true)
})
it.each(['quote','archive'] as const)('%s path discards a pending response on authority/session/tenant invalidation',async kind=>{
 const c=context(),f=clients(c);let arrived!:()=>void,release!:()=>void;const started=new Promise<void>(r=>{arrived=r}),barrier=new Promise<void>(r=>{release=r});f.hold(async()=>{arrived();await barrier})
 const port=kind==='quote'?documentClient(f.user,c,{archive:true,email:false}):finalArchiveRepository(f.user,c)
 const pending=kind==='quote'?(port as ReturnType<typeof documentClient>).download(f.revision):(port as ReturnType<typeof finalArchiveRepository>).bytes(f.rid,'quote')
 await started;invalidateDocuments();release();await expect(pending).rejects.toThrow()
})
it.each(['quote','archive'] as const)('%s denies a new action after a successful download without fallback bytes',async kind=>{
 const c=context(),f=clients(c),quote=documentClient(f.user,c,{archive:true,email:false}),archive=finalArchiveRepository(f.user,c)
 const action=()=>kind==='quote'?quote.download(f.revision):archive.bytes(f.rid,'quote')
 await action();f.deny();await expect(action()).rejects.toThrow();expect(f.invoke).toHaveBeenCalledTimes(2)
})

it.each(['quote','archive'] as const)('%s decodes server invalidation without silently opening a new operation',async kind=>{
 const c=context(),f=clients(c),quote=documentClient(f.user,c,{archive:true,email:false}),archive=finalArchiveRepository(f.user,c),action=()=>kind==='quote'?quote.download(f.revision):archive.bytes(f.rid,'quote')
 await action();f.expireServer();await expect(action()).rejects.toBeInstanceOf(DocumentOperationExpired)
 expect(f.invoke).toHaveBeenCalledTimes(2);const calls=f.invoke.mock.calls.map(c=>(c[1] as {body:{requestId:string}}).body.requestId);expect(calls[1]).toBe(calls[0])
})
