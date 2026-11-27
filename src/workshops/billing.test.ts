import {describe,it,expect,vi} from 'vitest'
import {monthlySubtotal,billingHandler,hmacAdapter} from '../../server/billing/subscriptions'
describe('Billing preparation, no real provider or charge',()=>{
 it('prices included and extra mechanics only against the license holder',()=>{
  expect(monthlySubtotal('plus',3,1).subtotalCents).toBe(700)
  expect(monthlySubtotal('full',5,1).subtotalCents).toBe(1700)
  expect(monthlySubtotal('full',2,0,true).subtotalCents).toBe(0)
  expect(()=>monthlySubtotal('plus',5,0)).toThrow('EXTRA_POLICY_REQUIRED')
 })
 it('defaults OFF without even verifying or applying a webhook',async()=>{
  const verify=vi.fn(),apply=vi.fn();const handler=billingHandler({adapter:{provider:'offline',verify},ledger:{apply}})
  expect((await handler(new Request('https://invalid.test',{method:'POST',body:'{}'}))).status).toBe(503)
  expect(verify).not.toHaveBeenCalled();expect(apply).not.toHaveBeenCalled()
 })
 it('authenticates the exact bytes with timestamp, rejects altered bodies and hides raw errors',async()=>{
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode('synthetic-hmac-test-key'),{name:'HMAC',hash:'SHA-256'},false,['sign','verify'])
  const now=1_800_000_000_000,event={eventId:'event_one',customerId:'cust_one',subscriptionId:'sub_one',version:1,kind:'renewed',plan:'plus',extras:1,periodEnd:'2030-01-01',subtotalCents:700}
  const raw=JSON.stringify(event),timestamp=Math.floor(now/1000).toString(),signed=new TextEncoder().encode(timestamp+'.'+raw)
  const signature='t='+timestamp+',v1='+Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,signed)),x=>x.toString(16).padStart(2,'0')).join('')
  const adapter=hmacAdapter('offline',key),apply=vi.fn(async()=>({state:'applied'}))
  const handler=billingHandler({enabled:true,adapter,ledger:{apply},now:()=>now})
  const request=(body:string,sig=signature)=>new Request('https://invalid.test',{method:'POST',headers:{'x-bt-signature':sig},body})
  expect((await handler(request(raw))).status).toBe(200);expect(apply).toHaveBeenCalledOnce()
  expect((await handler(request(raw+' '))).status).toBe(400);expect(apply).toHaveBeenCalledOnce()
  expect((await billingHandler({enabled:true,adapter,ledger:{apply},now:()=>now+600_000})(request(raw))).status).toBe(400)
 })
})
