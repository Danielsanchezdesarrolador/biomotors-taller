import {beforeEach,afterEach,describe,it,expect,vi} from 'vitest'
describe('Gated invitation memory runtime, no network or persistence',()=>{
 let events:EventTarget,documentEvents:EventTarget
 let location:{pathname:string;search:string;hash:string}
 beforeEach(()=>{
  vi.resetModules();vi.useFakeTimers()
  events=new EventTarget();documentEvents=new EventTarget()
  location={pathname:'/',search:'',hash:'#/auth/aceptar-invitacion?token='+'a'.repeat(64)}
  vi.stubGlobal('window',{location,setTimeout,clearTimeout,addEventListener:events.addEventListener.bind(events),history:{state:null,replaceState:(_state:unknown,_unused:string,path:string)=>{const url=new URL(path,'https://bytetorque.cl');Object.assign(location,{pathname:url.pathname,search:url.search,hash:url.hash})}}})
  vi.stubGlobal('document',{visibilityState:'visible',addEventListener:documentEvents.addEventListener.bind(documentEvents)})
 })
 afterEach(()=>{vi.clearAllTimers();vi.useRealTimers();vi.unstubAllGlobals()})
 it('redacts before keeping a token and consumes once',async()=>{
  const runtime=await import('./invitationRuntime')
  runtime.captureInvitation({...location},Date.now())
  expect(location.hash).toBe('#/auth/aceptar-invitacion')
  expect(runtime.invitationHandoff.consumeOnce()).toBe('a'.repeat(64))
  expect(runtime.invitationHandoff.consumeOnce()).toBeNull()
 })
 it('captures a later invitation before React navigation and replaces its expiry timer',async()=>{
  const runtime=await import('./invitationRuntime')
  runtime.captureInvitation({...location},Date.now());runtime.watchInvitationNavigation()
  vi.advanceTimersByTime(200_000)
  location.hash='#/auth/aceptar-invitacion?token='+'b'.repeat(64)
  events.dispatchEvent(new Event('popstate'))
  expect(location.hash).toBe('#/auth/aceptar-invitacion')
  vi.advanceTimersByTime(100_001)
  expect(runtime.invitationHandoff.consumeOnce()).toBe('b'.repeat(64))
 })
 it('clears on offline and rejects tokens sent in an HTTP query',async()=>{
  const runtime=await import('./invitationRuntime')
  runtime.captureInvitation({...location},Date.now());runtime.watchInvitationNavigation()
  events.dispatchEvent(new Event('offline'))
  expect(runtime.invitationHandoff.state()).toBe('empty')
  runtime.captureInvitation({pathname:'/auth/aceptar-invitacion',search:'?token='+'c'.repeat(64),hash:''},Date.now())
  expect(runtime.invitationHandoff.state()).toBe('empty')
 })
})
