import { describe, expect, it } from 'vitest'
import { createMechanicInviteToken } from '../../supabase/functions/_shared/mechanicInviteToken'
import { sealInviteEnvelope, openInviteEnvelope } from '../../supabase/functions/_shared/encryptedInviteEnvelope'

const workshopId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const otherWorkshop = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const nowIso = '2026-11-14T20:00:00Z'
const expiresAt = '2026-11-15T20:00:00Z'
const key = () => crypto.getRandomValues(new Uint8Array(new ArrayBuffer(32)))
const fixture = (token: string) => ({
  workshopId, recipientEmail: ' Mechanic@Example.COM ', token, expiresAt
})
describe('BT-AUTH-R2-A6 · outbox cifrado local, sin correos reales', () => {
  it('cifra 256-bit token con AES-GCM, conserva solo ciphertext/nonce y contexto validado', async () => {
    const token = (await createMechanicInviteToken()).token
    const k = key()
    const sealed = await sealInviteEnvelope(fixture(token), k, nowIso)
    expect(sealed.nonce_hex).toMatch(/^[a-f0-9]{24}$/)
    expect(sealed.ciphertext_hex).toMatch(/^[a-f0-9]+$/)
    expect(sealed.token_sha256_hex).toMatch(/^[a-f0-9]{64}$/)
    expect(JSON.stringify(sealed)).not.toContain(token)
    expect(JSON.stringify(sealed)).not.toContain('mechanic@example.com')
    const opened = await openInviteEnvelope(sealed, k, {
      workshopId, recipientEmail: 'mechanic@example.com',
      expiresAt, token_sha256_hex: sealed.token_sha256_hex
    }, nowIso)
    expect(opened).toEqual({
      workshopId, recipientEmail: 'mechanic@example.com', expiresAt, token
    })
  })
  it('nonce único incluso para el mismo token/taller (previene cifrado determinista)', async () => {
    const token = 'a'.repeat(64)
    const k = key()
    const first = await sealInviteEnvelope(fixture(token), k, nowIso)
    const second = await sealInviteEnvelope(fixture(token), k, nowIso)
    expect(first.nonce_hex).not.toBe(second.nonce_hex)
    expect(first.ciphertext_hex).not.toBe(second.ciphertext_hex)
    expect(first.token_sha256_hex).toBe(second.token_sha256_hex)
  })
  it('rechaza claves equivocadas, talleres ajenos, destinatarios alterados y texto cifrado manipulado', async () => {
    const token = (await createMechanicInviteToken()).token
    const secret = key()
    const sealed = await sealInviteEnvelope(fixture(token), secret, nowIso)
    const expected = {
      workshopId, recipientEmail: 'mechanic@example.com',
      expiresAt, token_sha256_hex: sealed.token_sha256_hex
    }
    for (const [envelope, rawKey, context] of [
      [sealed, key(), expected],
      [sealed, secret, { ...expected, workshopId: otherWorkshop }],
      [sealed, secret, { ...expected, recipientEmail: 'attacker@example.com' }],
      [sealed, secret, { ...expected, token_sha256_hex: 'b'.repeat(64) }],
      [{ ...sealed, ciphertext_hex: (sealed.ciphertext_hex[0] === '0' ? '1' : '0') + sealed.ciphertext_hex.slice(1) }, secret, expected],
      [{ ...sealed, nonce_hex: 'x'.repeat(24) }, secret, expected]
    ] as const) {
      await expect(openInviteEnvelope(envelope, rawKey, context, nowIso))
        .rejects.toThrow('could not be verified')
    }
  })
  it('rechaza token expirado incluso si el destinatario tiene enlace antiguo', async () => {
    const token = (await createMechanicInviteToken()).token
    const k = key()
    const sealed = await sealInviteEnvelope(fixture(token), k, nowIso)
    await expect(openInviteEnvelope(sealed, k, {
      workshopId, recipientEmail: 'mechanic@example.com',
      expiresAt, token_sha256_hex: sealed.token_sha256_hex
    }, '2026-11-15T21:00:00Z')).rejects.toThrow('could not be verified')
  })
  it('rechaza claves no AES-256, payload desalineado y vencimiento excesivo', async () => {
    const token = (await createMechanicInviteToken()).token
    await expect(sealInviteEnvelope(fixture(token),new Uint8Array(16),nowIso))
      .rejects.toThrow('key')
    await expect(sealInviteEnvelope({ ...fixture(token), expiresAt: '2026-11-17T22:00:00Z' },
      key(),nowIso)).rejects.toThrow('payload')
    await expect(sealInviteEnvelope({ ...fixture(token), workshopId: 'not-uuid' },
      key(),nowIso)).rejects.toThrow('payload')
  })
})
