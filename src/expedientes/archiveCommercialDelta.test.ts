import {it,expect,vi} from 'vitest'
import type {SupabaseClient} from '@supabase/supabase-js'
import type {Context} from '../auth/controller'
import {finalArchiveRepository} from './repository'
import {ArchiveFailure,isArchiveAccessDenied,archiveMessage,type ArchiveDocumentSet} from './contracts'
import {CommercialFailure,documentFailure} from '../plans/commercialErrors'
import {DocumentOperationExpired} from '../documents/operation'
const id=(n:number)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0'),wid=id(1),rid=id(6),uid=id(7)
const bytes=new TextEncoder().encode('%PDF-1.7\nSynthetic original only\n%%EOF\n')
const sha=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes.slice().buffer)),n=>n.toString(16).padStart(2,'0')).join('')
const doc={kind:'quote' as const,fileName:'quote.pdf',bucket:'cp05-quote-documents',path:wid+'/quotes/'+id(5)+'/r1/'+'a'.repeat(64)+'.pdf',byteLength:bytes.length,sha256:sha,contentType:'application/pdf' as const}
const set:ArchiveDocumentSet={workshopId:wid,revisionId:rid,quoteId:id(5),orderId:id(4),vehicleId:id(3),customerId:id(2),revision:1,issuedAt:'2026-11-18T18:00:00Z',complete:false,documents:[doc]}
const context={userId:uid,role:'owner',workshop:{id:wid,name:'Synthetic',status:'active'}} as Context
function fixture(){let response=new Response(bytes.slice().buffer,{headers:{'content-type':'application/pdf'}})
 const requests:Record<string,unknown>[]=[]
 const rpc=vi.fn(async()=>({data:set,error:null})),getUser=vi.fn(async()=>({data:{user:{id:uid,email_confirmed_at:'confirmed'}},error:null}))
 const invoke=vi.fn(async(_name:string,args:{body:Record<string,unknown>})=>{requests.push(args.body);const r=response.clone();return r.ok?{data:await r.blob(),error:null}:{data:null,error:{context:r}}})
 const repository=finalArchiveRepository({rpc,auth:{getUser},functions:{invoke}} as unknown as SupabaseClient,context)
 return {repository,requests,rpc,invoke,respond:(status:number,error:string)=>{response=Response.json({error},{status})}}
}
it.each([[404,'missing'],[409,'integrity'],[503,'disabled']] as const)('real historical quote repository preserves HTTP %s as %s, even with misleading commercial body',async(status,kind)=>{
 const f=fixture();const first=await f.repository.bytes(rid,'quote');expect(first.bytes).toEqual(bytes);f.respond(status,'COMMERCIAL_QUOTA_EXHAUSTED')
 const e=await f.repository.bytes(rid,'quote').catch(e=>e);expect(e).toBeInstanceOf(ArchiveFailure);expect(e).toMatchObject({kind});expect(archiveMessage(e)).not.toMatch(/plan superior|Plus y Full/);expect(f.requests[1].requestId).toBe(f.requests[0].requestId);expect(f.invoke).toHaveBeenCalledTimes(2)
})
it.each([401,403])('HTTP %s cannot be disguised as a commercial upgrade or bypass access cleanup',async status=>{
 const f=fixture();await f.repository.bytes(rid,'quote');f.respond(status,status===401?'PLAN_CAPABILITY_REQUIRED':'SESSION_INVALID')
 const e=await f.repository.bytes(rid,'quote').catch(e=>e);expect(isArchiveAccessDenied(e)).toBe(true);expect(archiveMessage(e)).not.toMatch(/plan superior|Plus y Full/)
})
it.each([[403,'PLAN_CAPABILITY_REQUIRED','plan'],[429,'COMMERCIAL_QUOTA_EXHAUSTED','quota']] as const)('known commercial %s/%s remains distinct without authorizing bytes or rotation',async(status,code,reason)=>{
 const f=fixture();await f.repository.bytes(rid,'quote');f.respond(status,code);const e=await f.repository.bytes(rid,'quote').catch(e=>e);expect(e).toBeInstanceOf(CommercialFailure);expect(e.reason).toBe(reason);expect(isArchiveAccessDenied(e)).toBe(false);expect(f.requests[1].requestId).toBe(f.requests[0].requestId)
})
it('real repository preserves exact 409 explicit-renewal route without creating UUID or consuming automatically',async()=>{const f=fixture();await f.repository.bytes(rid,'quote');f.respond(409,'DOCUMENT_OPERATION_NOT_CURRENT');const e=await f.repository.bytes(rid,'quote').catch(e=>e);expect(e).toBeInstanceOf(DocumentOperationExpired);expect(f.requests[1].requestId).toBe(f.requests[0].requestId);expect(f.invoke).toHaveBeenCalledTimes(2)})
it.each([401,403,404,500,503])('an operation-not-current body under HTTP %s is not permission to renew',async status=>{const f=fixture();f.respond(status,'DOCUMENT_OPERATION_NOT_CURRENT');const e=await f.repository.bytes(rid,'quote').catch(e=>e);expect(e).not.toBeInstanceOf(DocumentOperationExpired);expect(f.invoke).toHaveBeenCalledOnce()})
it.each(['session','permission'] as const)('CommercialFailure %s is included in archive defensive cleanup',reason=>expect(isArchiveAccessDenied(new CommercialFailure(reason))).toBe(true))
it.each([404,409,500,503])('generic document decoder does not commercially promote an error body under HTTP %s',async status=>expect((await documentFailure({context:Response.json({error:'COMMERCIAL_QUOTA_EXHAUSTED'},{status})})).reason).toBe('connection'))
it('successful historical retry still verifies canonical original hash and keeps operation identity',async()=>{const f=fixture();const a=await f.repository.bytes(rid,'quote'),b=await f.repository.bytes(rid,'quote');expect(a.bytes).toEqual(b.bytes);expect(a.doc.sha256).toBe(sha);expect(f.requests[1].requestId).toBe(f.requests[0].requestId);expect(f.rpc).toHaveBeenCalledTimes(4)})
