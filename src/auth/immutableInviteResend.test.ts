import { describe, expect, it, vi } from 'vitest'
import { sealImmutableInviteEnvelope, sealInviteEnvelope } from '../../supabase/functions/_shared/encryptedInviteEnvelope'
import { prepareImmutableInviteDelivery, type DeliveryRequest } from '../../supabase/functions/_shared/inviteDeliveryAdapter'
import { createResendHttpCandidate, type InjectedResendHttpResponse } from '../../supabase/functions/_shared/resendInviteTransportCandidate'
import { buildResendInviteRequest } from '../../supabase/functions/_shared/resendInviteCandidate'
import { processOneInvitationEmail, type LeasedInvitationEmail, type TrustedWorkshop } from '../../supabase/functions/_shared/invitationEmailWorker'

const workshop = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const other = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const outbox = 'abababab-abab-4bab-8bab-abababababab'
const invite = 'cdcdcdcd-cdcd-4dcd-8dcd-cdcdcdcdcdcd'
const lease = 'edededed-eded-4ded-8ded-edededededed'
const now = '2026-11-14T18:00:00Z'
const later = '2026-11-14T21:00:00Z'
const expires = '2026-11-15T18:00:00Z'
const token = 'a'.repeat(64) // Synthetic only; never a real invitation.
const config = {
  apiKey: 're_SYNTHETIC_ONLY_NOT_A_REAL_KEY_123456',
  fromEmail: 'invitaciones@bytetorque.example'
}
const providerId = '11111111-1111-4111-8111-111111111111'
const response = (status: number, body: unknown): InjectedResendHttpResponse => ({
  status, json: async () => body
})

async function fixture() {
  const key = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(32)))
  const envelope = await sealImmutableInviteEnvelope({
    workshopId: workshop, recipientEmail: 'mechanic@example.com',
    workshopName: 'Taller original', fromEmail: config.fromEmail,
    token, expiresAt: expires
  }, key, now)
  const job: LeasedInvitationEmail = {
    ...envelope, workshop_id: workshop, recipient_email: 'mechanic@example.com',
    expires_at: expires, outbox_id: outbox, invitation_id: invite,
    lease_id: lease, attempt_number: 1
  }
  const mail = await prepareImmutableInviteDelivery(job, key, now)
  return { key, envelope, job, mail }
}

describe('BT-AUTH-R2-A6-P2 · sobre inmutable y HTTP exclusivamente simulado', () => {
  it('cifra sender/to/subject/text/html/token sin texto claro y reusa exactamente los bytes', async () => {
    const { job, key, envelope, mail } = await fixture()
    const ciphertext = JSON.stringify(envelope)
    for (const secret of [token, 'mechanic@example.com', config.fromEmail, 'Taller original'])
      expect(ciphertext).not.toContain(secret)
    expect(envelope.ciphertext_hex.length / 2).toBeLessThanOrEqual(8192)
    expect(mail.from).toBe(config.fromEmail)
    expect(mail.to).toBe('mechanic@example.com')
    expect(mail.subject).toContain('Taller original')
    expect(mail.text).toContain(token)
    expect(mail.html).toContain(token)
    const retry = await prepareImmutableInviteDelivery(job, key, later)
    expect(retry).toEqual(mail)
    // PostgreSQL timestamptz may serialize the exact same instant using +00:00.
    const postgresTimestamp = { ...job, expires_at: '2026-11-15T18:00:00+00:00' }
    expect(await prepareImmutableInviteDelivery(postgresTimestamp, key, now)).toEqual(mail)
    const changedInstant = { ...job, expires_at: '2026-11-15T18:00:01+00:00' }
    await expect(prepareImmutableInviteDelivery(changedInstant, key, now))
      .rejects.toThrow('could not be verified')
    const firstHttp = buildResendInviteRequest(mail, config)
    const retryHttp = buildResendInviteRequest(retry, config)
    expect(mail.wireBody).toBe(firstHttp.body)
    expect(mail.wireBody).toBe(retry.wireBody)
    expect(firstHttp.body).toBe(retryHttp.body)
    expect(firstHttp.headers['Idempotency-Key']).toBe(retryHttp.headers['Idempotency-Key'])
    expect(JSON.parse(firstHttp.body).from).toBe(mail.from)
    expect(() => buildResendInviteRequest({...mail, subject:'Asunto nuevo'}, config)).toThrow()
    expect(() => buildResendInviteRequest({...mail, wireBody: mail.wireBody.replace('from', 'sender')}, config)).toThrow()
  })
  it('rechaza v1 en el worker y cualquier corrupción o cruce de taller', async () => {
    const { job, key } = await fixture()
    for (const bad of [
      { ...job, workshop_id: other },
      { ...job, recipient_email: 'wrong@example.com' },
      { ...job, token_sha256_hex: 'b'.repeat(64) },
      { ...job, ciphertext_hex: '00' + job.ciphertext_hex.slice(2) }
    ]) {
      await expect(prepareImmutableInviteDelivery(bad, key, now))
        .rejects.toThrow('could not be verified')
    }
    const legacy = await sealInviteEnvelope({
      workshopId: workshop, recipientEmail: 'mechanic@example.com', token,
      expiresAt: expires
    }, key, now)
    await expect(prepareImmutableInviteDelivery({...job, ...legacy}, key, now))
      .rejects.toThrow('could not be verified')
    await expect(prepareImmutableInviteDelivery(job, key, '2026-11-15T19:00:00Z'))
      .rejects.toThrow('could not be verified')
  })
  it('rechaza remitente no autorizado sin sustituirlo ni enviar nada', async () => {
    const { mail } = await fixture()
    const http = vi.fn(async () => response(200, { id: providerId }))
    const adapter = createResendHttpCandidate({
      ...config, fromEmail: 'nuevo@bytetorque.example'
    }, http)
    expect(await adapter(mail)).toEqual({ accepted: false, retryable: false })
    expect(http).not.toHaveBeenCalled()
  })
  it('HTTP 200 confirma aceptación del proveedor, nunca recepción en buzón', async () => {
    const { mail } = await fixture()
    const http = vi.fn(async () => response(200, { id: providerId }))
    const adapter = createResendHttpCandidate(config, http)
    expect(await adapter(mail)).toEqual({ accepted: true, providerMessageId: providerId })
    expect(http).toHaveBeenCalledOnce()
    expect(http.mock.calls[0]).toHaveLength(2)
  })
  it.each([
    [409, {name:'concurrent_idempotent_requests'}, true],
    [409, {name:'invalid_idempotent_request'}, false],
    [409, {name:'unknown'}, true],
    [429, {message:'rate limit'}, true],
    [500, {message:'upstream'}, true],
    [502, {message:'gateway'}, true],
    [503, {message:'maintenance'}, true],
    [422, {message:'invalid'}, false]
  ] as const)('HTTP %s con clasificación retry=%s (sin correo)', async (status, body, retryable) => {
    const { mail } = await fixture()
    const adapter = createResendHttpCandidate(config, async () => response(status, body))
    expect(await adapter(mail)).toEqual({ accepted: false, retryable })
  })
  it('excepción de conexión y JSON ilegible se resuelven sin exponer secretos', async () => {
    const { mail } = await fixture()
    const network = createResendHttpCandidate(config, async () => {
      throw new Error('NETWORK: '+token+' private address')
    })
    expect(await network(mail)).toEqual({ accepted: false, retryable: true })
    const invalidJson = createResendHttpCandidate(config, async () => ({
      status: 200, json: async () => { throw new Error('invalid JSON') }
    }))
    expect(await invalidJson(mail)).toEqual({ accepted: false, retryable: true })
  })
  it('timeout aborta: respuesta tardía no se interpreta como ack confirmado', async () => {
    const { mail } = await fixture()
    let finish!: (value: InjectedResendHttpResponse) => void
    let signaled: AbortSignal | undefined
    const http = (_req: unknown, signal: AbortSignal) => {
      signaled = signal
      return new Promise<InjectedResendHttpResponse>(resolve => { finish = resolve })
    }
    const adapter = createResendHttpCandidate(config, http, 5)
    const result = await adapter(mail)
    expect(result).toEqual({ accepted: false, retryable: true })
    expect(signaled?.aborted).toBe(true)
    finish(response(200, { id: providerId }))
    await Promise.resolve()
    expect(result).toEqual({ accepted: false, retryable: true })
  })
  it('worker con nuevo nombre de taller preserva body/key después de ack fallido', async () => {
    const { job, key } = await fixture()
    const seen: Array<{ body: string; key: string }> = []
    const http = vi.fn(async (req: { body: string; headers: { 'Idempotency-Key': string } }) => {
      seen.push({body:req.body, key:req.headers['Idempotency-Key']})
      return response(200, { id: providerId }) // simulated provider dedupes same key
    })
    const provider = createResendHttpCandidate(config, http)
    const getWorkshop = vi.fn<() => Promise<TrustedWorkshop>>()
      .mockResolvedValueOnce({ id: workshop, name: 'Taller original', status: 'active' })
      .mockResolvedValueOnce({ id: workshop, name: 'Taller RENOMBRADO', status: 'active' })
    const ack = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true)
    const deps = {
      claim: vi.fn(async () => job),
      getWorkshop, leaseIsCurrent: vi.fn(async () => true), ack,
      fail: vi.fn(async () => 'retry' as const), provider, encryptionKey: key,
      nowIso: vi.fn().mockReturnValueOnce(now).mockReturnValueOnce(later)
    }
    expect(await processOneInvitationEmail(deps)).toEqual({status:'ack-unknown'})
    expect(await processOneInvitationEmail(deps)).toEqual({status:'provider-accepted'})
    expect(ack).toHaveBeenCalledTimes(2)
    expect(deps.fail).not.toHaveBeenCalled()
    expect(seen).toHaveLength(2)
    expect(seen[1]).toEqual(seen[0])
    expect(seen[0]?.body).toContain('Taller original')
    expect(seen[0]?.body).not.toContain('RENOMBRADO')
  })
  it('revocación detectada en lease impide cualquier HTTP externo', async () => {
    const { job, key } = await fixture()
    const provider = vi.fn(async (_request: DeliveryRequest) => ({
      accepted:true as const, providerMessageId:providerId
    }))
    const result = await processOneInvitationEmail({
      claim: async () => job,
      getWorkshop: async () => ({ id:workshop, name:'Taller original', status:'active' }),
      leaseIsCurrent: async () => false,
      ack: async () => true,
      fail: async () => 'retry',
      provider, encryptionKey:key, nowIso: () => now
    })
    expect(result).toEqual({status:'stale'})
    expect(provider).not.toHaveBeenCalled()
  })
})
