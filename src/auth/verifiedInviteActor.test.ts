import { describe, expect, it, vi } from 'vitest'
import {
  INVITE_AUTH_ORIGIN, verifyInviteActor
} from '../../supabase/functions/_shared/verifiedInviteActor'

const bearer = 'Bearer header.payload.signature'
const url = INVITE_AUTH_ORIGIN
const publicKey = 'sb_publishable_mock_test'
const id = '33333333-3333-4333-8333-333333333333'
const user = {
  id, email: '  MECHANIC@EXAMPLE.COM  ',
  email_confirmed_at: '2026-11-14T12:00:00Z',
  is_anonymous: false
}
const mockAuth = (body: unknown, status = 200) => vi.fn(async () =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
)
const check = (fetcher: typeof fetch, authorization: string | null = bearer) =>
  verifyInviteActor(authorization, { baseUrl: url, publicKey }, fetcher)

describe('BT-AUTH-R2-A4 · identidad validada por Supabase Auth, HTTP simulado', () => {
  it('usa GET /auth/v1/user con origen fijado, no expone la clave ni el JWT', async () => {
    const fetcher = mockAuth(user)
    const result = await check(fetcher)
    expect(result).toEqual({ ok: true, actor: { userId: id, confirmedEmail: 'mechanic@example.com' } })
    expect(fetcher).toHaveBeenCalledOnce()
    const [requestUrl, options] = fetcher.mock.calls[0] as unknown as [string, RequestInit]
    expect(requestUrl).toBe(url + '/auth/v1/user')
    expect(options.method).toBe('GET')
    expect(options.cache).toBe('no-store')
    expect(options.redirect).toBe('error')
    expect(options.headers).toMatchObject({ apikey: publicKey, authorization: bearer })
    expect(JSON.stringify(result)).not.toContain(publicKey)
    expect(JSON.stringify(result)).not.toContain(bearer)
  })
  it.each([401, 403, 404])('rechaza JWT sin sesión verificada (HTTP %s)', async status => {
    const fetcher = mockAuth({ message: 'private auth failure' }, status)
    expect(await check(fetcher)).toEqual({
      ok: false, status: 401, message: 'Sesión inválida o vencida.'
    })
  })
  it.each([429, 500])('falla cerrado sin hacer pública la respuesta Auth (%s)', async status => {
    const fetcher = mockAuth({ error: 'sensitive auth detail' }, status)
    const result = await check(fetcher)
    expect(result).toMatchObject({ ok: false, status: 503 })
    expect(JSON.stringify(result)).not.toContain('sensitive')
  })
  it.each([
    { ...user, email_confirmed_at: null },
    { ...user, email_confirmed_at: 'no-es-fecha' },
    { ...user, is_anonymous: true },
    { ...user, email: '' },
    { ...user, email: 'not-email' }
  ])('impide actor no verificado o anónimo (%#)', async payload => {
    expect(await check(mockAuth(payload))).toMatchObject({ ok: false, status: 403 })
  })
  it.each([{ id: 'otro' }, [], null, {}, { id, email: user.email }])(
    'no acepta respuesta Auth inválida o incompleta (%#)', async payload => {
      const result = await check(mockAuth(payload))
      expect(result.ok).toBe(false)
    }
  )
  it('no permite cambiar el host ni consultar ante configuración incorrecta', async () => {
    const fetcher = mockAuth(user)
    expect(await verifyInviteActor(bearer, {
      baseUrl: 'https://attacker.example', publicKey
    }, fetcher)).toMatchObject({ ok: false, status: 503 })
    expect(await verifyInviteActor(bearer, {
      baseUrl: url, publicKey: ''
    }, fetcher)).toMatchObject({ ok: false, status: 503 })
    expect(fetcher).not.toHaveBeenCalled()
  })
  it.each([null, '', 'Bearer', 'Bearer short', 'Basic secret'])(
    'rechaza Authorization malformado sin llamar al servidor (%s)', async authorization => {
      const fetcher = mockAuth(user)
      expect(await check(fetcher, authorization)).toMatchObject({ ok: false, status: 401 })
      expect(fetcher).not.toHaveBeenCalled()
    }
  )
  it('desconexión y timeout responden sin filtrar datos ni elevar permisos', async () => {
    const fetcher: typeof fetch = async () => { throw new Error('token secret leaked?') }
    expect(await check(fetcher)).toEqual({
      ok: false, status: 503, message: 'No se pudo verificar la sesión.'
    })
  })
  it('ignora completamente claims de rol y plan alterados por el usuario', async () => {
    const fetcher = mockAuth({
      ...user, user_metadata: { role: 'owner', plan: 'full', workshop_id: 'foreign' },
      raw_user_meta_data: { role: 'admin', is_admin: true }
    })
    const result = await check(fetcher)
    expect(result).toEqual({
      ok: true, actor: { userId: id, confirmedEmail: 'mechanic@example.com' }
    })
    expect(JSON.stringify(result)).not.toContain('admin')
    expect(JSON.stringify(result)).not.toContain('full')
  })
})
