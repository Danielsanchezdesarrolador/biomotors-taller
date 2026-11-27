import {it,expect,vi} from 'vitest'
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {PDFDocument} from 'pdf-lib'
import type {SupabaseClient} from '@supabase/supabase-js'
import {finalArchiveHandler} from '../../server/com/finalArchiveHandler'
import {commercialDocumentHandler} from '../../server/commercial/documentHandler'
const id=(n:number)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0'),wid=id(1),uid=id(2),rid=id(3),requestId=id(4),origin='https://synthetic.invalid'
const digest=(bytes:Uint8Array)=>createHash('sha256').update(bytes).digest('hex')
const pdf=new TextEncoder().encode('%PDF-1.7\nSynthetic archived immutable original\n%%EOF')
const assets={font:new Uint8Array(readFileSync('public/cp05/DejaVuSans.ttf')),logo:new Uint8Array(readFileSync('assets/brand/generated/icon-192.png')),light:new Uint8Array(readFileSync('apps/android/assets/brand/logo-horizontal.png')),dark:new Uint8Array(readFileSync('apps/android/assets/brand/logo-horizontal-dark.png'))}
const request=(body:unknown)=>new Request(origin+'/documents',{method:'POST',headers:{origin,authorization:'Bearer synthetic-only','content-type':'application/json'},body:JSON.stringify(body)})
function fixture(complete=false){
 let state='reserved',committed='',confirmations=0,revoked=false,quotaDenied=false,cacheDenied=false,corruptOriginal=false
 const attempts:string[]=[]
 const rows:Record<string,Record<string,unknown>>={customers:{id:id(5),workshop_id:wid,full_name:'Cliente sintético',email:null},vehicles:{id:id(6),workshop_id:wid,customer_id:id(5),plate:'QA1234',make:'Sintético',model:'Concurrencia'},work_orders:{id:id(7),workshop_id:wid,vehicle_id:id(6),opened_at:'2026-11-26T12:00:00Z',intake_odometer:120000,complaint:'Prueba aislada'},workshops:{id:wid,name:'Taller sintético'}}
 const doc={kind:'quote',fileName:'cotizacion.pdf',bucket:'cp05-quote-documents',path:wid+'/quotes/'+id(8)+'/r1/'+'a'.repeat(64)+'.pdf',sha256:digest(pdf),byteLength:pdf.length,contentType:'application/pdf'}
 const docs=[doc,...complete?(['report','handover'] as const).map(kind=>({...doc,kind,fileName:kind+'.pdf',bucket:'bt-closing-documents',path:wid+'/closings/'+id(7)+'/'+rid+'/'+requestId+'/'+kind+'/'+digest(pdf)+'.pdf'})):[]]
 const user={auth:{getUser:vi.fn(async()=>({data:{user:revoked?null:{id:uid,email_confirmed_at:'confirmed'}},error:null}))},rpc:vi.fn(async(name:string,args:Record<string,unknown>)=>{
  if(revoked||args.p_workshop_id!==wid)return {data:null,error:{code:'42501'}}
  if(name==='bt_final_archive_document'){if(args.p_revision_id!==rid)return {data:null,error:{code:'42501'}};return {data:{workshopId:wid,revisionId:rid,quoteId:id(8),orderId:id(7),vehicleId:id(6),customerId:id(5),revision:1,issuedAt:'2026-11-26T12:00:00Z',complete,documents:docs},error:null}}
  if(name==='bt_commercial_status')return {data:{workshopId:wid,inspectionEnabled:true,plan:'plus'},error:null}
  if(name!=='bt_commercial_reserve')throw Error('Unexpected caller RPC '+name)
  if(quotaDenied)return {data:null,error:{code:'P0001'}}
  expect(args.p_request_id).toBe(requestId);expect(['quote','multipunto']).toContain(args.p_capability)
  return {data:{workshop_id:wid,actor_id:uid,resource_id:args.p_resource_id,request_id:requestId,state},error:null}
 }),from:(table:string)=>{const filters:Record<string,unknown>={};const result=()=>({data:table==='inspection_findings'?[]:Object.entries(filters).every(([k,v])=>rows[table]?.[k]===v)?rows[table]:null,error:null});const q={select:()=>q,eq:(k:string,v:unknown)=>{filters[k]=v;return q},single:async()=>result(),maybeSingle:async()=>result(),then:(resolve:(v:unknown)=>unknown)=>Promise.resolve(result()).then(resolve)};return q}} as unknown as SupabaseClient
 const trusted={rpc:vi.fn(async(name:string,args:Record<string,unknown>)=>{
  expect(args.p_request_id).toBe(requestId);expect(args.p_actor_id).toBe(uid)
  if(name==='bt_commercial_cached')return {data:cacheDenied?null:committed,error:cacheDenied?{code:'42501'}:null}
  if(name!=='bt_commercial_finish')throw Error('Unexpected trusted RPC '+name)
  if(args.p_success){attempts.push(String(args.p_bytes).slice(2));if(state!=='confirmed'){committed=attempts.at(-1)!;confirmations++;state='confirmed'}}
  return {data:{state,request_id:requestId},error:null}
 }),storage:{from:(bucket:string)=>({download:vi.fn(async(path:string)=>{expect(docs.some(d=>d.bucket===bucket&&d.path===path)).toBe(true);return {data:new Blob([(corruptOriginal?new Uint8Array([...pdf,0]):pdf).slice().buffer]),error:null}})})}} as unknown as SupabaseClient
 const deps={userClient:vi.fn(()=>user),trustedClient:vi.fn(()=>trusted),assets:vi.fn(async()=>assets)}
 return {user,trusted,deps,attempts,get committed(){return committed},get confirmations(){return confirmations},revoke:()=>{revoked=true},exhaust:()=>{quotaDenied=true},denyCache:()=>{cacheDenied=true},corrupt:()=>{corruptOriginal=true}}
}
const download={action:'download',workshopId:wid,revisionId:rid,kind:'quote',requestId}
it('full archive HTTP accepts scoped quote requestId, meters once and returns exact historical bytes on retry',async()=>{
 const f=fixture(),handler=finalArchiveHandler({read:true,write:false,origin},f.deps)
 for(let n=0;n<2;n++){const r=await handler(request(download));expect(r.status).toBe(200);expect(r.headers.get('content-type')).toBe('application/pdf');expect(new Uint8Array(await r.arrayBuffer())).toEqual(pdf)}
 expect(f.confirmations).toBe(1);expect(f.attempts).toHaveLength(1);expect(f.deps.assets).not.toHaveBeenCalled()
})
it.each(['report','handover'])('archive HTTP preserves historical %s reads without quote requestId or consumption',async kind=>{
 const f=fixture(true),{requestId:_unused,...body}=download;const handler=finalArchiveHandler({read:true,write:false,origin},f.deps)
 const response=await handler(request({...body,kind}));expect(response.status).toBe(200);expect(new Uint8Array(await response.arrayBuffer())).toEqual(pdf)
 expect(vi.mocked(f.user.rpc).mock.calls.map(c=>c[0])).toEqual(['bt_final_archive_document','bt_final_archive_document']);expect(f.confirmations).toBe(0)
})
it.each([undefined,null,'',17,[],[requestId],{},'invalid-uuid'])('archive HTTP rejects non-UUID/non-string request identity: %j',async(value)=>{
 const f=fixture(),r=await finalArchiveHandler({read:true,write:false,origin},f.deps)(request({...download,requestId:value}))
 expect(r.status).toBe(400);expect(r.headers.get('content-type')).not.toBe('application/pdf');expect(f.deps.userClient).not.toHaveBeenCalled();expect(f.deps.trustedClient).not.toHaveBeenCalled()
})
it.each([{...download,extra:'not-allowed'},{...download,kind:'report'},{...download,kind:'handover'},{...download,kind:'unknown'}])('archive HTTP rejects unknown fields and requestId outside quote contract: %j',async body=>{
 const f=fixture(),r=await finalArchiveHandler({read:true,write:false,origin},f.deps)(request(body));expect(r.status).toBe(400);expect(f.deps.trustedClient).not.toHaveBeenCalled()
})
it.each(['foreignWorkshop','foreignRevision','revoked','quota','corrupt'] as const)('archive HTTP withholds final bytes on %s',async fault=>{
 const f=fixture();if(fault==='revoked')f.revoke();if(fault==='quota')f.exhaust();if(fault==='corrupt')f.corrupt()
 const r=await finalArchiveHandler({read:true,write:false,origin},f.deps)(request({...download,...fault==='foreignWorkshop'?{workshopId:id(99)}:fault==='foreignRevision'?{revisionId:id(99)}:{}}))
 expect(r.status).not.toBe(200);expect(r.headers.get('content-type')).not.toBe('application/pdf');expect(new TextDecoder().decode(await r.arrayBuffer())).not.toContain('%PDF-');expect(f.confirmations).toBe(0)
})
it('simultaneous multipunto HTTP renders with distinct PDF metadata return one confirmed byte identity, including retry',async()=>{
 const f=fixture();let arrived=0,release!:()=>void;const both=new Promise<void>(r=>{release=r})
 const loadAssets=vi.fn(async()=>{if(++arrived===2)release();await both;return assets})
 const original=PDFDocument.create.bind(PDFDocument);let serial=0
 const create=vi.spyOn(PDFDocument,'create').mockImplementation(async options=>{const p=await original(options);p.setCreationDate(new Date(Date.UTC(2026,10,26,12,0,++serial)));p.setModificationDate(p.getCreationDate()!);return p})
 try{
  const handler=commercialDocumentHandler({user:()=>f.user,trusted:()=>f.trusted,assets:loadAssets},origin)
  const body={action:'multipunto',workshopId:wid,orderId:id(7),requestId}
  const results=await Promise.all([handler(request(body)),handler(request(body))]);expect(results.map(r=>r.status)).toEqual([200,200])
  const bytes=await Promise.all(results.map(async r=>new Uint8Array(await r.arrayBuffer())))
  expect(f.attempts).toHaveLength(2);expect(f.attempts[0]).not.toBe(f.attempts[1]);expect(bytes[0]).toEqual(bytes[1]);expect(Buffer.from(bytes[0]).toString('hex')).toBe(f.committed);expect(f.confirmations).toBe(1)
  const winner=await PDFDocument.load(bytes[0]);expect(['2026-11-26T12:00:01.000Z','2026-11-26T12:00:02.000Z']).toContain(winner.getCreationDate()?.toISOString());expect(winner.getCreationDate()).toEqual((await PDFDocument.load(Buffer.from(f.attempts[0],'hex'))).getCreationDate())
  const retry=await handler(request(body));expect(retry.status).toBe(200);expect(new Uint8Array(await retry.arrayBuffer())).toEqual(bytes[0]);expect(loadAssets).toHaveBeenCalledTimes(2);expect(f.confirmations).toBe(1)
  const out='/tmp/bt-commercial-delta-evidence';mkdirSync(out,{recursive:true});for(const [i,b] of bytes.entries())writeFileSync(out+'/multipunto-concurrent-'+(i+1)+'.pdf',b)
  for(const [i,h] of f.attempts.entries())writeFileSync(out+'/multipunto-render-'+(i+1)+'.pdf',Buffer.from(h,'hex'))
  writeFileSync(out+'/multipunto-concurrency.json',JSON.stringify({status:'PASS',renderHashes:f.attempts.map(h=>digest(Buffer.from(h,'hex'))),responseHashes:bytes.map(digest),confirmedConsumptions:f.confirmations,creationDate:winner.getCreationDate()?.toISOString(),retryIdentical:true},null,2))
 }finally{create.mockRestore()}
})
it('a denied canonical-cache read after commit never falls back to independently rendered PDF bytes',async()=>{
 const f=fixture();f.denyCache();const handler=commercialDocumentHandler({user:()=>f.user,trusted:()=>f.trusted,assets:async()=>assets},origin)
 const r=await handler(request({action:'multipunto',workshopId:wid,orderId:id(7),requestId}));expect(r.status).toBe(403);expect(r.headers.get('content-type')).not.toBe('application/pdf');expect(f.confirmations).toBe(1)
})
