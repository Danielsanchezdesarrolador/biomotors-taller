import { describe, expect, it } from 'vitest'
import {
  WORKER_NAMED_AUTH,
  dormantAuthenticatedWorkerCandidate,
  rejectInvalidMachineWorkerRequest
} from '../../supabase/functions/bt-invite-worker/serviceAuthPolicy'

function request(init: RequestInit = {}) {
  return new Request('https://supabase.example.invalid/functions/v1/bt-invite-worker', {
    method: 'POST', ...init
  })
}

describe('BT-AUTH-R2-A6-P6 · política M2M, candidata y totalmente cerrada', () => {
  it('solo declara secreto de servicio NOMBRADO; nunca default, wildcard, none o user', () => {
    expect(WORKER_NAMED_AUTH).toBe('secret:bytetorque-worker')
    expect(WORKER_NAMED_AUTH).not.toBe('secret')
    expect(WORKER_NAMED_AUTH).not.toBe('secret:*')
  })
  it('sin cuerpo y POST correcto llega a la barrera 503, jamás dispara un worker', async () => {
    const r = dormantAuthenticatedWorkerCandidate(request())
    expect(r.status).toBe(503)
    expect((await r.json()).error).toContain('no está habilitado')
    expect(r.headers.get('cache-control')).toBe('no-store')
    expect(r.headers.get('access-control-allow-origin')).toBeNull()
  })
  it.each(['GET', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'])(
    'método %s nunca admite claim, lease ni ejecución', method => {
      const r = rejectInvalidMachineWorkerRequest(request({method}))
      expect(r?.status).toBe(405)
    }
  )
  it('bloquea cualquier Origin, incluido el frontend oficial, aunque sea HTTPS', () => {
    for (const origin of [
      'https://biomotors-taller-demo.onrender.com',
      'https://evil.example.com', 'null'
    ]) {
      const r = dormantAuthenticatedWorkerCandidate(
        request({headers:{origin}})
      )
      expect(r.status).toBe(403)
    }
  })
  it('JWT/Authorization y apikey en header equivocado quedan rechazados', () => {
    for (const authorization of [
      'Bearer valid.user.jwt',
      'Bearer sb_secret_fake',
      'Bearer sb_publishable_fake'
    ]) {
      const r = dormantAuthenticatedWorkerCandidate(
        request({headers:{authorization,apikey:'sb_secret_FAKE_TEST_ONLY'}})
      )
      expect(r.status).toBe(403)
    }
  })
  it.each([
    ['{}', 'application/json'],
    ['{"workshop_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"}','application/json'],
    ['{"outbox_id":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"}','application/json'],
    ['test', 'text/plain'],
    ['', 'application/json']
  ])('sin payload (valor %s), incluso stream vacío', (body, contentType) => {
    const r = dormantAuthenticatedWorkerCandidate(
      request({body,headers:{'content-type':contentType}})
    )
    expect(r.status).toBe(413)
  })
  it('rechaza content-length > 0 aunque request.body sea null', () => {
    const r = dormantAuthenticatedWorkerCandidate(
      request({headers:{'content-length':'200'}})
    )
    expect(r.status).toBe(413)
  })
  it('respuesta 503 no expone credenciales, ID de taller ni token', async () => {
    const req=request({headers:{apikey:'sb_secret_SYNTHETIC_ONLY'}})
    const r=dormantAuthenticatedWorkerCandidate(req)
    const body=await r.text()
    expect(r.status).toBe(503)
    expect(body).not.toContain('apikey')
    expect(body).not.toContain('sb_secret_')
    expect(body).not.toContain('workshop_id')
    expect(body).not.toContain('token')
  })
})
