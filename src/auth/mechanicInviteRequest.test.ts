import { describe, expect, it } from 'vitest'
import { parseMechanicInviteRequest, parseRevokeMechanicInviteRequest } from '../../supabase/functions/_shared/mechanicInviteRequest'

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

describe('BT-AUTH-R2-A2 · contrato de revocación', () => {
  const workshop_id = 'c943ad51-6d90-447b-8aa7-68866f69a4bc'
  const invitation_id = '005d0348-fda0-4dc7-ba16-3b5708200e5b'
  it('acepta exclusivamente IDs validados de taller e invitación', () => {
    expect(parseRevokeMechanicInviteRequest({ workshop_id, invitation_id }))
      .toEqual({ workshop_id, invitation_id })
  })
  it.each(['role', 'plan', 'actor_id', 'user_id', 'email', 'status'])(
    'rechaza la inyección del campo %s', (key) => {
      expect(parseRevokeMechanicInviteRequest({
        workshop_id, invitation_id, [key]: 'admin'
      })).toBeNull()
    }
  )
  it('rechaza identificadores y contratos falsos', () => {
    for (const input of [null, [], {}, { workshop_id }, {
      workshop_id, invitation_id: 'not-a-uuid'
    }, { workshop_id: 'not-a-uuid', invitation_id }]) {
      expect(parseRevokeMechanicInviteRequest(input)).toBeNull()
    }
  })
})
