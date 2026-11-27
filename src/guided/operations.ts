import type {SupabaseClient} from '@supabase/supabase-js'
import type {AuthController,Context} from '../auth/controller'
import type {WorkOrder,Finding} from '../ordenes/cp04Contracts'
import type {Quote,QuoteItem,Revision,Bundle} from '../cp05/contracts'
import {readFlowEvidence} from '../historial/flowEvidence'
import {finalArchiveRepository} from '../expedientes/repository'
import {inspectionEvidence,budgetMatches} from './continuity'
import {canOpen,confirmedStage,type Evidence} from './progress'
export const operationStages=['Recepción','Inspección multipunto','Cotización','Aprobación','Ejecución','Entrega','Expediente final pendiente']
export type Operation={id:string;reference:string;plate:string;vehicle:string;customer:string;receivedAt:string|null;stage:number;progress:number;planned:boolean}
export function orderReference(id:string,ids:string[]){let n=8;while(n<36&&ids.some(other=>other!==id&&other.slice(-n)===id.slice(-n)))n+=4;return 'OT-'+id.slice(-n)}
export function operationProgress(e:Evidence){const required=[e.order,e.issued&&!e.needsRevision,e.approval,e.execution,e.handover,e.archive];if(e.inspectionRequired!==false)required.splice(1,0,e.inspection);return Math.floor(required.filter(Boolean).length*100/required.length)}
/** Complete tenant-scoped reads, bounded pages, stable unique key; no recent-orders cap. */
export function operationsRepository(client:SupabaseClient,context:Context){
 let stopped=false;const abort=new AbortController(),wid=context.workshop.id
 const archive=finalArchiveRepository(client,context)
 async function guard(){if(stopped)throw Error('denied');const r=await client.auth.getUser();if(r.error||r.data.user?.id!==context.userId||!r.data.user.email_confirmed_at)throw Error('denied')}
 async function rows<T extends {workshop_id:string;id:string}>(table:string):Promise<T[]>{
  const all:T[]=[];let after=''
  for(;;){await guard();let query=client.from(table).select('*').eq('workshop_id',wid).order('id').limit(200).abortSignal(abort.signal);if(after)query=query.gt('id',after)
   const r=await query;if(r.error||!Array.isArray(r.data))throw Error('unavailable');const page=r.data as T[]
   if(page.some(x=>x.workshop_id!==wid||typeof x.id!=='string'||x.id<=after))throw Error('denied')
   all.push(...page);if(page.length<200)return all;after=page.at(-1)!.id
  }
 }
 return {dispose(){stopped=true;abort.abort();archive.dispose()},async load():Promise<Operation[]>{
  await guard()
  const [orders,vehicles,customers,quotes,items,revisions,findings]=await Promise.all([rows<WorkOrder>('work_orders'),rows<any>('vehicles'),rows<any>('customers'),rows<Quote>('quotes'),rows<QuoteItem>('quote_items'),rows<Revision>('quote_revisions'),rows<Finding>('inspection_findings')])
  const result:Operation[]=[]
  // Work in small batches; immutable evidence is read/validated by the existing CP06 reader.
  const [approvals,executions,deliveries,receipts]=await Promise.all([rows<any>('bt_flow_quote_approvals'),rows<any>('bt_flow_execution_reports'),rows<any>('bt_flow_visit_deliveries'),rows<any>('bt_agenda_receipts')])
  for(const o of orders){if(o.status==='closed'||o.cancelled_at)continue
   const v=vehicles.find(x=>x.id===o.vehicle_id),c=v&&customers.find(x=>x.id===v.customer_id);if(!v||!c||v.archived_at||c.archived_at)continue
   const q=quotes.find(x=>x.order_id===o.id),r=q&&revisions.find(x=>x.quote_id===q.id&&x.revision===q.issued_revision)
   if(q&&(q.vehicle_id!==v.id||q.customer_id!==c.id))throw Error('denied')
   const sourceRows=findings.filter(x=>x.order_id===o.id),inspection=inspectionEvidence(sourceRows,{workshopId:wid,vehicleId:v.id,orderId:o.id})
   let h={approvals:[] as any[],executions:[] as any[],deliveries:[] as any[]}
   if(q&&r)h=await readFlowEvidence(wid,v.id,[q],[r],async(table,ids,_column,foreign='quote_id')=>({bt_flow_quote_approvals:approvals,bt_flow_execution_reports:executions,bt_flow_visit_deliveries:deliveries,bt_agenda_receipts:receipts}[table]||[]).filter(x=>ids.includes(x[foreign])))
   const needsRevision=!!q&&!!r&&!budgetMatches({quote:q,items:items.filter(x=>x.quote_id===q.id)} as Bundle,r)
   const e:Evidence={inspectionRequired:context.inspectionEnabled!==false,planned:o.intake_phase==='planned',order:o.intake_phase!=='planned',inspection:inspection.recorded,issued:!!r&&q?.status==='issued'&&!q.issue_pending,needsRevision,approval:!needsRevision&&h.approvals.length===1,execution:!needsRevision&&h.executions.length===1,handover:!needsRevision&&h.deliveries.length===1,archive:false}
   if(e.handover&&r)e.archive=(await archive.documents(r.id)).complete
   if(e.archive)continue
   const stage=confirmedStage(e)
   result.push({id:o.id,reference:orderReference(o.id,orders.map(x=>x.id)),plate:v.plate||'Sin patente',vehicle:v.make+' '+v.model,customer:c.full_name,receivedAt:e.planned?null:o.intake_received_at||o.opened_at,planned:!!e.planned,stage,progress:operationProgress(e)})
  }
  await guard();return result
 }}
}

/** Session-bound lifecycle, as in GuidedWorkspace, including role/authority changes.
 * Subscription invalidates before either directoryClient or load may resolve. */
export function operationsScope(controller:AuthController):string {
 const s=controller.getSnapshot(),c=s.context
 return c&&['authorized','restricted'].includes(s.phase)&&canOpen(c)
  ?JSON.stringify([c.userId,c.workshop.id,c.workshop.status,c.role,c.inspectionEnabled,s.authorityVersion??null]):''
}
export type OperationsState={scope:string;rows:Operation[];busy:boolean;error:string}
export function watchOperations(controller:AuthController,emit:(s:OperationsState)=>void,
 active=true,create=operationsRepository){
 let closed=false,generation=0,scope:string|undefined,repo:ReturnType<typeof operationsRepository>|undefined
 function update(){
  const next=operationsScope(controller)
  if(next===scope)return
  scope=next;const version=++generation;repo?.dispose();repo=undefined
  emit({scope:next,rows:[],busy:!!next&&active,error:''})
  if(!next||!active)return
  const current=()=>!closed&&version===generation&&operationsScope(controller)===next
  void controller.directoryClient().then(async client=>{
   if(!current())return
   const context=controller.getSnapshot().context
   if(!client||!context)throw Error('denied')
   const binding=create(client,context);repo=binding
   const rows=await binding.load()
   if(current())emit({scope:next,rows,busy:false,error:''})
  }).catch(()=>{if(current())emit({scope:next,rows:[],busy:false,error:'No se pudo verificar el centro de operaciones. Actualiza o revisa tu sesión; no se modificó ningún registro.'})})
 }
 const unsubscribe=controller.subscribe(()=>{if(!closed)update()})
 update()
 return()=>{closed=true;generation++;unsubscribe();repo?.dispose()}
}
