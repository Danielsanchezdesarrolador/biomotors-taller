/**
 * BT-COM-01C — server-only, pure read projection of an append-only FUTURE
 * provider ledger. This is NOT an email sender or receipt of client delivery.
 * No database, queue, network, credentials or browser import.
 */
export type ProviderEventState =
  | 'queued_not_sent'
  | 'provider_accepted'
  | 'provider_rejected'
  | 'ack_uncertain'
  | 'bounced'
export type ProviderEvent = {
  id: string
  workshopId: string
  reviewId: string
  attempt: number
  eventState: ProviderEventState
  providerMessageId: string | null
  errorCode: string | null
  recordedAt: string
}
export type DeliveryProjection = {
  state: 'operator_reviewed_not_sent' | ProviderEventState
  attempt: number
  providerMessageId: string | null
  lastRecordedAt: string | null
  /** Never imply mailbox delivery, opened email, customer signature or paid OT. */
  customerReceivedVerified: false
  sentToProvider: boolean
  retryBlocked: boolean
}
const UUID_FULL=new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
const CODE=/^[A-Z0-9_]{1,80}$/
const deny=():never=>{throw Error('BT_COM_DELIVERY_LEDGER_INVALID')}
export function projectClosingDeliveryCandidate(
  workshopId: string,
  reviewId: string,
  events: readonly ProviderEvent[]
): DeliveryProjection {
  if(!UUID_FULL.test(workshopId)||!UUID_FULL.test(reviewId)||
    !Array.isArray(events)||events.length>30)deny()
  let state: DeliveryProjection['state']='operator_reviewed_not_sent'
  let attempt=0, providerMessageId:string|null=null,lastRecordedAt:string|null=null
  const seen=new Set<string>()
  for(const e of events){
    if(!e||!UUID_FULL.test(e.id)||seen.has(e.id)||
      e.workshopId!==workshopId||e.reviewId!==reviewId||
      !Number.isSafeInteger(e.attempt)||e.attempt<1||e.attempt>10||
      typeof e.recordedAt!=='string'||!Number.isFinite(Date.parse(e.recordedAt))||
      (lastRecordedAt!==null && Date.parse(e.recordedAt)<Date.parse(lastRecordedAt))||
      !['queued_not_sent','provider_accepted','provider_rejected','ack_uncertain','bounced']
        .includes(e.eventState))deny()
    seen.add(e.id)
    if(e.eventState==='queued_not_sent'){
      // Never blindly resend a possibly accepted or ambiguous acknowledgement.
      if(e.attempt!==attempt+1 ||
        !['operator_reviewed_not_sent','provider_rejected'].includes(state)||
        e.providerMessageId!==null||e.errorCode!==null)deny()
      state='queued_not_sent'
      attempt=e.attempt
      providerMessageId=null
    }else{
      if(e.attempt!==attempt)deny()
      if(e.eventState==='bounced'){
        if(state!=='provider_accepted'||e.providerMessageId!==providerMessageId||
          typeof e.errorCode!=='string'||!CODE.test(e.errorCode))deny()
        state='bounced'
      }else{
        if(state!=='queued_not_sent')deny()
        if(e.eventState==='provider_accepted'){
          if(typeof e.providerMessageId!=='string'||
            !e.providerMessageId||e.providerMessageId.length>200||
            e.errorCode!==null)deny()
          providerMessageId=e.providerMessageId
        }else if(e.providerMessageId!==null||typeof e.errorCode!=='string'||
          !CODE.test(e.errorCode))deny()
        state=e.eventState
      }
    }
    lastRecordedAt=e.recordedAt
  }
  return {
    state,attempt,providerMessageId,lastRecordedAt,
    customerReceivedVerified:false,
    sentToProvider:state==='provider_accepted'||state==='bounced',
    retryBlocked:!['operator_reviewed_not_sent','provider_rejected'].includes(state)
  }
}
