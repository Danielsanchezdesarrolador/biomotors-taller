import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { InviteAcceptancePreview } from './InviteAcceptancePreview'
import { accessPaths } from '../access/accessContract'
import { inviteAcceptancePath, sanitizedInviteLink, scrubInviteLocation } from './inviteLinkRouting'

const token = 'a'.repeat(64)
describe('BT-AUTH-R2-A5 · enlace privado y pantalla iPhone en preparación', () => {
  it('limpia token del hash antes del montaje sin guardarlo en estado', () => {
    const location = {
      pathname: '/', search: '',
      hash: '#/auth/aceptar-invitacion?token=' + token
    }
    const replace = vi.fn()
    expect(scrubInviteLocation(location, replace)).toBe(inviteAcceptancePath)
    expect(replace).toHaveBeenCalledOnce()
    expect(replace).toHaveBeenCalledWith('/#/auth/aceptar-invitacion')
    expect(JSON.stringify(replace.mock.calls)).not.toContain(token)
  })
  it('elimina también parámetros externos e ignora tokens falsos sin mostrarlos', () => {
    const original = { pathname: '/', search: '?token=' + token, hash: '#/auth/aceptar-invitacion?role=owner' }
    expect(sanitizedInviteLink(original)).toEqual({
      route: inviteAcceptancePath, replacement: '/#/auth/aceptar-invitacion'
    })
    const replace = vi.fn()
    expect(scrubInviteLocation(original, replace)).toBe(inviteAcceptancePath)
    expect(replace).toHaveBeenCalledWith('/#/auth/aceptar-invitacion')
  })
  it.each([
    '#/acceso', '#/revision/publica', '#/auth/aceptar-invitacion-falsa?token=' + token,
    '#/auth/recuperacion'
  ])('mantiene las otras rutas intactas (%s)', hash => {
    const replace = vi.fn()
    expect(scrubInviteLocation({ pathname: '/', search: '', hash }, replace)).toBeNull()
    expect(replace).not.toHaveBeenCalled()
  })
  it('reconoce enlaces limpios sin reescribir historial', () => {
    const replace = vi.fn()
    expect(scrubInviteLocation({
      pathname: '/', search: '', hash: '#/auth/aceptar-invitacion'
    }, replace)).toBe(inviteAcceptancePath)
    expect(replace).not.toHaveBeenCalled()
  })
  it('funciona con ruta profunda como URL de origen, sin retener query', () => {
    const replace = vi.fn()
    expect(scrubInviteLocation({
      pathname: inviteAcceptancePath, search: '?token=' + token, hash: ''
    }, replace)).toBe(inviteAcceptancePath)
    expect(replace).toHaveBeenCalledWith('/#/auth/aceptar-invitacion')
  })
  it('ofrece salida accesible y niega cualquier alta o invitación real', () => {
    const html = renderToStaticMarkup(<InviteAcceptancePreview onNavigate={() => {}} />)
    expect(html).toContain('Tu acceso como mecánico')
    expect(html).toContain('Invitaciones aún no disponibles')
    expect(html).toContain('No se ha creado ningún acceso')
    expect(html).toContain('Volver al acceso de mecánicos')
    expect(html).toContain('Si usas iPhone')
    expect(html).toContain('Safari y ByteTorque instalado')
    expect(html).toContain('mismo correo')
    expect(html).not.toContain('type="email"')
    expect(html).toContain('role="status"')
    expect(html).toContain('type="button"')
    expect(html).not.toContain(token)
    expect(html).not.toContain('Aceptar invitación</button>')
    expect(html).not.toContain('type="submit"')
  })
  it('botón de salida se dirige a acceso de mecánicos', () => {
    expect(accessPaths.mechanic).toBe('/acceso/mecanico')
  })
})
