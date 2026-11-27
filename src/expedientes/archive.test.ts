import {describe,expect,it,vi} from 'vitest'
import type {SupabaseClient} from '@supabase/supabase-js'
import type {Context} from '../auth/controller'
import {ArchiveFailure,archiveMessage,validateDocumentSet,verifyArchivedBytes,type ArchiveDocumentSet,type ArchiveRow} from './contracts'
import {finalArchiveRepository} from './repository'
import {finalArchiveHandler} from '../../server/com/finalArchiveHandler'
const id=(n:number)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0')
const bytes=new TextEncoder().encode('%PDF-1.7\nSynthetic QA only\n%%EOF\n')
const sha=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes.slice().buffer)),n=>n.toString(16).padStart(2,'0')).join('')
const set:ArchiveDocumentSet={workshopId:id(1),revisionId:id(6),quoteId:id(5),orderId:id(4),vehicleId:id(3),customerId:id(2),revision:1,issuedAt:'2026-11-18T18:00:00Z',complete:false,
 documents:[{kind:'quote',fileName:'cotizacion-1-r1.pdf',bucket:'cp05-quote-documents',path:id(1)+'/quotes/'+id(5)+'/r1/'+'a'.repeat(64)+'.pdf',byteLength:bytes.length,sha256:sha,contentType:'application/pdf'}]}
const context={userId:id(7),role:'owner',workshop:{id:id(1),name:'Synthetic',status:'active'}} as Context
function fixture(){
 const rpc=vi.fn().mockResolvedValue({data:set,error:null}),invoke=vi.fn().mockResolvedValue({data:new Blob([bytes.slice().buffer],{type:'application/pdf'}),error:null})
 const getUser=vi.fn().mockResolvedValue({data:{user:{id:id(7),email_confirmed_at:'2026-11-18'}},error:null})
 const client={rpc,functions:{invoke},auth:{getUser}} as unknown as SupabaseClient
 return {client,rpc,invoke,getUser,repository:finalArchiveRepository(client,context)}
}
describe('final archive context and immutable bytes',()=>{
 it('accepts and verifies exact original PDF bytes',async()=>{expect(validateDocumentSet(set,id(1),id(6))).toEqual(set);expect(await verifyArchivedBytes(bytes,set.documents[0])).toEqual(bytes)})
 it('rejects same-length corrupted bytes rather than regenerating',async()=>{const corrupt=bytes.slice();corrupt[12]^=1;await expect(verifyArchivedBytes(corrupt,set.documents[0])).rejects.toMatchObject({kind:'integrity'})})
 it.each(['workshopId','revisionId','vehicleId'] as const)('rejects a mismatched %s',field=>{const changed={...set,[field]:'not-a-valid-id'};expect(()=>validateDocumentSet(changed,id(1),id(6))).toThrow(ArchiveFailure)})
 it.each(['arbitrary-bucket','../../secret','foreign-workshop'] as const)('rejects unsafe document reference %s',kind=>{const d={...set.documents[0]};if(kind==='arbitrary-bucket')d.bucket='public';if(kind==='../../secret')d.path+='../../other.pdf';if(kind==='foreign-workshop')d.path=d.path.replace(id(1),id(99));expect(()=>validateDocumentSet({...set,documents:[d]},id(1),id(6))).toThrow(ArchiveFailure)})
 it('never calls download for another workshop metadata',async()=>{const f=fixture();f.rpc.mockResolvedValueOnce({data:{...set,workshopId:id(99)},error:null});await expect(f.repository.bytes(id(6),'quote')).rejects.toMatchObject({kind:'denied'});expect(f.invoke).not.toHaveBeenCalled()})
 it('uses revision/kind and a valid commercial request UUID only; no browser-supplied Storage path',async()=>{const f=fixture();await f.repository.bytes(id(6),'quote');expect(f.invoke).toHaveBeenCalledTimes(1);const requestId=f.invoke.mock.calls[0][1].body.requestId;expect(requestId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);expect(f.invoke).toHaveBeenCalledWith('bt-final-archive',{body:{action:'download',workshopId:id(1),revisionId:id(6),kind:'quote',requestId}});expect(f.rpc).toHaveBeenCalledTimes(2)})
 it('does not deliver bytes if role/session disappears after download',async()=>{const f=fixture();f.getUser.mockResolvedValueOnce({data:{user:{id:id(7),email_confirmed_at:'confirmed'}},error:null}).mockResolvedValueOnce({data:{user:null},error:null});await expect(f.repository.bytes(id(6),'quote')).rejects.toMatchObject({kind:'denied'})})
 it('invalidates an in-flight Blob after disposal',async()=>{const f=fixture();f.invoke.mockImplementationOnce(async()=>{f.repository.dispose();return {data:new Blob([bytes.slice().buffer]),error:null}});await expect(f.repository.bytes(id(6),'quote')).rejects.toMatchObject({kind:'denied'})})
 it('mechanic has no archive-management UI data permission',async()=>{const f=fixture(),repo=finalArchiveRepository(f.client,{...context,role:'mechanic'});await expect(repo.list('')).rejects.toMatchObject({kind:'denied'});expect(f.rpc).not.toHaveBeenCalled()})
 it.each([[403,'denied'],[503,'disabled']] as const)('write error %s stays classified and cannot retain unauthorized access',async(status,kind)=>{
  const f=fixture();f.invoke.mockResolvedValueOnce({data:null,error:{context:new Response(null,{status})}})
  const row={workshopId:id(1),revisionId:id(6),orderId:id(4),deliveryId:id(32),canArchive:true} as ArchiveRow
  await expect(f.repository.archive(row,id(8))).rejects.toMatchObject({kind})
 })
 it('does not display SQL detail or tokens',async()=>{const f=fixture();f.rpc.mockResolvedValueOnce({data:null,error:{code:'XX000',message:'private-customer-detail',details:'private-token'}});const error=await f.repository.documents(id(6)).catch(e=>e);expect(archiveMessage(error)).not.toContain('private-');expect(String(error)).not.toContain('private-')})
})
describe('final archive HTTP boundary remains closed without approval',()=>{
 const deps={userClient:vi.fn(()=>{throw Error('MUST_NOT_CREATE_CLIENT')}),trustedClient:vi.fn(()=>{throw Error('MUST_NOT_CREATE_CLIENT')}),assets:vi.fn()}
 const request=(body:unknown,origin='https://bytetorque.cl')=>new Request('https://local.invalid/',{method:'POST',headers:{Origin:origin,Authorization:'Bearer synthetic-placeholder','Content-Type':'application/json'},body:JSON.stringify(body)})
 it('OFF requires no secret/client and returns 503',async()=>{const response=await finalArchiveHandler({read:false,write:false,origin:'https://bytetorque.cl'},deps)(request({}));expect(response.status).toBe(503);expect(deps.userClient).not.toHaveBeenCalled()})
 it('rejects external origin before credentials are consulted',async()=>{const response=await finalArchiveHandler({read:true,write:true,origin:'https://bytetorque.cl'},deps)(request({},'https://unapproved.invalid'));expect(response.status).toBe(403)})
 it('rejects arbitrary path injection in request',async()=>{const response=await finalArchiveHandler({read:true,write:true,origin:'https://bytetorque.cl'},deps)(request({action:'download',workshopId:id(1),revisionId:id(6),kind:'quote',path:'arbitrary/file.pdf'}));expect(response.status).toBe(400)})
 it('rejects large streaming body',async()=>{const response=await finalArchiveHandler({read:true,write:true,origin:'https://bytetorque.cl'},deps)(request({fill:'x'.repeat(5000)}));expect(response.status).toBe(400)})
 it('read enabled does not authorize archive writes',async()=>{const response=await finalArchiveHandler({read:true,write:false,origin:'https://bytetorque.cl'},deps)(request({action:'archive',workshopId:id(1),revisionId:id(6),orderId:id(4),deliveryId:id(32),requestId:id(8)}));expect(response.status).toBe(503)})
})
