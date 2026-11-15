import { describe, expect, it } from 'vitest'
import { serializeResendInviteWireV1, wireMatchesResendInviteV1 } from '../../supabase/functions/_shared/resendInviteWireV1'

const fields = {
  from: 'invitaciones@bytetorque.example',
  to: 'mechanic@example.com',
  subject: 'ByteTorque',
  text: 'Texto sintético',
  html: '<p>Texto sintético</p>'
}

describe('BT-AUTH-R2-A6-P3 · serialización HTTP congelada, sin proveedor', () => {
  it('fija contrato de bytes exactos, orden, campos y un solo destinatario', () => {
    const snapshot = serializeResendInviteWireV1(fields)
    expect(snapshot).toBe('{"from":"invitaciones@bytetorque.example","to":["mechanic@example.com"],"subject":"ByteTorque","text":"Texto sintético","html":"<p>Texto sintético</p>"}')
    expect(wireMatchesResendInviteV1(fields, snapshot)).toBe(true)
    expect(Object.keys(JSON.parse(snapshot))).toEqual(['from','to','subject','text','html'])
  })
  it('cambio de cuerpo u orden del JSON debe FALLAR CERRADO y no enviarse', () => {
    const snapshot = serializeResendInviteWireV1(fields)
    expect(wireMatchesResendInviteV1({...fields, subject:'Cambiado'},snapshot)).toBe(false)
    expect(wireMatchesResendInviteV1(fields, '{"to":["mechanic@example.com"],"from":"invitaciones@bytetorque.example","subject":"ByteTorque","text":"Texto sintético","html":"<p>Texto sintético</p>"}')).toBe(false)
    expect(wireMatchesResendInviteV1(fields,null)).toBe(false)
  })
})
