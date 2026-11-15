import { createHash } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import {
  acceptMechanicInviteCandidate, type AcceptMechanicInviteArgs
} from '../../supabase/functions/_shared/mechanicInviteAcceptCandidate'
import type { VerifiedInviteActor } from '../../supabase/functions/_shared/verifiedInviteActor'

const rawToken = 'ab'.repeat(32)
const digest = createHash('sha256').update(Buffer.from(rawToken, 'hex')).digest('hex')
const actor: VerifiedInviteActor = {
  userId:'66666666-6666-4666-8666-666666666666',
  confirmedEmail:'mechanic@example.com'
}
const req = { token:rawToken }
function fixture() {
  const accept=vi.fn(async (_args:AcceptMechanicInviteArgs): Promise<boolean>=>true)
  return { accept, deps:{accept} }
}

describe('BT-AUTH-R2-A6-6 · aceptación segura backend, RPC inyectada',()=>{
  it('solo entrega a SQL el SHA-256 de bytes y la identidad confirmada por Auth',async()=>{
    const f=fixture()
    const result=await acceptMechanicInviteCandidate(req,actor,f.deps)
    expect(result).toEqual({status:'accepted'})
    expect(f.accept).toHaveBeenCalledExactlyOnceWith({
      p_verified_user_id:actor.userId,p_verified_email:actor.confirmedEmail,
      p_token_sha256_hex:digest
    })
    const sent=JSON.stringify(f.accept.mock.calls[0])
    expect(sent).not.toContain(rawToken)
    expect(sent).not.toContain('role')
    expect(sent).not.toContain('workshop_id')
    expect(sent).not.toContain('jwt')
    expect(JSON.stringify(result)).not.toContain(actor.confirmedEmail)
  })
  it('rechaza privilegios, correo, usuario o tenant enviados en payload',async()=>{
    for(const extra of [
      {role:'owner'},{plan:'full'},{workshop_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'},
      {email:actor.confirmedEmail},{user_id:actor.userId},{actor_id:actor.userId},
      {confirmedEmail:actor.confirmedEmail},{p_verified_user_id:actor.userId}
    ]){
      const f=fixture()
      expect(await acceptMechanicInviteCandidate({...req,...extra},actor,f.deps))
        .toEqual({status:'denied'})
      expect(f.accept).not.toHaveBeenCalled()
    }
  })
  it('rechaza token ausente, corto, largo, uppercase y no-hex',async()=>{
    for(const value of [
      null,{},[],{token:''},{token:'ab'},{token:'z'.repeat(64)},
      {token:rawToken.toUpperCase()},{token:'f'.repeat(65)}
    ]){
      const f=fixture()
      expect(await acceptMechanicInviteCandidate(value,actor,f.deps))
        .toEqual({status:'denied'})
      expect(f.accept).not.toHaveBeenCalled()
    }
  })
  it('no escribe con identidad Auth ausente, inválida o correo no normalizado',async()=>{
    for(const identity of [
      null,{...actor,userId:'not-uuid'},{...actor,userId:actor.userId.toUpperCase()},
      {...actor,confirmedEmail:''},{...actor,confirmedEmail:'UNVERIFIED@example.com'},
      {...actor,confirmedEmail:' mech@example.com '},
      {...actor,confirmedEmail:'evil\r\n@example.com'},
      {...actor,confirmedEmail:'invalid'},
    ]){
      const f=fixture()
      expect(await acceptMechanicInviteCandidate(req,identity as VerifiedInviteActor,f.deps))
        .toEqual({status:'denied'})
      expect(f.accept).not.toHaveBeenCalled()
    }
  })
  it('SQL false equivale a denegación genérica y sin exposición de datos',async()=>{
    const f=fixture()
    f.accept.mockResolvedValue(false)
    expect(await acceptMechanicInviteCandidate(req,actor,f.deps))
      .toEqual({status:'denied'})
    expect(f.accept).toHaveBeenCalledOnce()
  })
  it('RPC caída después de posible commit: estado incierto y SIN reintentar',async()=>{
    const f=fixture()
    f.accept.mockRejectedValue(new Error('SQL secrets: private token and email'))
    const out=await acceptMechanicInviteCandidate(req,actor,f.deps)
    expect(out).toEqual({status:'unknown'})
    expect(JSON.stringify(out)).not.toMatch(/email|token|SQL|secrets/i)
    expect(f.accept).toHaveBeenCalledOnce()
  })
  it('respuesta RPC malformada no afirma aceptación',async()=>{
    const f=fixture()
    f.accept.mockResolvedValue('true' as unknown as boolean)
    expect(await acceptMechanicInviteCandidate(req,actor,f.deps))
      .toEqual({status:'unknown'})
  })
})
