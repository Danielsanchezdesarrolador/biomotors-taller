import { describe, expect, it, vi } from 'vitest'
import { createInviteSessionCandidate } from './inviteSessionCandidate'
import type { Identity } from './controller'

const TOKEN = 'ab'.repeat(32)
const TOKEN_B = 'cd'.repeat(32)
const UUID_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const UUID_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const CONFIRMED = { id: UUID_A, confirmed: true }
const LINK = { pathname: '/', search: '', hash: '#/auth/aceptar-invitacion?token=' + TOKEN }
const LINK_B = { pathname: '/', search: '', hash: '#/auth/aceptar-invitacion?token=' + TOKEN_B }
const create = (getUser: () => Promise<Identity | null>, now?: () => number) => {
  const flow = createInviteSessionCandidate({ getUser }, now)
  const scrub = vi.fn()
  expect(flow.capture(LINK, scrub)).toBe('awaiting-login')
  expect(scrub).toHaveBeenCalledWith('/#/auth/aceptar-invitacion')
  return flow
}
const trusted = () => vi.fn(async (): Promise<Identity | null> => CONFIRMED)

describe('BT-AUTH-R2-A6-8 · continuidad segura de sesión, candidata no pública', () => {
  it('mantiene enlace mientras NO existe aún membresía, pero requiere Auth confirmada', async () => {
    const getUser = trusted()
    const flow = create(getUser)
    expect(flow.snapshot()).toEqual({ stage: 'awaiting-login' })
    expect(await flow.verifySession()).toBe('ready')
    expect(flow.snapshot()).toEqual({ stage: 'ready' })
    expect(await flow.consumeAfterRecheck()).toBe(TOKEN)
    expect(flow.snapshot()).toEqual({ stage: 'consumed' })
    expect(await flow.consumeAfterRecheck()).toBeNull()
    expect(getUser).toHaveBeenCalledTimes(2)
  })
  it('cuando no hay sesión, permite iniciar sesión sin perder enlace por 5 minutos', async () => {
    const getUser = vi.fn().mockResolvedValueOnce(null)
      .mockResolvedValue(CONFIRMED)
    const flow = create(getUser)
    expect(await flow.verifySession()).toBe('awaiting-login')
    expect(flow.onAuthEvent('SIGNED_IN')).toBe('awaiting-login')
    expect(await flow.verifySession()).toBe('ready')
    expect(await flow.consumeAfterRecheck()).toBe(TOKEN)
  })
  it('Auth con respuesta malformada falla cerrado, nunca rompe el flujo', async () => {
    for (const identity of [
      undefined, [], {}, {confirmed:true}, {confirmed:true,id:null},
      {confirmed:'true',id:UUID_A}, 'not-user'
    ]) {
      const flow = create(async () => identity as unknown as Identity)
      expect(await flow.verifySession()).not.toBe('ready')
      expect(await flow.consumeAfterRecheck()).toBeNull()
    }
  })
  it('correo no confirmado invalida el token, sin aceptar o reusar', async () => {
    const flow = create(async () => ({...CONFIRMED, confirmed: false}))
    expect(await flow.verifySession()).toBe('discarded')
    expect(await flow.consumeAfterRecheck()).toBeNull()
  })
  it('UUID inválido o mayúsculas son rechazados, incluso con confirmed=true', async () => {
    for (const id of ['x', UUID_A.toUpperCase(), 'A' + UUID_A.slice(1)]) {
      const flow = create(async () => ({id, confirmed: true}))
      // UUID_A contains letters, uppercase is an actual invalid variant.
      expect(await flow.verifySession()).toBe('discarded')
    }
  })
  it('cierre de sesión invalida inmediatamente, sin esperar promesas pendientes', async () => {
    const flow = create(trusted())
    await flow.verifySession()
    expect(flow.onAuthEvent('SIGNED_OUT')).toBe('discarded')
    expect(await flow.consumeAfterRecheck()).toBeNull()
  })
  it('SIGNED_IN con identidad anterior verificada implica posible cambio de cuenta y bloqueo', async () => {
    const flow = create(trusted())
    await flow.verifySession()
    expect(flow.onAuthEvent('SIGNED_IN')).toBe('discarded')
    expect(flow.snapshot()).toEqual({stage:'discarded'})
  })
  it('refresh conserva la espera pero exige getUser de nuevo, misma identidad', async () => {
    const getUser = trusted()
    const flow = create(getUser)
    expect(await flow.verifySession()).toBe('ready')
    expect(flow.onAuthEvent('TOKEN_REFRESHED')).toBe('awaiting-login')
    expect(await flow.consumeAfterRecheck()).toBeNull()
    expect(await flow.verifySession()).toBe('ready')
    expect(await flow.consumeAfterRecheck()).toBe(TOKEN)
    expect(getUser).toHaveBeenCalledTimes(3)
  })
  it('refresh con cambio de principal descarta token por completo', async () => {
    const getUser = vi.fn().mockResolvedValueOnce(CONFIRMED)
      .mockResolvedValue({id:UUID_B,confirmed:true})
    const flow = create(getUser)
    await flow.verifySession()
    flow.onAuthEvent('USER_UPDATED')
    expect(await flow.verifySession()).toBe('discarded')
    expect(await flow.consumeAfterRecheck()).toBeNull()
  })
  it.each(['PASSWORD_RECOVERY', 'MFA_CHALLENGE_VERIFIED', 'SOME_UNKNOWN_EVENT'])(
    'evento Auth %s nunca autoriza aceptación', async event => {
      const flow = create(trusted())
      await flow.verifySession()
      expect(flow.onAuthEvent(event)).toBe('discarded')
      expect(await flow.consumeAfterRecheck()).toBeNull()
    }
  )
  it('salir de pantalla, pagehide o cambio de navegador descartaría el token', async () => {
    const flow = create(trusted())
    await flow.verifySession()
    expect(flow.onLeave()).toBe('discarded')
    expect(await flow.consumeAfterRecheck()).toBeNull()
    const second = createInviteSessionCandidate({getUser:trusted()})
    expect(second.snapshot()).toEqual({stage:'empty'})
  })
  it('nueva invitación invalida la anterior y obliga a verificar otra vez', async () => {
    const flow = create(trusted())
    await flow.verifySession()
    expect(flow.capture(LINK_B, () => {})).toBe('awaiting-login')
    expect(await flow.consumeAfterRecheck()).toBeNull()
    expect(await flow.verifySession()).toBe('ready')
    expect(await flow.consumeAfterRecheck()).toBe(TOKEN_B)
  })
  it('no muestra ni serializa token o identidad en estado', async () => {
    const flow = create(trusted())
    await flow.verifySession()
    const state = JSON.stringify(flow.snapshot())
    expect(state).toBe('{"stage":"ready"}')
    expect(state).not.toContain(TOKEN)
    expect(state).not.toContain(UUID_A)
    expect(state).not.toContain('email')
  })
  it('la verificación Auth fallida por desconexión limpia secreto y bloquea', async () => {
    const flow = create(async () => { throw Error('offline private token') })
    expect(await flow.verifySession()).toBe('discarded')
    expect(await flow.consumeAfterRecheck()).toBeNull()
  })
  it('error de Auth en segunda verificación evita entregar token', async () => {
    const getUser = vi.fn().mockResolvedValueOnce(CONFIRMED)
      .mockRejectedValue(Error('Auth offline'))
    const flow = create(getUser)
    expect(await flow.verifySession()).toBe('ready')
    expect(await flow.consumeAfterRecheck()).toBeNull()
    expect(flow.snapshot()).toEqual({stage:'discarded'})
  })
  it('account switch durante el segundo getUser cancela petición y pierde secreto', async () => {
    let resolve!: (value: Identity | null) => void
    const pending = new Promise<Identity | null>(r => { resolve = r })
    const getUser = vi.fn().mockResolvedValueOnce(CONFIRMED)
      .mockImplementationOnce(() => pending)
    const flow = create(getUser)
    await flow.verifySession()
    const run = flow.consumeAfterRecheck()
    expect(flow.onAuthEvent('SIGNED_OUT')).toBe('discarded')
    resolve(CONFIRMED)
    expect(await run).toBeNull()
    expect(flow.snapshot()).toEqual({stage:'discarded'})
  })
  it('verificación antigua resuelta después de logout no resucita el token', async () => {
    let resolve!: (value: Identity | null) => void
    const pending = new Promise<Identity | null>(r => { resolve = r })
    const flow = create(() => pending)
    const inFlight = flow.verifySession()
    expect(flow.onAuthEvent('SIGNED_OUT')).toBe('discarded')
    resolve(CONFIRMED)
    expect(await inFlight).toBe('discarded')
  })
  it('getUser concurrente anterior no puede sobrescribir resultado nuevo', async () => {
    let resolveOld!: (value: Identity | null) => void
    const old = new Promise<Identity | null>(r => { resolveOld = r })
    const getUser = vi.fn()
      .mockImplementationOnce(() => old)
      .mockResolvedValueOnce(CONFIRMED)
    const flow = create(getUser)
    const stale = flow.verifySession()
    expect(await flow.verifySession()).toBe('ready')
    resolveOld({id:UUID_B,confirmed:true})
    expect(await stale).toBe('ready')
    expect(await flow.consumeAfterRecheck()).toBeNull()
    // The third getUser call has no test result; failure must remain closed.
  })
  it('el vencimiento mientras Auth verifica no entrega el token', async () => {
    let clock = 0
    let resolve!: (value: Identity | null) => void
    const pending = new Promise<Identity | null>(r => { resolve = r })
    const flow = create(() => pending, ()=>clock)
    const result = flow.verifySession()
    clock = 300_000
    resolve(CONFIRMED)
    expect(await result).toBe('expired')
    expect(await flow.consumeAfterRecheck()).toBeNull()
  })
  it('la pestaña/instancia distinta no puede reusar tokens ni estado de sesión', async () => {
    const first = create(trusted())
    await first.verifySession()
    const newTab = createInviteSessionCandidate({getUser:trusted()})
    expect(newTab.snapshot()).toEqual({stage:'empty'})
    expect(await newTab.consumeAfterRecheck()).toBeNull()
    expect(await first.consumeAfterRecheck()).toBe(TOKEN)
  })
  it('eventos de sesión no guardan ni registran tokens', async () => {
    const flow = create(trusted())
    const snapshotBefore = JSON.stringify(flow.snapshot())
    const snapshotAfter = JSON.stringify({stage:flow.onAuthEvent('INITIAL_SESSION')})
    expect(snapshotBefore+snapshotAfter).not.toContain(TOKEN)
    expect(await flow.verifySession()).toBe('ready')
  })
})
