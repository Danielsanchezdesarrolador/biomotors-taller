import {commercialPlans} from '../../src/plans/commercialContract'
/** Provider-neutral preparation. No checkout, card capture, email or provider call. */
export type PaidPlan='plus'|'full'
export function monthlySubtotal(plan:PaidPlan, mechanics:number, maxExtras:number, lifetimeGrant=false) {
 if(!['plus','full'].includes(plan)||!Number.isSafeInteger(mechanics)||mechanics<0||!Number.isSafeInteger(maxExtras)||maxExtras<0)throw Error('INVALID_PRICE_INPUT')
 const included=commercialPlans[plan].mechanics,extras=Math.max(0,mechanics-included)
 if(extras>maxExtras)throw Error('EXTRA_POLICY_REQUIRED')
 const subtotalCents=(lifetimeGrant?0:plan==='plus'?500:1500)+extras*200
 if(!Number.isSafeInteger(subtotalCents))throw Error('INVALID_PRICE_INPUT')
 return {currency:'USD' as const,included,extras,subtotalCents,payer:'license_holder' as const}
}
export type BillingEvent={eventId:string;customerId:string;subscriptionId:string;version:number;
 kind:'activated'|'renewed'|'payment_failed'|'expired'|'canceled'|'refunded'|'reconciled';plan:PaidPlan;extras:number;periodEnd:string;subtotalCents:number}
export interface BillingAdapter { readonly provider:string; verify(raw:Uint8Array,signature:string,now:number):Promise<unknown> }
export interface BillingLedger { apply(provider:string,event:BillingEvent):Promise<{state:string}> }
export function parseBillingEvent(value:unknown):BillingEvent {
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('INVALID_EVENT')
 const e=value as BillingEvent
 if(![e.eventId,e.customerId,e.subscriptionId].every(x=>typeof x==='string'&&/^[a-zA-Z0-9_-]{1,120}$/.test(x))||
  !Number.isSafeInteger(e.version)||e.version<1||!['activated','renewed','payment_failed','expired','canceled','refunded','reconciled'].includes(e.kind)||
  !['plus','full'].includes(e.plan)||!Number.isSafeInteger(e.extras)||e.extras<0||!Number.isSafeInteger(e.subtotalCents)||e.subtotalCents<0||
  typeof e.periodEnd!=='string'||!Number.isFinite(Date.parse(e.periodEnd)))throw Error('INVALID_EVENT')
 return {eventId:e.eventId,customerId:e.customerId,subscriptionId:e.subscriptionId,version:e.version,kind:e.kind,plan:e.plan,extras:e.extras,periodEnd:e.periodEnd,subtotalCents:e.subtotalCents}
}
export function billingHandler(options:{enabled?:boolean;adapter:BillingAdapter;ledger:BillingLedger;now?:()=>number}) {
 return async(request:Request):Promise<Response>=>{
  if(options.enabled!==true)return new Response('Billing disabled',{status:503})
  if(request.method!=='POST')return new Response('Method not allowed',{status:405})
  try{
   const reader=request.body?.getReader();if(!reader)throw Error('NO_BODY')
   const parts:Uint8Array[]=[];let size=0
   while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>65536){await reader.cancel();return new Response('Payload too large',{status:413})}parts.push(value)}
   const raw=new Uint8Array(size);let offset=0;for(const part of parts){raw.set(part,offset);offset+=part.length}
   const event=parseBillingEvent(await options.adapter.verify(raw,request.headers.get('x-bt-signature')||'',options.now?.()??Date.now()))
   const receipt=await options.ledger.apply(options.adapter.provider,event)
   return Response.json({accepted:true,state:receipt.state})
  }catch{return new Response('Webhook not accepted',{status:400})}
 }
}
/** Example normalized HMAC contract, NOT a claimed integration with any payment provider. */
export function hmacAdapter(provider:string,key:CryptoKey):BillingAdapter {
 return {provider,async verify(raw,signature,now){
  const match=/^t=([0-9]{10}),v1=([a-f0-9]{64})$/.exec(signature)
  if(!match||Math.abs(now-Number(match[1])*1000)>300_000)throw Error('BAD_SIGNATURE')
  const prefix=new TextEncoder().encode(match[1]+'.'),message=new Uint8Array(prefix.length+raw.length);message.set(prefix);message.set(raw,prefix.length)
  const sig=Uint8Array.from(match[2].match(/../g)!,x=>parseInt(x,16))
  if(!await crypto.subtle.verify('HMAC',key,sig,message))throw Error('BAD_SIGNATURE')
  return JSON.parse(new TextDecoder().decode(raw)) as unknown
 }}
}
