import { describe, expect, it, vi } from 'vitest'
import { createMechanicInviteToken } from '../../supabase/functions/_shared/mechanicInviteToken'
import { sealImmutableInviteEnvelope } from '../../supabase/functions/_shared/encryptedInviteEnvelope'
import {
  processOneInvitationEmail,
  type LeasedInvitationEmail,
  type TrustedWorkshop
} from '../../supabase/functions/_shared/invitationEmailWorker'
import type { DeliveryRequest } from '../../supabase/functions/_shared/inviteDeliveryAdapter'

const nowIso = '2026-11-14T18:00:00Z'
const expiresAt = '2026-11-15T18:00:00Z'
const workshop_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const outbox_id = 'abababab-abab-4bab-8bab-abababababab'
const lease_id = 'edededed-eded-4ded-8ded-edededededed'
const invitation_id = 'cdcdcdcd-cdcd-4dcd-8dcd-cdcdcdcdcdcd'

async function fixture() {
  const encryptionKey = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(32)))
  const { token } = await createMechanicInviteToken()
  const sealed = await sealImmutableInviteEnvelope({
    workshopId: workshop_id, workshopName: 'Taller de Prueba',
    fromEmail: 'invitaciones@bytetorque.example',
    recipientEmail: 'mechanic@example.com',token,expiresAt
  },encryptionKey,nowIso)
  const job: LeasedInvitationEmail = {
    outbox_id, invitation_id, lease_id, workshop_id,
    recipient_email: 'mechanic@example.com',
    expires_at: expiresAt, attempt_number: 1, ...sealed
  }
  const calls = {
    claim: vi.fn(async (): Promise<LeasedInvitationEmail | null> => job),
    getWorkshop: vi.fn(async (): Promise<TrustedWorkshop | null> => ({ id: workshop_id, name: 'Taller de Prueba', status: 'active' })),
    leaseIsCurrent: vi.fn(async () => true),
    provider: vi.fn(async (_msg: DeliveryRequest) => ({accepted:true as const, providerMessageId:'provider-1'})),
    ack: vi.fn(async () => true),
    fail: vi.fn(async (_job: LeasedInvitationEmail,_terminal:boolean): Promise<'retry' | 'failed' | 'ignored'> => 'retry'),
    nowIso: () => nowIso,
    encryptionKey
  }
  return { calls, token, job }
}
describe('BT-AUTH-R2-A6-W · worker sin SMTP/Supabase real', () => {
  it('procesa un job una sola vez y reconoce recepción del proveedor (no entrega al buzón)', async () => {
    const {calls,token,job} = await fixture()
    expect(await processOneInvitationEmail(calls)).toEqual({status:'provider-accepted'})
    expect(calls.leaseIsCurrent).toHaveBeenCalledWith(job)
    expect(calls.provider).toHaveBeenCalledOnce()
    const request = calls.provider.mock.calls[0]![0]
    expect(request.idempotencyKey).toBe('bt-r2-invite:'+outbox_id)
    expect(request.text).toContain(token)
    expect(calls.ack).toHaveBeenCalledWith(job,'provider-1')
    expect(calls.fail).not.toHaveBeenCalled()
  })
  it('no llama proveedor ni lee datos si cola está vacía', async () => {
    const {calls} = await fixture()
    calls.claim.mockResolvedValueOnce(null)
    expect(await processOneInvitationEmail(calls)).toEqual({status:'idle'})
    expect(calls.getWorkshop).not.toHaveBeenCalled()
    expect(calls.provider).not.toHaveBeenCalled()
  })
  it('rechaza acceso cruzado, taller suspendido y nombre insuficiente antes de enviar', async () => {
    for (const workshop of [
      {id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',name:'Taller B',status:'active' as const},
      {id:workshop_id,name:'Taller A',status:'suspended' as const},
      {id:workshop_id,name:'',status:'active' as const}
    ]) {
      const {calls} = await fixture()
      calls.getWorkshop.mockResolvedValue(workshop)
      calls.fail.mockResolvedValue('failed')
      expect(await processOneInvitationEmail(calls)).toEqual({status:'failed'})
      expect(calls.fail).toHaveBeenCalledOnce()
      expect(calls.fail.mock.calls[0]![1]).toBe(true)
      expect(calls.provider).not.toHaveBeenCalled()
    }
  })
  it('no envía si el lease fue revocado/expiró entre claim y transporte', async () => {
    const {calls} = await fixture()
    calls.leaseIsCurrent.mockResolvedValueOnce(false)
    expect(await processOneInvitationEmail(calls)).toEqual({status:'stale'})
    expect(calls.provider).not.toHaveBeenCalled()
    expect(calls.ack).not.toHaveBeenCalled()
  })
  it('diferencia rechazo permanente del proveedor y fallo transitorio', async () => {
    for (const [retryable, expectedStatus, terminal] of [
      [true,'retry',false], [false,'failed',true]
    ] as const) {
      const {calls} = await fixture()
      calls.provider.mockResolvedValue({accepted:false,retryable} as never)
      calls.fail.mockResolvedValue(terminal ? 'failed' : 'retry')
      expect(await processOneInvitationEmail(calls)).toEqual({status:expectedStatus})
      expect(calls.fail.mock.calls[0]![1]).toBe(terminal)
      expect(calls.ack).not.toHaveBeenCalled()
    }
  })
  it('si proveedor acepta pero ack falla retorna estado indeterminado SIN marcar fallo ni reenviar', async () => {
    const {calls,token} = await fixture()
    calls.ack.mockRejectedValueOnce(new Error('connection failure: secret '+token))
    const result = await processOneInvitationEmail(calls)
    expect(result).toEqual({status:'ack-unknown'})
    expect(calls.provider).toHaveBeenCalledOnce()
    expect(calls.fail).not.toHaveBeenCalled()
    expect(JSON.stringify(result)).not.toContain(token)
  })
  it('si el provider devuelve id inválido no anuncia éxito', async () => {
    const {calls} = await fixture()
    calls.provider.mockResolvedValue({accepted:true,providerMessageId:''})
    expect(await processOneInvitationEmail(calls)).toEqual({status:'retry'})
    expect(calls.ack).not.toHaveBeenCalled()
    expect(calls.fail.mock.calls[0]![1]).toBe(false)
  })
  it('captura fallas al consultar taller y no expone texto de error', async () => {
    const {calls,token} = await fixture()
    calls.getWorkshop.mockRejectedValueOnce(new Error(token))
    expect(await processOneInvitationEmail(calls)).toEqual({status:'retry'})
    expect(calls.provider).not.toHaveBeenCalled()
  })
  it('lease-id inválido nunca autoriza un envío', async () => {
    const {calls,job} = await fixture()
    calls.claim.mockResolvedValueOnce({...job,lease_id:'invalid'})
    expect(await processOneInvitationEmail(calls)).toEqual({status:'stale'})
    expect(calls.provider).not.toHaveBeenCalled()
  })
  it('reintento después de provider-accepted con idempotency key estable', async () => {
    const {calls} = await fixture()
    calls.ack.mockResolvedValue(false)
    expect(await processOneInvitationEmail(calls)).toEqual({status:'ack-unknown'})
    expect(await processOneInvitationEmail(calls)).toEqual({status:'ack-unknown'})
    const keys = calls.provider.mock.calls.map(args=>args[0].idempotencyKey)
    expect(keys).toEqual(['bt-r2-invite:'+outbox_id,'bt-r2-invite:'+outbox_id])
    // This is only a mock: actual provider idempotency must be verified.
  })
})
