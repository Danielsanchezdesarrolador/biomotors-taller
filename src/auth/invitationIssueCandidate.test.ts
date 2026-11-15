import { describe, expect, it, vi } from 'vitest'
import { issueMechanicInvitationCandidate, type CandidateWorkshop, type ReserveAndQueueArgs } from '../../supabase/functions/_shared/invitationIssueCandidate'
import { openImmutableInviteEnvelope } from '../../supabase/functions/_shared/encryptedInviteEnvelope'
import type { VerifiedInviteActor } from '../../supabase/functions/_shared/verifiedInviteActor'

const workshopId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const otherId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const actor: VerifiedInviteActor = {
  userId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  confirmedEmail: 'owner@example.com'
}
const issueId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
const request = { workshop_id: workshopId, email: ' Mech@Example.COM ' }
const nowIso = '2026-11-15T10:00:00.000Z'
const oneDayLater = '2026-11-16T10:00:00.000Z'
const sender = 'invitaciones@bytetorque.example'

function fixture() {
  const encryptionKey = crypto.getRandomValues(new Uint8Array(32))
  const getWorkshop = vi.fn(async (): Promise<CandidateWorkshop | null> => ({
    id:workshopId, name:'Taller piloto sintético', status:'active'
  }))
  const reserveAndQueue = vi.fn(async (_args: ReserveAndQueueArgs) => issueId)
  return {
    deps: {
      getWorkshop, reserveAndQueue, encryptionKey, authorizedSender: sender,
      nowIso: () => nowIso
    },
    getWorkshop, reserveAndQueue, encryptionKey
  }
}

describe('BT-AUTH-R2-A6-P4 · creador autenticado solamente en laboratorio', () => {
  it('verifica contexto y entrega a una sola RPC un sobre V3 cifrado, jamás token original', async () => {
    const {deps,getWorkshop,reserveAndQueue,encryptionKey} = fixture()
    const result = await issueMechanicInvitationCandidate(request,actor,deps)
    expect(result).toEqual({ status:'queued', invitationId:issueId })
    expect(JSON.stringify(result)).not.toContain('mech@example.com')
    expect(getWorkshop).toHaveBeenCalledExactlyOnceWith(workshopId)
    expect(reserveAndQueue).toHaveBeenCalledOnce()
    const args = reserveAndQueue.mock.calls[0]![0]
    expect(Object.keys(args)).toEqual([
      'p_actor_user_id','p_workshop_id','p_email','p_token_sha256_hex',
      'p_expires_at','p_ciphertext_hex','p_nonce_hex'
    ])
    expect(args.p_actor_user_id).toBe(actor.userId)
    expect(args.p_workshop_id).toBe(workshopId)
    expect(args.p_email).toBe('mech@example.com')
    expect(args.p_expires_at).toBe(oneDayLater)
    expect(args.p_token_sha256_hex).toMatch(/^[a-f0-9]{64}$/)
    expect(args.p_nonce_hex).toMatch(/^[a-f0-9]{24}$/)
    expect(args.p_ciphertext_hex.length / 2).toBeLessThanOrEqual(8192)
    const stored = JSON.stringify(args)
    expect(stored).not.toContain('Taller piloto sintético')
    expect(stored).not.toContain(sender)
    expect(stored).not.toContain('#/auth/aceptar-invitacion')
    const frozen = await openImmutableInviteEnvelope({
      ciphertext_hex:args.p_ciphertext_hex,nonce_hex:args.p_nonce_hex,
      token_sha256_hex:args.p_token_sha256_hex
    },encryptionKey,{
      workshopId,recipientEmail:args.p_email,expiresAt:oneDayLater,
      token_sha256_hex:args.p_token_sha256_hex
    },nowIso)
    expect(frozen.from).toBe(sender)
    expect(frozen.to).toBe('mech@example.com')
    expect(frozen.subject).toContain('Taller piloto sintético')
    expect(frozen.text).toContain('https://biomotors-taller-demo.onrender.com/')
    expect(frozen.wireBody).toContain('Taller piloto sintético')
  })
  it('niega privilegios que intenten entrar desde el navegador y nunca reserva', async () => {
    for (const bad of [
      { ...request, role:'owner' },
      { ...request, actor_user_id: actor.userId },
      { ...request, plan:'full' },
      { ...request, token:'a'.repeat(64) },
      { ...request, fromEmail: sender },
      { ...request, workshopName:'El taller atacante' },
      { workshop_id: 'invalid', email:'mech@example.com' },
      { workshop_id:workshopId,email:'invalid' }
    ]) {
      const {deps,reserveAndQueue,getWorkshop} = fixture()
      expect(await issueMechanicInvitationCandidate(bad,actor,deps))
        .toEqual({status:'denied'})
      expect(reserveAndQueue).not.toHaveBeenCalled()
      expect(getWorkshop).not.toHaveBeenCalled()
    }
  })
  it('no reserva para taller suspendido, ajeno o inexistente', async () => {
    for (const work of [
      {id:workshopId,name:'Taller',status:'suspended' as const},
      {id:otherId,name:'Taller ajeno',status:'active' as const},
      null
    ]) {
      const f = fixture()
      f.getWorkshop.mockResolvedValue(work)
      expect(await issueMechanicInvitationCandidate(request,actor,f.deps))
        .toEqual({status:'denied'})
      expect(f.reserveAndQueue).not.toHaveBeenCalled()
    }
  })
  it('niega identidad ausente, actor inválido y correo no confirmado/sanitizado', async () => {
    for (const badActor of [
      null, {userId:'not-a-uuid',confirmedEmail:'owner@example.com'},
      {userId:actor.userId,confirmedEmail:''},
      {userId:actor.userId,confirmedEmail:'FAKE@example.com'},
      {userId:actor.userId,confirmedEmail:'owner\r\n@example.com'}
    ]) {
      const f=fixture()
      expect(await issueMechanicInvitationCandidate(request,badActor as VerifiedInviteActor,f.deps))
        .toEqual({status:'denied'})
      expect(f.reserveAndQueue).not.toHaveBeenCalled()
      expect(f.getWorkshop).not.toHaveBeenCalled()
    }
  })
  it('preparación de correo inválida, clave de cifrado incorrecta y hora errónea: no SQL', async () => {
    for (const mutator of [
      (f: ReturnType<typeof fixture>) => { f.deps.authorizedSender = 'forged\r\n@example.com' },
      (f: ReturnType<typeof fixture>) => { f.deps.encryptionKey = new Uint8Array(16) },
      (f: ReturnType<typeof fixture>) => { f.deps.nowIso = () => 'not-a-time' },
      (f: ReturnType<typeof fixture>) => { f.getWorkshop.mockResolvedValue({id:workshopId,name:'\r\n',status:'active'}) }
    ]) {
      const f=fixture()
      mutator(f)
      expect(await issueMechanicInvitationCandidate(request,actor,f.deps))
        .toEqual({status:'denied'})
      expect(f.reserveAndQueue).not.toHaveBeenCalled()
    }
  })
  it('error en consulta DB queda indeterminado y no reserva', async () => {
    const f=fixture()
    f.getWorkshop.mockRejectedValue(new Error('sensitive workshop details'))
    expect(await issueMechanicInvitationCandidate(request,actor,f.deps))
      .toEqual({status:'unknown'})
    expect(f.reserveAndQueue).not.toHaveBeenCalled()
  })
  it('caída de conexión tras commit SQL NO provoca reintento automático', async () => {
    const f=fixture()
    f.reserveAndQueue.mockRejectedValue(new Error('connection lost after commit - private data'))
    expect(await issueMechanicInvitationCandidate(request,actor,f.deps))
      .toEqual({status:'unknown'})
    expect(f.reserveAndQueue).toHaveBeenCalledOnce()
  })
  it('respuesta SQL desconocida no anuncia creación aunque la escritura sea ambigua', async () => {
    const f=fixture()
    f.reserveAndQueue.mockResolvedValue('not-a-uuid')
    expect(await issueMechanicInvitationCandidate(request,actor,f.deps))
      .toEqual({status:'unknown'})
    expect(f.reserveAndQueue).toHaveBeenCalledOnce()
  })
  it('SQL sigue siendo autoridad: rechazo por cupo, rol o rate limit no genera envío', async () => {
    const f=fixture()
    f.reserveAndQueue.mockRejectedValue(new Error('Mechanic seat limit reached'))
    expect(await issueMechanicInvitationCandidate(request,actor,f.deps))
      .toEqual({status:'unknown'})
    expect(f.reserveAndQueue).toHaveBeenCalledOnce()
  })
  it('se mantiene secreto ante excepción de cifrado/consultas y responde solo estados', async () => {
    const f=fixture()
    f.getWorkshop.mockRejectedValue(new Error('private jwt email'))
    const out=await issueMechanicInvitationCandidate(request,actor,f.deps)
    expect(JSON.stringify(out)).not.toMatch(/jwt|email|token|cipher|workshop/i)
  })
})
