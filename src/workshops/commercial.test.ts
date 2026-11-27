import {expect,it,vi} from 'vitest'
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs'
import {PDFDocument,PDFRawStream,decodePDFRawStream} from 'pdf-lib'
import type {SupabaseClient} from '@supabase/supabase-js'
import {commercialDocumentHandler} from '../../server/commercial/documentHandler'
import {meteredDocument} from '../../server/commercial/meteredDocument'
import {parseCommercial} from './commercialPresentation'
import {operationProgress} from '../guided/operations'
import {confirmedStage} from '../guided/progress'
const id=(n:number)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0'),wid=id(1),uid=id(2)
const assets={font:new Uint8Array(readFileSync('public/cp05/DejaVuSans.ttf')),logo:new Uint8Array(readFileSync('assets/brand/generated/icon-192.png')),light:new Uint8Array(readFileSync('apps/android/assets/brand/logo-horizontal.png')),dark:new Uint8Array(readFileSync('apps/android/assets/brand/logo-horizontal-dark.png'))}
function fixture(){let plan='basic',deny=false;const calls:string[]=[];const quote={id:id(3),workshop_id:wid,customer_id:id(4),vehicle_id:id(5),order_id:id(6),number:1,version:1,issued_revision:0,updated_at:'2026-11-26T12:00:00Z',status:'draft'}
 const rows:Record<string,Record<string,unknown>>={quotes:quote,customers:{id:id(4),workshop_id:wid,full_name:'Cliente sintético',email:null,mobile_e164:null},vehicles:{id:id(5),workshop_id:wid,customer_id:id(4),make:'Marca sintética',model:'Modelo sintético',plate:'QA1234'},work_orders:{id:id(6),workshop_id:wid,vehicle_id:id(5),complaint:'Prueba sintética',opened_at:'2026-11-26T12:00:00Z',intake_odometer:120000},workshops:{id:wid,name:'Taller sintético'}}
 const user={auth:{getUser:async()=>({data:{user:{id:uid,email_confirmed_at:'confirmed'}},error:null})},rpc:vi.fn(async(name:string,args:Record<string,unknown>)=>{calls.push(name);if(deny||args.p_workshop_id!==wid)return {data:null,error:{code:'42501'}};return {data:name==='bt_plan04_profile'?{workshopId:wid,email:'',phone:'',address:''}:name==='bt_commercial_status'?{workshopId:wid,plan,inspectionEnabled:plan!=='basic'}:{workshop_id:wid,resource_id:args.p_resource_id,request_id:args.p_request_id,actor_id:uid,state:'reserved'},error:null}}),from:(table:string)=>{const filters:Record<string,unknown>={};const result=()=>({data:table==='inspection_findings'?[]:Object.entries(filters).every(([k,v])=>rows[table]?.[k]===v)?rows[table]:null,error:null});const q={select:()=>q,eq:(k:string,v:unknown)=>{filters[k]=v;return q},single:async()=>result(),maybeSingle:async()=>result(),then:(resolve:(v:unknown)=>unknown)=>Promise.resolve(result()).then(resolve)};return q}} as unknown as SupabaseClient
 let committed='';const trusted={rpc:vi.fn(async(name:string,args:Record<string,unknown>)=>{if(name==='bt_commercial_cached')return {data:committed,error:null};if(name!=='bt_commercial_finish')throw Error('Unexpected trusted RPC');if(args.p_success)committed||=String(args.p_bytes).slice(2);return {data:{state:'confirmed',request_id:args.p_request_id},error:null}})} as unknown as SupabaseClient
 return {user,trusted,calls,setPlan:(p:string)=>{plan=p},deny:()=>{deny=true}}
}
const body={action:'draft',workshopId:wid,quoteId:id(3),draft:{price_basis:'net',valid_days:15,terms:'',comments:'',items:[{id:id(9),type:'Servicio',description:'Revisión sintética',quantity:1,price:10000}]}}
const request=(value:unknown)=>new Request('https://test.invalid/documents',{method:'POST',headers:{authorization:'Bearer synthetic',origin:'https://app.invalid'},body:JSON.stringify(value)})
it('restricted draft bytes contain the full watermark and never expose a clean final through draft fields',async()=>{
 const f=fixture(),handler=commercialDocumentHandler({user:()=>f.user,trusted:()=>f.trusted,assets:async()=>assets},'https://app.invalid')
 const response=await handler(request({...body,final:true,watermark:false}));expect(response.status).toBe(200)
 const bytes=new Uint8Array(await response.arrayBuffer());mkdirSync('/tmp/bt-commercial-evidence',{recursive:true});writeFileSync('/tmp/bt-commercial-evidence/restricted-draft.pdf',bytes)
 const pdf=await PDFDocument.load(bytes),streams:string[]=[]
 for(const [,object] of pdf.context.enumerateIndirectObjects())if(object instanceof PDFRawStream){try{streams.push(new TextDecoder().decode(decodePDFRawStream(object).decode()))}catch{/* Image codecs do not contain document text. */}}
 const characters=new Map<string,string>();for(const stream of streams.filter(s=>s.includes('begincmap')))for(const match of stream.matchAll(/<([0-9a-f]{4})>\s*<([0-9a-f]{4})>/gi))characters.set(match[1].toUpperCase(),String.fromCharCode(parseInt(match[2],16)))
 const extracted=streams.filter(s=>s.includes(' Tj')).flatMap(stream=>Array.from(stream.matchAll(/<([0-9a-f]+)>\s*Tj/gi),m=>m[1].match(/.{4}/g)!.map(code=>characters.get(code.toUpperCase())??'').join(''))).join('\n')
 for(const text of ['BORRADOR','NO VÁLIDO COMO COTIZACIÓN','DOCUMENTO NO EMITIDO'])expect(extracted).toContain(text)
 expect(f.calls).toEqual(['bt_commercial_status','bt_plan04_profile']);const denied=await handler(request({...body,action:'final'}));expect(denied.status).toBe(403);expect(denied.headers.get('content-type')).not.toBe('application/pdf');expect(new TextDecoder().decode(await denied.arrayBuffer()).startsWith('%PDF-')).toBe(false)
})
it('Basic multipunto and foreign document scope return no PDF bytes',async()=>{
 const f=fixture(),handler=commercialDocumentHandler({user:()=>f.user,trusted:()=>f.trusted,assets:async()=>assets},'https://app.invalid')
 for(const b of [{action:'multipunto',workshopId:wid,orderId:id(6),requestId:id(7)},{...body,workshopId:id(99)},{...body,quoteId:id(99)}]){const result=await handler(request(b));expect(result.status).toBe(403);expect(result.headers.get('content-type')).not.toBe('application/pdf')}
 expect(await handler(new Request('https://test.invalid',{method:'GET'}))).toHaveProperty('status',405)
})
it('verified bytes are withheld until trusted commit; failure releases the reservation',async()=>{
 const f=fixture(),pdf=new TextEncoder().encode('%PDF-test'),read=vi.fn(async()=>pdf)
 vi.mocked(f.trusted.rpc).mockResolvedValueOnce({data:null,error:{code:'42501'}} as never)
 await expect(meteredDocument(f.user,f.trusted,{workshopId:wid,capability:'quote',resourceId:id(3),requestId:id(7)},read)).rejects.toThrow('COMMERCIAL_CONFIRMATION_FAILED')
 expect(vi.mocked(f.trusted.rpc).mock.calls.at(-1)?.[1]).toMatchObject({p_success:false})
})
it('Plus official multipunto is generated from authorized server records and metered',async()=>{
 const f=fixture();f.setPlan('plus');const handler=commercialDocumentHandler({user:()=>f.user,trusted:()=>f.trusted,assets:async()=>assets},'https://app.invalid')
 const response=await handler(request({action:'multipunto',workshopId:wid,orderId:id(6),requestId:id(7)}));expect(response.status).toBe(200);expect(new TextDecoder().decode((await response.arrayBuffer()).slice(0,5))).toBe('%PDF-');expect(f.calls).toContain('bt_commercial_reserve')
})
it('malformed counters fail closed and Basic progress skips excluded inspection without inventing findings',()=>{
 expect(()=>parseCommercial({workshopId:wid,plan:'full',customers:0,ownedWorkshops:1,usage:{quote:{used:-1}}},wid)).toThrow()
 expect(confirmedStage({order:true,inspection:false,inspectionRequired:false,issued:false,approval:false,execution:false,handover:false,archive:false})).toBe(3)
})

it('completed retry reads identical private cached bytes without rendering or consuming again',async()=>{
 const f=fixture();vi.mocked(f.user.rpc).mockResolvedValueOnce({data:{workshop_id:wid,actor_id:uid,resource_id:id(3),request_id:id(7),state:'confirmed'},error:null} as never)
 vi.mocked(f.trusted.rpc).mockResolvedValueOnce({data:'255044462d636163686564',error:null} as never)
 const render=vi.fn(async()=>{throw Error('MUST_NOT_RENDER')})
 const bytes=await meteredDocument(f.user,f.trusted,{workshopId:wid,capability:'quote',resourceId:id(3),requestId:id(7)},render)
 expect(new TextDecoder().decode(bytes)).toBe('%PDF-cached');expect(render).not.toHaveBeenCalled();expect(vi.mocked(f.trusted.rpc).mock.calls.map(c=>c[0])).toEqual(['bt_commercial_cached'])
})
it('Basic operation progress excludes the unavailable inspection milestone without marking it inspected',()=>{
 const e={order:true,inspection:false,inspectionRequired:false,issued:true,approval:true,execution:true,handover:true,archive:true}
 expect(operationProgress(e)).toBe(100);expect(operationProgress({...e,inspectionRequired:true})).toBe(85)
})
