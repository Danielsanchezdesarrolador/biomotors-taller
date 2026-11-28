import {multipuntoPdfModel} from '../../src/ordenes/cp04InspectionPdf'
import {multipuntoTemplateItems,CP04_IMMEDIATE_PREFIX} from '../../src/ordenes/cp04Multipunto'
import {projectSnapshot} from './snapshot'
import {renderMultipuntoLayout} from './pdfLayout'
import {renderMultipunto as renderV1} from './rendererV1'
import {sha,MPError,type MPWorker} from './protocol'
export type {MPAssets} from './rendererV1'
import type {MPAssets} from './rendererV1'
export const MP_RENDERER='BT-MP-FINAL-2'
/** Immutable policies select the engine. HTTP accepts neither renderer nor clean flags. */
export async function renderMultipunto(work:MPWorker,assets:MPAssets):Promise<Uint8Array>{
 const s=projectSnapshot(work.snapshot),p=s.policy
 if(p.renderer==='BT-MP-FINAL-1')return renderV1(work,assets)
 if(p.renderer!==MP_RENDERER||s.schema!=='MP-SNAPSHOT-2/PG17'||await sha(new TextEncoder().encode(work.canonical))!==work.snapshotHash)throw new MPError('MP_POLICY_MISMATCH',503)
 for(const key of ['font','light','dark'] as const)if(p[key]!==await sha(assets[key]))throw new MPError('MP_ASSET_MISMATCH',503)
 if(!['draft','final'].includes(work.job.kind)||work.job.workshop_id!==s.scope.workshopId||work.job.order_id!==s.scope.orderId)throw new MPError('MP_SNAPSHOT_INVALID')
 const template=multipuntoTemplateItems()
 if(s.items.length!==34||s.items.some((row,i)=>row.id!==template[i].id||row.name!==template[i].name||row.category!==template[i].category||row.resolution!==null&&!['pending','resolved','not_applicable'].includes(row.resolution)))throw new MPError('MP_SNAPSHOT_INVALID')
 const model=multipuntoPdfModel({workshopName:String(s.profile?.commercial_name||s.workshop.name),order:{order:{...s.order,complaint:'',opened_by:s.scope.workshopId,closed_at:null,updated_at:work.job.created_at},vehicle:{...s.vehicle,plate_key:null,odometer_km:null}},findings:[],identity:{workshop_id:s.scope.workshopId,order_id:s.scope.orderId,vehicle_id:s.vehicle.id,customer_id:s.customer.id,ownerName:s.customer.full_name,modelYear:s.vehicle.model_year}})
 // Map the already-authoritative four-state snapshot directly, never collapse red
 // into attention or infer priority from a lossy Finding conversion.
 model.rows=s.items.map(row=>({id:row.id,group:row.category,label:row.name,state:row.state,note:row.state==='immediate'&&row.note.startsWith(CP04_IMMEDIATE_PREFIX)?row.note.slice(CP04_IMMEDIATE_PREFIX.length):row.note,resolution:row.resolution as 'pending'|'resolved'|'not_applicable'|null,provisional:false}))
 const count=(state:typeof model.rows[number]['state'])=>model.rows.filter(row=>row.state===state).length
 model.counts={total:34,ok:count('ok'),attention:count('attention'),immediate:count('immediate'),unreviewed:count('unreviewed'),provisional:0}
 return renderMultipuntoLayout(model,assets.font,assets,{kind:work.job.kind,createdAt:work.job.created_at,renderer:MP_RENDERER,documentId:work.job.document_id,jobId:work.job.id,revision:work.job.revision,snapshotHash:work.snapshotHash,historyDigest:s.historyDigest,policyHash:s.policyHash,policyId:'MP-V2-3',additional:s.additional})
}
