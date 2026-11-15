import { describe, expect, it, vi } from 'vitest'
import { createInviteSessionCandidate } from './inviteSessionCandidate'
import { createInviteBrowserLifecycleCandidate } from './inviteBrowserLifecycleCandidate'
import type { InviteLocation } from './inviteLinkRouting'

const token = 'ab'.repeat(32)
const user = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', confirmed: true }
const inviteUrl = '#/auth/aceptar-invitacion?token=' + token
const cleanUrl = '#/auth/aceptar-invitacion'

function setup() {
  const flow = createInviteSessionCandidate({ getUser: vi.fn(async () => user) })
  expect(flow.capture({
    pathname: '/', search: '', hash: inviteUrl
  }, () => {})).toBe('awaiting-login')
  const browser = new EventTarget()
  const document = Object.assign(new EventTarget(), { visibilityState: 'visible' })
  let location: InviteLocation = { pathname: '/', search: '', hash: cleanUrl }
  const replaceUrl = vi.fn(() => {
    location = { pathname: '/', search: '', hash: cleanUrl }
  })
  const auth = new Set<(event: string) => void>()
  const unsubscribe = vi.fn()
  const adapter = createInviteBrowserLifecycleCandidate(flow, {
    browser, document, readLocation: () => location, replaceUrl,
    subscribeAuth(callback) {
      auth.add(callback)
      return () => { auth.delete(callback); unsubscribe() }
    }
  })
  return {
    flow, browser, document, adapter, replaceUrl, unsubscribe,
    route(hash: string, search = '', pathname = '/') {
      location = { pathname, search, hash }
      browser.dispatchEvent(new Event('hashchange'))
    },
    goBack(hash: string) {
      location = { pathname: '/', search: '', hash }
      browser.dispatchEvent(new Event('popstate'))
    },
    auth(event: string) { for (const fn of auth) fn(event) }
  }
}
describe('BT-AUTH-R2-A6-9 · navegador Safari/PWA: contrato OFFLINE', () => {
  it('mantiene token solo entre invitación limpia y acceso de mecánico en misma pestaña', async () => {
    const t = setup()
    t.adapter.attach()
    await t.flow.verifySession()
    t.route('#/acceso/mecanico')
    expect(t.flow.snapshot()).toEqual({ stage: 'ready' })
    expect(await t.flow.consumeAfterRecheck()).toBe(token)
    expect(await t.flow.consumeAfterRecheck()).toBeNull()
    t.adapter.detach()
  })
  it('abandona invitación al pasar a dashboard, registro o recuperación', async () => {
    for (const route of ['#/revision/publica', '#/acceso/registro', '#/auth/recuperacion']) {
      const t = setup()
      t.adapter.attach()
      await t.flow.verifySession()
      t.route(route)
      expect(t.flow.snapshot()).toEqual({ stage: 'discarded' })
      expect(await t.flow.consumeAfterRecheck()).toBeNull()
    }
  })
  it.each(['pagehide', 'beforeunload', 'offline'])(
    '%s descarta el token inmediatamente', async event => {
      const t = setup()
      t.adapter.attach()
      await t.flow.verifySession()
      t.browser.dispatchEvent(new Event(event))
      expect(t.flow.snapshot()).toEqual({ stage: 'discarded' })
    }
  )
  it('visibilitychange hidden descarta token en cambio de app', async () => {
    const t = setup()
    t.adapter.attach()
    await t.flow.verifySession()
    t.document.visibilityState = 'hidden'
    t.document.dispatchEvent(new Event('visibilitychange'))
    expect(t.flow.snapshot()).toEqual({stage: 'discarded'})
  })
  it('attach desde una pestaña ya oculta descarta el token sin esperar eventos Safari', async () => {
    const t = setup()
    t.document.visibilityState = 'hidden'
    t.adapter.attach()
    expect(t.flow.snapshot()).toEqual({ stage: 'discarded' })
    expect(await t.flow.consumeAfterRecheck()).toBeNull()
    t.adapter.detach()
  })
  it('pageshow normal con página ya oculta falla cerrado', async () => {
    const t = setup()
    t.adapter.attach()
    await t.flow.verifySession()
    t.document.visibilityState = 'hidden'
    t.browser.dispatchEvent(new Event('pageshow'))
    expect(t.flow.snapshot()).toEqual({ stage: 'discarded' })
    expect(await t.flow.consumeAfterRecheck()).toBeNull()
  })
  it('pageshow desde bfcache descarta el token y no confía en antigua sesión', async () => {
    const t = setup()
    t.adapter.attach()
    await t.flow.verifySession()
    const event = Object.assign(new Event('pageshow'), { persisted: true })
    t.browser.dispatchEvent(event)
    expect(t.flow.snapshot()).toEqual({ stage: 'discarded' })
  })
  it('pageshow normal no borra una invitación abierta en primer plano', async () => {
    const t = setup()
    t.adapter.attach()
    await t.flow.verifySession()
    t.browser.dispatchEvent(new Event('pageshow'))
    expect(t.flow.snapshot()).toEqual({ stage: 'ready' })
  })
  it('hash con nuevo token se limpia, y el token anterior se pierde', async () => {
    const t = setup()
    t.adapter.attach()
    await t.flow.verifySession()
    t.route('#/auth/aceptar-invitacion?token=' + 'cd'.repeat(32))
    expect(t.replaceUrl).toHaveBeenCalledWith('/#/auth/aceptar-invitacion')
    expect(t.flow.snapshot()).toEqual({ stage: 'discarded' })
  })
  it('back/forward no revive token tras salir del flujo', async () => {
    const t = setup()
    t.adapter.attach()
    await t.flow.verifySession()
    t.route('#/revision/publica')
    t.goBack('#/auth/aceptar-invitacion')
    expect(t.flow.snapshot()).toEqual({ stage: 'discarded' })
    expect(await t.flow.consumeAfterRecheck()).toBeNull()
  })
  it('Auth SIGNED_OUT invalida el token aunque el URL siga limpio', async () => {
    const t = setup()
    t.adapter.attach()
    await t.flow.verifySession()
    t.auth('SIGNED_OUT')
    expect(t.flow.snapshot()).toEqual({ stage: 'discarded' })
  })
  it('Auth TOKEN_REFRESHED necesita nuevo getUser, no otorga permisos', async () => {
    const t = setup()
    t.adapter.attach()
    await t.flow.verifySession()
    t.auth('TOKEN_REFRESHED')
    expect(t.flow.snapshot()).toEqual({ stage: 'awaiting-login' })
    expect(await t.flow.consumeAfterRecheck()).toBeNull()
    expect(await t.flow.verifySession()).toBe('ready')
    t.adapter.detach()
  })
  it('evento Auth desconocido hace fallar cerrado', async () => {
    const t = setup()
    t.adapter.attach()
    await t.flow.verifySession()
    t.auth('FUTURE_UNRECOGNIZED_EVENT')
    expect(t.flow.snapshot()).toEqual({ stage: 'discarded' })
  })
  it('ruta query externa, pathname extraño o enlace profundo se rechazan', async () => {
    for (const [pathname, search, hash] of [
      ['/', '?role=owner', cleanUrl],
      ['/auth/aceptar-invitacion', '?token=' + token, ''],
      ['/other', '', cleanUrl]
    ]) {
      const t = setup()
      t.adapter.attach()
      await t.flow.verifySession()
      t.route(hash, search, pathname)
      expect(t.flow.snapshot()).toEqual({stage:'discarded'})
    }
  })
  it('detaching cancela listeners/Auth y borra toda invitación', async () => {
    const t = setup()
    const detach = t.adapter.attach()
    await t.flow.verifySession()
    detach()
    expect(t.unsubscribe).toHaveBeenCalledOnce()
    expect(t.flow.snapshot()).toEqual({stage:'discarded'})
    t.auth('SIGNED_IN')
    t.route('#/acceso')
    expect(t.flow.snapshot()).toEqual({stage:'discarded'})
  })
  it('attach duplicado no crea dos suscripciones Auth', async () => {
    const t = setup()
    const stop1 = t.adapter.attach()
    const stop2 = t.adapter.attach()
    expect(stop2).toBe(stop1)
    stop1()
    expect(t.unsubscribe).toHaveBeenCalledOnce()
  })
  it('el adaptador no serializa ni muestra token, correo o JWT', async () => {
    const t = setup()
    t.adapter.attach()
    await t.flow.verifySession()
    expect(JSON.stringify(t.flow.snapshot())).toBe('{"stage":"ready"}')
    expect(JSON.stringify(t.flow.snapshot())).not.toContain(token)
    t.adapter.detach()
  })
  it('navigation replaceState fallido descarta el token', async () => {
    const flow = createInviteSessionCandidate({getUser:async()=>user})
    flow.capture({pathname:'/',search:'',hash:inviteUrl},()=>{})
    const browser = new EventTarget()
    const document=Object.assign(new EventTarget(),{visibilityState:'visible'})
    const t=createInviteBrowserLifecycleCandidate(flow,{
      browser, document,
      readLocation:()=>({pathname:'/',search:'',hash:'#/auth/aceptar-invitacion?token='+token}),
      replaceUrl:()=>{throw Error('browser denied')},
      subscribeAuth:()=>()=>{}
    })
    t.attach()
    expect(flow.snapshot()).toEqual({stage:'discarded'})
  })
  it('suscripción Auth fallida limpia el token y desengancha eventos', async () => {
    const flow=createInviteSessionCandidate({getUser:async()=>user})
    flow.capture({pathname:'/',search:'',hash:inviteUrl},()=>{})
    const t=createInviteBrowserLifecycleCandidate(flow,{
      browser:new EventTarget(),
      document:Object.assign(new EventTarget(),{visibilityState:'visible'}),
      readLocation:()=>({pathname:'/',search:'',hash:cleanUrl}),
      replaceUrl:()=>{},
      subscribeAuth:()=>{throw Error('mock Auth unavailable')}
    })
    expect(()=>t.attach()).not.toThrow()
    expect(flow.snapshot()).toEqual({stage:'discarded'})
  })
})
