import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { RealAccess } from './RealAccess'
import { AuthController, type Role, type AuthGateway } from './controller'
import { AccessScreens } from '../access/AccessScreens'
function controller(role: Role, memberships = true) {
  const gateway: AuthGateway = {
    hasSession: async () => true,
    getUser: async () => ({ id: 'a', confirmed: true }),
    signIn: async () => {},
    signOut: async () => {},
    subscribe: () => () => {},
    memberships: async () =>
      memberships ? [{ user_id: 'a', workshop_id: 'a', role, status: 'active' }] : [],
    workshops: async () => [{ id: 'a', name: 'Identidad autorizada', status: 'active' }]
  }
  return new AuthController(gateway)
}
const html = (c: AuthController) =>
  renderToStaticMarkup(
    <RealAccess page="login" presentation="administrador" onNavigate={() => {}} controller={c} />
  )
describe('R1 UI boundary · synthetic authorized contexts only', () => {
  it('initial loading cannot flash an official panel', () => {
    expect(html(controller('owner'))).toContain('Verificando sesión')
    expect(html(controller('owner'))).not.toContain('dashboard-main')
  })
  it.each<Role>(['owner', 'admin'])('shows empty official panels only for %s', async (role) => {
    const c = controller(role)
    await c.validate()
    expect(html(c)).toContain('dashboard-main')
    expect(html(c)).toContain('Identidad autorizada')
    expect(html(c)).toContain('Cerrar sesión')
    expect(html(c)).not.toContain('Sin sesión iniciada')
    expect(html(c)).not.toContain('Vista de revisión')
  })
  it('mechanic selecting Administrator still has only a technical empty view', async () => {
    const c = controller('mechanic')
    await c.validate()
    const view = html(c)
    expect(view).toContain('Tu espacio de trabajo técnico')
    expect(view).not.toMatch(/dashboard-main|Configuración|Cotizaciones|Resumen de totales/)
  })
  it('reception and missing membership cannot see official or technical panels', async () => {
    for (const c of [controller('reception'), controller('owner', false)]) {
      await c.validate()
      expect(html(c)).not.toMatch(/dashboard-main|Tu espacio de trabajo técnico/)
      expect(html(c)).toMatch(/Acceso restringido|Sin taller autorizado/)
    }
  })
  it('real login has correct autocomplete, busy states and distinct notice', () => {
    const view = renderToStaticMarkup(
      <AccessScreens
        page="login"
        presentation="administrador"
        onNavigate={() => {}}
        auth={{ enabled: true, busy: true, message: 'Comprobando credenciales', onLogin: () => {} }}
      />
    )
    expect(view).toContain('autoComplete="username"')
    expect(view).toContain('autoComplete="current-password"')
    expect(view).toContain('Acceso seguro · Supabase Auth')
    expect(view).not.toContain('Vista de revisión — sin autenticación real')
    for (const input of view.match(/<input[^>]*>/g) || []) expect(input).toContain('disabled=""')
  })
  it.each(['register', 'recover', 'newPassword'] as const)(
    'keeps %s inactive even with a real session',
    async (page) => {
      const c = controller('owner')
      await c.validate()
      const view = renderToStaticMarkup(
        <RealAccess page={page} presentation="administrador" onNavigate={() => {}} controller={c} />
      )
      for (const input of view.match(/<input[^>]*>/g) || []) expect(input).toContain('disabled=""')
      expect(view).toContain('DEMO')
      expect(view).not.toContain('dashboard-main')
    }
  )
})
