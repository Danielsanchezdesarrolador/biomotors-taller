import { describe, expect, it } from 'vitest'
import {
  mechanicInviteUrl, renderMechanicInviteEmail
} from '../../supabase/functions/_shared/mechanicInviteEmail'
const token = 'a'.repeat(64)
const data = {
  workshopName: 'Taller de Prueba',
  token,
  nowIso: '2026-11-14T18:00:00Z',
  expiresAt: '2026-11-16T16:00:00Z'
}
describe('BT-AUTH-R2-A4 · plantilla de invitación offline, SIN envío', () => {
  it('produce asunto, texto y HTML con enlace de un solo uso en hash', () => {
    const mail = renderMechanicInviteEmail(data)
    const link = mechanicInviteUrl(token)
    expect(link).toBe(
      'https://biomotors-taller-demo.onrender.com/#/auth/aceptar-invitacion?token=' + token
    )
    const url = new URL(link)
    expect(url.search).toBe('')
    expect(url.hash).toContain(token)
    expect(mail.subject).toContain('Taller de Prueba')
    expect(mail.text).toContain(link)
    expect(mail.html).toContain(link)
    expect(mail.text).toContain('confirma')
    expect(mail.html).toContain('Uso único')
    expect(mail.text).toContain('(Chile)')
  })
  it('escapa HTML y no permite inyección de nuevas líneas en asunto', () => {
    const mail = renderMechanicInviteEmail({ ...data, workshopName: '<script>alert("X")</script>' })
    expect(mail.html).not.toContain('<script>')
    expect(mail.html).toContain('&lt;script&gt;')
    expect(mail.subject).toContain('<script>')
    expect(() => renderMechanicInviteEmail({
      ...data, workshopName: 'Taller\r\nBCC: attacker@example.com'
    })).toThrow('Invalid workshop name')
  })
  it.each(['', 'ab', 'Z'.repeat(64), 'x'.repeat(64)])(
    'rechaza token inválido: %#', value => {
      expect(() => mechanicInviteUrl(value)).toThrow('Invalid invite token')
    }
  )
  it.each([
    { expiresAt: '2026-11-14T17:00:00Z' },
    { expiresAt: '2026-11-18T18:00:00Z' },
    { expiresAt: 'invalid' },
    { nowIso: 'invalid' }
  ])('rechaza vencimientos fuera de 48 horas o inválidos: %#', patch => {
    expect(() => renderMechanicInviteEmail({ ...data, ...patch })).toThrow('Invalid invitation expiry')
  })
  it('no admite nombre vacío o demasiados caracteres', () => {
    expect(() => renderMechanicInviteEmail({ ...data, workshopName: 'A' })).toThrow()
    expect(() => renderMechanicInviteEmail({
      ...data, workshopName: 'B'.repeat(121)
    })).toThrow()
  })
})
