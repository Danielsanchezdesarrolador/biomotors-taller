import { describe, expect, it } from 'vitest'
import { buildResendInviteRequest, classifyResendReply } from '../../supabase/functions/_shared/resendInviteCandidate'
import type { ImmutableDeliveryRequest } from '../../supabase/functions/_shared/inviteDeliveryAdapter'
import { serializeResendInviteWireV1 } from '../../supabase/functions/_shared/resendInviteWireV1'

const id = '12121212-1212-4121-8121-121212121212'
const fields = {
  from: 'invitaciones@bytetorque.example',
  to: 'mechanic@example.com',
  subject: 'Invitación a ByteTorque',
  text: 'Invitación mecánico para acceder a un taller (token sintético).',
  html: '<p>Invitación a ByteTorque</p>'
}
const content: ImmutableDeliveryRequest = {
  ...fields,
  wireBody: serializeResendInviteWireV1(fields),
  idempotencyKey: 'bt-r2-invite:' + id
}
const cfg = { apiKey: 're_EXAMPLE_FAKE_API_KEY_NOT_VALID', fromEmail: 'invitaciones@bytetorque.example' }

describe('BT-AUTH-R2-A6-P · Resend candidato sin peticiones HTTP', () => {
  it('construye POST /emails con 1 destinatario, remitente configurado e idempotencia estable', () => {
    const r = buildResendInviteRequest(content, cfg)
    expect(r.url).toBe('https://api.resend.com/emails')
    expect(r.method).toBe('POST')
    expect(r.headers['Idempotency-Key']).toBe('bt-r2-invite:' + id)
    expect(r.headers.Authorization).toBe('Bearer ' + cfg.apiKey)
    expect(r.headers['Content-Type']).toBe('application/json')
    expect(JSON.parse(r.body)).toEqual({
      from: cfg.fromEmail, to: [content.to], subject: content.subject,
      text: content.text, html: content.html
    })
    expect(buildResendInviteRequest(content,cfg)).toEqual(r)
    expect(r.url).not.toContain('example.com')
  })
  it.each([
    { ...content, idempotencyKey: 'welcome-'+id },
    { ...content, idempotencyKey: 'bt-r2-invite:INVALID' },
    { ...content, idempotencyKey: content.idempotencyKey.toUpperCase() },
    { ...content, subject: 'Hola\nBcc: atacante@example.com' },
    { ...content, to: 'a@example.com,b@example.com' },
    { ...content, to: 'attacker\r\nCc: victim@example.com' },
    { ...content, from: 'other@bytetorque.example' },
    { ...content, wireBody: content.wireBody + ' ' },
    { ...content, wireBody: '{"from":"attacker@example.com"}' },
    { ...content, html: '' },
    { ...content, text: '' }
  ])('rechaza intento de alterar key, destinatario o cabeceras %#', invalid => {
    expect(() => buildResendInviteRequest(invalid,cfg)).toThrow('Invalid')
  })
  it('rechaza clave insegura, dirección de remitente inesperada y múltiples remitentes', () => {
    expect(() => buildResendInviteRequest(content,{...cfg,apiKey:''})).toThrow()
    expect(() => buildResendInviteRequest(content,{...cfg,apiKey:'sb_secret_abc123'})).toThrow()
    expect(() => buildResendInviteRequest(content,{...cfg,fromEmail:'a@example.com,b@example.com'})).toThrow()
  })
  it('reconoce ID aceptado, sin equiparar aceptación con entrega real', () => {
    expect(classifyResendReply(200,{id})).toEqual({accepted:true,providerMessageId:id})
    expect(classifyResendReply(201,{id:id.toUpperCase()})).toEqual({
      accepted:true,providerMessageId:id
    })
    expect(classifyResendReply(200,{sent:true})).toEqual({
      accepted:false,retryable:true
    })
  })
  it('409 concurrente se puede reintentar, 409 con payload distinto es definitivo', () => {
    expect(classifyResendReply(409,{name:'concurrent_idempotent_requests'}))
      .toEqual({accepted:false,retryable:true})
    expect(classifyResendReply(409,{name:'invalid_idempotent_request'}))
      .toEqual({accepted:false,retryable:false})
    expect(classifyResendReply(409,{error:'unknown'}))
      .toEqual({accepted:false,retryable:true})
  })
  it.each([0,408,429,500,502,503])('acepta reintento transitorio HTTP %s',status => {
    expect(classifyResendReply(status,{message:'sensitive internal failure'}))
      .toEqual({accepted:false,retryable:true})
  })
  it.each([400,401,403,404,422])('clasifica errores permanentes HTTP %s',status => {
    expect(classifyResendReply(status,{message:'sensitive account detail'}))
      .toEqual({accepted:false,retryable:false})
  })
  it('nunca incluye secretos del proveedor en una respuesta controlada', () => {
    const obj = classifyResendReply(502,{message:'secret',token:'secret'})
    expect(JSON.stringify(obj)).not.toContain('secret')
  })
})
