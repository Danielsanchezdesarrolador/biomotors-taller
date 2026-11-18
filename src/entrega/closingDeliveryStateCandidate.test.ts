import { describe, expect, it } from 'vitest'
import {
  projectClosingDeliveryCandidate,
  type ProviderEvent, type ProviderEventState
} from '../../server/com/closingDeliveryStateCandidate'
const id=(n:number)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0')
const wid=id(1),rid=id(2)
const t=(n:number)=>new Date(Date.UTC(2026,10,18,23,30,n)).toISOString()
function event(
  n:number,status:ProviderEventState,attempt=1,
  providerMessageId:string|null=null,errorCode:string|null=null
):ProviderEvent{
  return {id:id(n+10),workshopId:wid,reviewId:rid,attempt,
    eventState:status,providerMessageId,errorCode,recordedAt:t(n)}
}
const queued=()=>event(1,'queued_not_sent')
const accepted=()=>event(2,'provider_accepted',1,'PROVIDER-123')
const rejected=()=>event(2,'provider_rejected',1,null,'INVALID_ADDRESS')
const uncertain=()=>event(2,'ack_uncertain',1,null,'PROVIDER_TIMEOUT')
const bounced=()=>event(3,'bounced',1,'PROVIDER-123','BOUNCED')
describe('BT-COM-01C: read-only delivery state (NO provider/queue/SQL access)',()=>{
 it('never infers send, payment or customer receipt from operator review',()=>{
   expect(projectClosingDeliveryCandidate(wid,rid,[])).toEqual({
     state:'operator_reviewed_not_sent',attempt:0,
     providerMessageId:null,lastRecordedAt:null,customerReceivedVerified:false,
     sentToProvider:false,retryBlocked:false
   })
 })
 it('queued does not mean sent to provider, read or delivered',()=>{
   expect(projectClosingDeliveryCandidate(wid,rid,[queued()])).toMatchObject({
     state:'queued_not_sent',sentToProvider:false,
     customerReceivedVerified:false,retryBlocked:true
   })
 })
 it('provider acceptance proves only provider ack, never mailbox delivery',()=>{
   expect(projectClosingDeliveryCandidate(wid,rid,[queued(),accepted()])).toMatchObject({
     state:'provider_accepted',providerMessageId:'PROVIDER-123',
     sentToProvider:true,customerReceivedVerified:false,retryBlocked:true
   })
 })
 it('preserves bounce distinctly after provider acceptance',()=>{
   expect(projectClosingDeliveryCandidate(wid,rid,[queued(),accepted(),bounced()]))
     .toMatchObject({
       state:'bounced',sentToProvider:true,customerReceivedVerified:false,retryBlocked:true
     })
 })
 it('definitive rejection permits ONLY explicitly reviewed future retry',()=>{
   const second=event(3,'queued_not_sent',2)
   expect(projectClosingDeliveryCandidate(wid,rid,[queued(),rejected()]))
     .toMatchObject({state:'provider_rejected',sentToProvider:false,retryBlocked:false})
   expect(projectClosingDeliveryCandidate(wid,rid,[queued(),rejected(),second]))
     .toMatchObject({state:'queued_not_sent',attempt:2,retryBlocked:true})
 })
 it('ambiguous provider response blocks blind retry',()=>{
   const second=event(3,'queued_not_sent',2)
   expect(projectClosingDeliveryCandidate(wid,rid,[queued(),uncertain()]))
     .toMatchObject({state:'ack_uncertain',retryBlocked:true,sentToProvider:false})
   expect(()=>projectClosingDeliveryCandidate(wid,rid,
     [queued(),uncertain(),second])).toThrow('BT_COM_DELIVERY_LEDGER_INVALID')
 })
 it('rejects forged successes without preceding queue and provider ID',()=>{
   expect(()=>projectClosingDeliveryCandidate(wid,rid,[accepted()])).toThrow()
   expect(()=>projectClosingDeliveryCandidate(wid,rid,
     [queued(),{...accepted(),providerMessageId:null}])).toThrow()
   expect(()=>projectClosingDeliveryCandidate(wid,rid,
     [queued(),{...rejected(),errorCode:null}])).toThrow()
 })
 it('rejects cross-tenant, cross-review, duplicated or reordered rows',()=>{
   expect(()=>projectClosingDeliveryCandidate(wid,rid,[{...queued(),workshopId:id(4)}]))
     .toThrow()
   expect(()=>projectClosingDeliveryCandidate(wid,rid,[{...queued(),reviewId:id(4)}]))
     .toThrow()
   expect(()=>projectClosingDeliveryCandidate(wid,rid,[queued(),queued()])).toThrow()
   expect(()=>projectClosingDeliveryCandidate(wid,rid,[accepted(),queued()])).toThrow()
   expect(()=>projectClosingDeliveryCandidate(wid,rid,[queued(),{
     ...accepted(),recordedAt:t(0)
   }])).toThrow()
 })
 it('rejects queued duplicate attempt, terminal status after terminal and wrong bounce ID',()=>{
   expect(()=>projectClosingDeliveryCandidate(wid,rid,
     [queued(),event(2,'queued_not_sent')])).toThrow()
   expect(()=>projectClosingDeliveryCandidate(wid,rid,
     [queued(),rejected(),accepted()])).toThrow()
   expect(()=>projectClosingDeliveryCandidate(wid,rid,
     [queued(),accepted(),{...bounced(),providerMessageId:'OTHER'}])).toThrow()
 })
 it('rejects malformed identifiers, overlong histories, invalid status',()=>{
   expect(()=>projectClosingDeliveryCandidate('not-uuid',rid,[])).toThrow()
   expect(()=>projectClosingDeliveryCandidate(wid,rid,
     Array.from({length:31},()=>queued()))).toThrow()
   expect(()=>projectClosingDeliveryCandidate(wid,rid,
     [{...queued(),eventState:'sent' as ProviderEventState}])).toThrow()
 })
})
