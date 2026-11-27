import {hasCurrentProvisionalFindings} from '../../src/ordenes/cp04Autosave'
import type {SupabaseClient} from '@supabase/supabase-js'
import {meteredDocument,CommercialOperationNotCurrent} from './meteredDocument'
import {quotePdf} from '../../src/cp05/pdf'
import {quoteId,draftPayload,previewSnapshot,type Bundle,type Draft} from '../../src/cp05/contracts'
import {multipuntoPdf,type MultipuntoPdfInput} from '../../src/ordenes/cp04InspectionPdf'
export type CommercialDocumentDependencies={user:(authorization:string)=>SupabaseClient;trusted:()=>SupabaseClient;assets:()=>Promise<{font:Uint8Array;logo:Uint8Array;light:Uint8Array;dark:Uint8Array}>}
/** Candidate HTTP adapter: no deployment, secrets, mail, bucket creation, or public document URLs. */
export function commercialDocumentHandler(deps:CommercialDocumentDependencies,origin:string){return async(request:Request):Promise<Response>=>{
 const headers={'Cache-Control':'no-store','Vary':'Origin','Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS'}
 if(request.headers.get('origin')&&request.headers.get('origin')!==origin)return new Response(null,{status:403})
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers})
 if(request.method!=='POST')return new Response(null,{status:405,headers})
 try{
  if(!request.headers.get('authorization')?.startsWith('Bearer '))throw Error('AUTHORIZATION_REQUIRED')
  let text='';let size=0;const reader=request.body?.getReader();if(!reader)throw Error('REQUEST_REQUIRED');const decoder=new TextDecoder();for(;;){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.byteLength;if(size>64000){await reader.cancel();throw Error('REQUEST_TOO_LARGE')}text+=decoder.decode(chunk.value,{stream:true})}text+=decoder.decode();const body=JSON.parse(text),wid=quoteId(body.workshopId)
  const user=deps.user(request.headers.get('authorization')!),trusted=deps.trusted()
  const identity=await user.auth.getUser();if(identity.error||!identity.data.user?.email_confirmed_at)throw Error('CONFIRMED_SESSION_REQUIRED')
  const status=await user.rpc('bt_commercial_status',{p_workshop_id:wid});if(status.error||status.data?.workshopId!==wid)throw Error('TENANT_DENIED')
  const get=async(table:string,id:string)=>{const r=await user.from(table).select('*').eq('workshop_id',wid).eq('id',id).maybeSingle();if(r.error||r.data?.workshop_id!==wid||r.data?.id!==id)throw Error('RESOURCE_DENIED');return r.data}
  if(body.action==='multipunto'&&status.data.inspectionEnabled!==true)throw Error('INSPECTION_PLAN_REQUIRED')
  let bytes:Uint8Array
  if(body.action==='draft'){
   const q=await get('quotes',quoteId(body.quoteId)),[c,v,o,w]=await Promise.all([get('customers',q.customer_id),get('vehicles',q.vehicle_id),get('work_orders',q.order_id),user.from('workshops').select('id,name').eq('id',wid).single()])
   if(w.error||w.data?.id!==wid||v.customer_id!==c.id||o.vehicle_id!==v.id)throw Error('DRAFT_SCOPE_DENIED')
   const draft=body.draft as Draft;draftPayload(draft)
   const profile=await user.rpc('bt_plan04_profile',{p_workshop_id:wid});if(profile.error||profile.data?.workshopId!==wid)throw Error('PROFILE_SCOPE_DENIED')
   const bundle={quote:q,source:{workshop:{...w.data,contactEmail:profile.data.email,phone:profile.data.phone,address:profile.data.address},customer:c,vehicle:v,order:o},items:[],revisions:[],deliveries:[],events:[]} as Bundle
   bytes=await quotePdf(previewSnapshot(bundle,draft),await deps.assets(),true)
  }else if(body.action==='multipunto'){
   const oid=quoteId(body.orderId),order=await get('work_orders',oid),vehicle=await get('vehicles',order.vehicle_id)
   const rows=await user.from('inspection_findings').select('*').eq('workshop_id',wid).eq('order_id',oid)
   const workshop=await user.from('workshops').select('id,name').eq('id',wid).single()
   const customer=await get('customers',vehicle.customer_id)
   if(rows.error||workshop.error||workshop.data?.id!==wid||hasCurrentProvisionalFindings(rows.data??[]))throw Error('INSPECTION_SOURCE_DENIED')
   const source={workshopName:workshop.data.name,order:{order,vehicle},findings:rows.data??[],identity:{workshop_id:wid,order_id:oid,vehicle_id:vehicle.id,customer_id:customer.id,ownerName:customer.full_name,modelYear:vehicle.model_year}} as MultipuntoPdfInput
   const snapshotHash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify({...source,findings:[...source.findings].sort((a,b)=>a.id.localeCompare(b.id))})))),b=>b.toString(16).padStart(2,'0')).join('')
   bytes=await meteredDocument(user,trusted,{workshopId:wid,capability:'multipunto',resourceId:oid,requestId:quoteId(body.requestId),snapshotHash},async()=>{const assets=await deps.assets();return multipuntoPdf(source,assets.font,{light:assets.light,dark:assets.dark})})
  }else throw Error('ACTION_DENIED')
  return new Response(bytes.slice().buffer,{headers:{...headers,'Content-Type':'application/pdf','Content-Disposition':'inline'}})
 }catch(error){if(error instanceof CommercialOperationNotCurrent)return Response.json({error:'DOCUMENT_OPERATION_NOT_CURRENT'},{status:409,headers});return Response.json({error:'COMMERCIAL_DOCUMENT_DENIED'},{status:403,headers})}
}}
