import { describe, expect, it, vi } from 'vitest'
import { createMemoryOnlyInviteHandoff } from './inviteHandoffCandidate'

const token = 'ab'.repeat(32)
const clean = '/#/auth/aceptar-invitacion'
const invite = (hash: string, search = '') => ({ pathname: '/', search, hash })

describe('BT-AUTH-R2-A6-7 · handoff aislado de token, solo memoria', () => {
  it('limpia URL antes de guardar en memoria y consume una sola vez', () => {
    const handoff = createMemoryOnlyInviteHandoff(() => 1000)
    const replace = vi.fn((url: string) => {
      expect(url).toBe(clean)
      expect(url).not.toContain(token)
      expect(handoff.state()).toBe('empty')
    })
    expect(handoff.capture(invite('#/auth/aceptar-invitacion?token=' + token), replace))
      .toBe('ready')
    expect(replace).toHaveBeenCalledOnce()
    expect(handoff.consumeOnce()).toBe(token)
    expect(handoff.consumeOnce()).toBeNull()
  })
  it('rechaza token falso, doble, caracteres codificados y campos de privilegios', () => {
    const bad = [
      '?token=x', '?token=' + token.toUpperCase(),
      '?token=' + token + '&role=owner',
      '?token=' + token + '&token=' + token,
      '?token=' + token + '&', '?token=%61' + token.slice(1),
      '?user_id=1&token=' + token,
      '?token=' + token.slice(1)
    ]
    for (const q of bad) {
      const h = createMemoryOnlyInviteHandoff()
      const replace = vi.fn()
      expect(h.capture(invite('#/auth/aceptar-invitacion' + q), replace))
        .toBe('rejected')
      expect(replace).toHaveBeenCalledWith(clean)
      expect(h.consumeOnce()).toBeNull()
    }
  })
  it('permite ruta profunda canónica pero nunca conserva parámetros externos', () => {
    const h = createMemoryOnlyInviteHandoff()
    const replace = vi.fn()
    expect(h.capture({
      pathname:'/auth/aceptar-invitacion', search:'?token='+token, hash:''
    },replace)).toBe('ready')
    expect(replace).toHaveBeenCalledWith(clean)
    expect(h.consumeOnce()).toBe(token)
    expect(h.capture(invite('#/auth/aceptar-invitacion?token='+token,
      '?source=untrusted'),replace)).toBe('rejected')
  })
  it('expira a los cinco minutos, se limpia y nunca se reusa', () => {
    let clock=100
    const h=createMemoryOnlyInviteHandoff(()=>clock)
    h.capture(invite('#/auth/aceptar-invitacion?token='+token),()=>{})
    clock+=299999
    expect(h.state()).toBe('ready')
    clock++
    expect(h.state()).toBe('expired')
    expect(h.state()).toBe('empty')
    expect(h.consumeOnce()).toBeNull()
  })
  it('un enlace nuevo elimina el secreto anterior incluso si es inválido', () => {
    const h=createMemoryOnlyInviteHandoff()
    h.capture(invite('#/auth/aceptar-invitacion?token='+token),()=>{})
    expect(h.capture(invite('#/auth/aceptar-invitacion?token=bad'),()=>{}))
      .toBe('rejected')
    expect(h.state()).toBe('empty')
    h.capture(invite('#/auth/aceptar-invitacion?token='+token),()=>{})
    expect(h.capture(invite('#/acceso'),()=>{})).toBe('not-invite')
    expect(h.consumeOnce()).toBeNull()
  })
  it('fallo de replaceState implica rechazo total', () => {
    const h=createMemoryOnlyInviteHandoff()
    expect(h.capture(invite('#/auth/aceptar-invitacion?token='+token),
      ()=>{throw Error('blocked')})).toBe('rejected')
    expect(h.consumeOnce()).toBeNull()
  })
  it('pestaña distinta o recarga no comparte el secreto', () => {
    const a=createMemoryOnlyInviteHandoff(), b=createMemoryOnlyInviteHandoff()
    a.capture(invite('#/auth/aceptar-invitacion?token='+token),()=>{})
    expect(a.state()).toBe('ready')
    expect(b.state()).toBe('empty')
    a.clear()
    expect(a.consumeOnce()).toBeNull()
  })
  it('duración manipulada o reloj inválido falla cerrado', () => {
    for (const limit of [0,-1,300001,NaN,1.5,Infinity])
      expect(()=>createMemoryOnlyInviteHandoff(Date.now,limit)).toThrow()
    const h=createMemoryOnlyInviteHandoff(()=>NaN)
    expect(h.capture(invite('#/auth/aceptar-invitacion?token='+token),()=>{}))
      .toBe('rejected')
  })
  it('otros enlaces nunca son aceptados', () => {
    const h=createMemoryOnlyInviteHandoff()
    for(const loc of [
      invite('#/auth/aceptar-invitacion'),
      invite('#/acceso?token='+token),
      invite('#/auth/aceptar-invitacion-falsa?token='+token),
      {pathname:'/auth/aceptar-invitacion/',search:'?token='+token,hash:''}
    ]) {
      expect(h.capture(loc,()=>{})).not.toBe('ready')
      expect(h.state()).toBe('empty')
    }
  })
  it('rutas ambiguas y hash combinado se limpian pero se deniegan', () => {
    const h=createMemoryOnlyInviteHandoff()
    for(const loc of [
      {pathname:'/otro',search:'',hash:'#/auth/aceptar-invitacion?token='+token},
      {pathname:'/auth/aceptar-invitacion',search:'?token='+token,hash:'#/acceso'},
      {pathname:'/auth/aceptar-invitacion',search:'?token='+token+'&plan=full',hash:''}
    ]) {
      const replace=vi.fn()
      expect(h.capture(loc,replace)).toBe('rejected')
      expect(replace).toHaveBeenCalledWith(clean)
    }
  })
})
