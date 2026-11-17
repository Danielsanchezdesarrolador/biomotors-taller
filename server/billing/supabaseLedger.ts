import type {SupabaseClient} from '@supabase/supabase-js'
import type {BillingLedger} from './subscriptions'
/** Inject only a backend client. Never imported by browser code. SQL keeps a second OFF gate. */
export function supabaseBillingLedger(client:SupabaseClient):BillingLedger {
 return {async apply(provider,event){const {data,error}=await client.rpc('bt_plan04_apply_billing',{
  p_provider:provider,p_event_id:event.eventId,p_customer:event.customerId,p_subscription:event.subscriptionId,
  p_version:event.version,p_kind:event.kind,p_plan:event.plan,p_extras:event.extras,p_period_end:event.periodEnd,p_subtotal:event.subtotalCents
 });if(error||!data||typeof data.state!=='string')throw Error('BILLING_NOT_APPLIED');return {state:data.state}}}
}
