import { describe, expect, it } from 'vitest'
import { parseMechanicInviteRequest } from '../../supabase/functions/_shared/mechanicInviteRequest'

const valid = {
  workshop_id: 'c943ad51-6d90-447b-8aa7-68866f69a4bc',
  email: '  MECHANIC@EXAMPLE.COM  '
}
describe('BT-AUTH-R2-A · parsing de solicitud (no autoriza ni envía)', () => {
  it('normaliza únicamente ID y correo', () => {
    expect(parseMechanicInviteRequest(valid)).toEqual({
      workshop_id: valid.workshop_id,
      email: 'mechanic@example.com'
    })
  })
  it.each(['role', 'plan', 'actor_id', 'user_id', 'token', 'expires_at'])(
    'no permite parámetro privilegiado %s', (key) => {
      expect(parseMechanicInviteRequest({ ...valid, [key]: 'admin' })).toBeNull()
    }
  )
  it.each([
    null, [], '', 1, {}, { email: valid.email },
    { ...valid, workshop_id: 'otra-empresa' },
    { ...valid, email: 'mal' }, { ...valid, email: '@example.com' },
    { ...valid, email: 'a'.repeat(255) + '@example.com' }
  ])('rechaza contrato incompleto o no válido %#', (value) => {
    expect(parseMechanicInviteRequest(value)).toBeNull()
  })
})
