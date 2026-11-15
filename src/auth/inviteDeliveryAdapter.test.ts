import { describe, expect, it, vi } from 'vitest'
import { sealInviteEnvelope } from '../../supabase/functions/_shared/encryptedInviteEnvelope'
import { createMechanicInviteToken } from '../../supabase/functions/_shared/mechanicInviteToken'
import {
  dispatchPreparedInvite, prepareInviteDelivery, type ClaimedInvitationEmail, type DeliveryRequest
} from '../../supabase/functions/_shared/inviteDeliveryAdapter'

const nowIso = '2026-11-14T18:00:00Z'
const expiresAt = '2026-11-15T18:00:00Z'
const workshop_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const outbox_id = '12121212-1212-4121-8121-121212121212'
async function createJob() {
  const secret = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(32)))
  const { token } = await createMechanicInviteToken()
  const sealed = await sealInviteEnvelope({
    workshopId: workshop_id, recipientEmail: 'Mechanic@Example.com',
    token, expiresAt
  },secret,nowIso)
  const job: ClaimedInvitationEmail = {
    outbox_id, workshop_id, recipient_email: 'mechanic@example.com',
    expires_at: expiresAt, ...sealed
  }
  return { job, secret, token }
}
describe('BT-AUTH-R2-A6 · proveedor desacoplado, SIN correo real', () => {
  it('verifica contexto antes de preparar envío e idempotency key estable', async () => {
    const {job,secret,token} = await createJob()
    const first = await prepareInviteDelivery(job,secret,'Taller A',nowIso)
    const second = await prepareInviteDelivery(job,secret,'Taller A',nowIso)
    expect(first).toEqual(second)
    expect(first.to).toBe('mechanic@example.com')
    expect(first.idempotencyKey).toBe('bt-r2-invite:'+outbox_id)
    expect(first.text).toContain(token)
    expect(first.html).toContain('Taller A')
    expect(first.subject).toContain('ByteTorque')
  })
  it('simula aceptación del proveedor sin afirmar recepción en buzón', async () => {
    const {job,secret} = await createJob()
    const provider = vi.fn(async (_request: DeliveryRequest) => ({ accepted: true as const, providerMessageId:'provider-accepted-1' }))
    expect(await dispatchPreparedInvite(job,secret,'Taller A',nowIso,provider))
      .toEqual({state:'accepted',providerMessageId:'provider-accepted-1'})
    expect(provider).toHaveBeenCalledTimes(1)
    expect(provider.mock.calls[0][0].idempotencyKey).toBe('bt-r2-invite:'+outbox_id)
  })
  it('rechaza taller y destinatario discordantes ANTES de llamar al proveedor', async () => {
    const {job,secret,token} = await createJob()
    const sender = vi.fn(async () => ({accepted:true as const,providerMessageId:'accepted'}))
    for (const invalid of [
      {...job,workshop_id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'},
      {...job,recipient_email:'other@example.com'},
      {...job,token_sha256_hex:'f'.repeat(64)}
    ]) {
      expect(await dispatchPreparedInvite(invalid,secret,'Taller A',nowIso,sender))
        .toEqual({state:'retry'})
    }
    expect(sender).not.toHaveBeenCalled()
    expect(JSON.stringify(await dispatchPreparedInvite({...job,recipient_email:'wrong@example.com'},
      secret,'Taller A',nowIso,sender))).not.toContain(token)
  })
  it('distingue fallo transitorio y permanente sin exponer respuesta SMTP', async () => {
    const {job,secret} = await createJob()
    for (const [response,expected] of [
      [{accepted:false,retryable:true},{state:'retry'}],
      [{accepted:false,retryable:false},{state:'permanent-failure'}],
      [{accepted:true,providerMessageId:''},{state:'retry'}]
    ] as const) {
      const sender = vi.fn(async () => response)
      expect(await dispatchPreparedInvite(job,secret,'Taller A',nowIso,sender))
        .toEqual(expected)
    }
  })
  it('si falla el proveedor jamás retorna secretos o destinatario', async () => {
    const {job,secret,token} = await createJob()
    const sender = async () => {throw new Error('token '+token+' provider secret')}
    const value = await dispatchPreparedInvite(job,secret,'Taller A',nowIso,sender)
    expect(value).toEqual({state:'retry'})
    expect(JSON.stringify(value)).not.toContain(token)
    expect(JSON.stringify(value)).not.toContain('provider secret')
  })
})
