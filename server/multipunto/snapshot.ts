import {MPError,type MPSnapshot,type MPItem} from './protocol'
/** Allowlist projection for new snapshots and immutable legacy V1 payloads. */
const object=(v:unknown):Record<string,unknown>=>{if(!v||typeof v!=='object'||Array.isArray(v))throw new MPError('MP_SNAPSHOT_INVALID');return v as Record<string,unknown>}
const text=(v:unknown)=>{if(typeof v!=='string')throw new MPError('MP_SNAPSHOT_INVALID');return v}
const nullable=(v:unknown)=>v===null||v===undefined?null:text(v)
const number=(v:unknown)=>{if(v===null||v===undefined)return null;if(!Number.isInteger(v))throw new MPError('MP_SNAPSHOT_INVALID');return v as number}
export function projectSnapshot(value:unknown):MPSnapshot{
 const s=object(value),o=object(s.order),v=object(s.vehicle),c=object(s.customer),w=object(s.workshop),scope=object(s.scope),profile=s.profile==null?null:object(s.profile)
 if(!['MP-SNAPSHOT-1/PG17','MP-SNAPSHOT-2/PG17'].includes(text(s.schema))||!Array.isArray(s.items)||s.items.length!==34||!Array.isArray(s.additional))throw new MPError('MP_SNAPSHOT_INVALID')
 if(s.schema==='MP-SNAPSHOT-2/PG17'&&!/^[a-f0-9]{64}$/.test(text(s.sourceHash)))throw new MPError('MP_SNAPSHOT_INVALID')
 const items:MPItem[]=s.items.map(value=>{const i=object(value),state=text(i.state);if(!['ok','attention','immediate','unreviewed'].includes(state)||typeof i.note!=='string'||Array.from(i.note).length>2000)throw new MPError('MP_SNAPSHOT_INVALID');return {id:text(i.id),name:text(i.name),category:text(i.category),state:state as MPItem['state'],note:i.note,resolution:nullable(i.resolution)}})
 const workshopId=text(scope.workshopId),orderId=text(scope.orderId)
 if(o.id!==orderId||o.workshop_id!==workshopId||v.workshop_id!==workshopId||v.id!==o.vehicle_id||v.customer_id!==c.id||w.id!==workshopId)throw new MPError('MP_SNAPSHOT_INVALID')
 const status=text(o.status);if(!['received','inspecting','in_service','ready','closed'].includes(status))throw new MPError('MP_SNAPSHOT_INVALID')
 const policy=object(s.policy);if(!Object.values(policy).every(v=>typeof v==='string'))throw new MPError('MP_SNAPSHOT_INVALID')
 return {schema:text(s.schema),...(s.schema==='MP-SNAPSHOT-2/PG17'?{sourceHash:text(s.sourceHash)}:{}),scope:{workshopId,orderId},order:{id:orderId,workshop_id:workshopId,vehicle_id:text(o.vehicle_id),opened_at:text(o.opened_at),intake_odometer:number(o.intake_odometer),status:status as MPSnapshot['order']['status'],cancelled_at:nullable(o.cancelled_at)},vehicle:{id:text(v.id),workshop_id:workshopId,customer_id:text(v.customer_id),plate:nullable(v.plate),make:text(v.make),model:text(v.model),model_year:number(v.model_year),archived_at:nullable(v.archived_at)},customer:{id:text(c.id),full_name:nullable(c.full_name),archived_at:nullable(c.archived_at)},workshop:{id:workshopId,name:text(w.name)},profile:profile?{commercial_name:nullable(profile.commercial_name),phone:nullable(profile.phone),address:nullable(profile.address),contact_email:nullable(profile.contact_email)}:null,items,additional:s.additional.map(value=>{const row=object(value);return {category:text(row.category),note:nullable(row.note),resolution:nullable(row.resolution)}}),historyDigest:text(s.historyDigest),policy:policy as Record<string,string>,policyHash:text(s.policyHash)}
}
