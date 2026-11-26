import {finalArchiveFixture,id} from './fixtures/finalArchive'
import type {SupabaseClient} from '@supabase/supabase-js'
import type {Context} from '../src/auth/controller'
export const context:Context={userId:id(7),role:'owner',operationsEnabled:true,documentsEnabled:true,workshop:{id:id(1),name:'Taller sintético de operaciones',status:'active'}}
export async function operationsFixture(count=3){
 const tables:Record<string,any[]>={work_orders:[],vehicles:[],customers:[],quotes:[],quote_items:[],quote_revisions:[],inspection_findings:[],bt_flow_quote_approvals:[],bt_flow_execution_reports:[],bt_flow_visit_deliveries:[],bt_agenda_receipts:[]}
 for(let n=0;n<count;n++){const offset=n*100;const f=await finalArchiveFixture();let text=JSON.stringify(f.snapshot);for(let i=40;i>=2;i--)if(i!==7)text=text.replaceAll(id(i),id(i+offset));const s=JSON.parse(text),q=s.quote,r=s.revision
  tables.work_orders.push({id:q.order_id,workshop_id:id(1),vehicle_id:q.vehicle_id,status:'received',opened_at:r.payload.order.opened_at,intake_phase:'received',cancelled_at:null})
  tables.vehicles.push({...r.payload.vehicle,workshop_id:id(1),customer_id:q.customer_id})
  tables.customers.push({...r.payload.customer,workshop_id:id(1),full_name:'Cliente sintético '+(n+1)})
  if(n%3>0)tables.inspection_findings.push({id:id(50+offset),workshop_id:id(1),order_id:q.order_id,vehicle_id:q.vehicle_id,category:'General',result:'ok',note:null,resolution:'not_applicable',created_at:r.issued_at,updated_at:r.issued_at})
  if(n%3===2){tables.quotes.push(q);tables.quote_revisions.push(r);tables.quote_items.push(...r.payload.items)}
 }
 let identity=context.userId;const calls:string[]=[]
 const client={auth:{getUser:async()=>({data:{user:{id:identity,email_confirmed_at:'2026-11-26'}}})},from:(table:string)=>{let after='',tenant='';const builder:any={select:()=>builder,eq:(key:string,v:string)=>{if(key==='workshop_id')tenant=v;return builder},order:()=>builder,limit:()=>builder,abortSignal:()=>builder,gt:(_k:string,v:string)=>{after=v;return builder},then:(resolve:any)=>{calls.push(table);return Promise.resolve({data:tables[table].filter(x=>x.workshop_id===tenant&&x.id>after).sort((a,b)=>a.id.localeCompare(b.id)).slice(0,200),error:null}).then(resolve)}};return builder}} as unknown as SupabaseClient
 return {client,tables,calls,changeIdentity(){identity=id(99)}}
}
