import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

// Static guardrails only. SQL and Edge runtime must be validated in isolated
// Postgres + functions BEFORE any migration or public activation.
const read = (path: string) => readFileSync(path, 'utf8')
const reserve = read('docs/sql/BT_AUTH_R2_A_INVITATIONS_CANDIDATE.sql')
const accept = read('docs/sql/BT_AUTH_R2_A2_ACCEPT_REVOKE_CANDIDATE.sql')
const edgeIssue = read('supabase/functions/bt-mechanic-invites/index.ts')
const edgeAccept = read('supabase/functions/bt-mechanic-accept/index.ts')
const config = read('supabase/config.toml')

describe('BT-AUTH-R2-A2 · guardarraíles estáticos, NO pruebas de RLS real', () => {
  it('las candidatas SQL nunca usan SECURITY DEFINER y solo conceden RPC a service_role', () => {
    for (const sql of [reserve, accept]) {
      expect(sql).toMatch(/security invoker/i)
      expect(sql).not.toMatch(/security definer(?!.*--)/i)
      expect(sql).toMatch(/to service_role/i)
      expect(sql).toMatch(/from public, anon, authenticated/i)
    }
  })
  it('las mutaciones propuestas serializan por taller con FOR UPDATE', () => {
    for (const sql of [reserve, accept]) {
      expect(sql).toMatch(/for update/i)
      expect(sql).toContain('public.workshop_memberships')
    }
  })
  it('la aceptación exige invitación pendiente y el correo verificado del backend', () => {
    expect(accept).toContain('p_verified_user_id')
    expect(accept).toContain('p_verified_email')
    expect(accept).toContain("i.status = 'pending'")
    expect(accept).toContain('i.expires_at > v_now')
    expect(accept).toContain('i.invited_email = v_email')
    expect(accept).toContain("'mechanic', 'active'")
    expect(accept).toContain('v_mechanics + v_pending > v_limit')
  })
  it('ambos endpoints continuan bloqueados incluso al habilitar el flag', () => {
    expect(edgeIssue).toContain("return response(503, 'La entrega y aceptación seguras aún están en preparación.'")
    expect(edgeAccept).toContain("return json(503, 'El proceso de validación todavía no está habilitado.'")
    expect(config).toContain('[functions.bt-mechanic-invites]\nverify_jwt = true')
    expect(config).toContain('[functions.bt-mechanic-accept]\nverify_jwt = true')
  })
})
