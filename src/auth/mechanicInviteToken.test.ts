import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import {
  createMechanicInviteToken,
  hashMechanicInviteToken,
  parseAcceptMechanicInviteRequest
} from '../../supabase/functions/_shared/mechanicInviteToken'
const sample = 'ab'.repeat(32)
describe('BT-AUTH-R2-A2 · token de invitación (pruebas locales, sin backend)', () => {
  it('crea 256 bits de entropía y hashes distintos sin revelar token en la DB', async () => {
    const a = await createMechanicInviteToken()
    const b = await createMechanicInviteToken()
    expect(a.token).toMatch(/^[a-f0-9]{64}$/)
    expect(a.token_sha256_hex).toMatch(/^[a-f0-9]{64}$/)
    expect(a.token).not.toBe(b.token)
    expect(a.token_sha256_hex).not.toBe(a.token)
    expect(a.token_sha256_hex).toBe(await hashMechanicInviteToken(a.token))
  })
  it('SHA-256 se calcula sobre los 32 bytes y coincide con Node crypto', async () => {
    const expected = createHash('sha256').update(Buffer.from(sample, 'hex')).digest('hex')
    expect(await hashMechanicInviteToken(sample)).toBe(expected)
  })
  it.each(['', 'ab', 'z'.repeat(64), sample.toUpperCase(), 'f'.repeat(65)])(
    'rechaza token mal formado', async token => {
      await expect(hashMechanicInviteToken(token)).rejects.toThrow('Invalid')
    }
  )
  it('la aceptación solo admite token, sin identidad o permisos suministrados', () => {
    expect(parseAcceptMechanicInviteRequest({ token: sample })).toEqual({ token: sample })
    for (const key of ['email', 'role', 'plan', 'workshop_id', 'user_id', 'actor_id']) {
      expect(parseAcceptMechanicInviteRequest({ token: sample, [key]: 'owner' })).toBeNull()
    }
  })
  it.each([null, undefined, [], {}, { token: 'x' }, { token: sample.toUpperCase() },
    { token: sample, extra: false }, { token: sample.slice(1) }])(
      'rechaza carga inválida %#', payload => {
        expect(parseAcceptMechanicInviteRequest(payload)).toBeNull()
      }
    )
})
