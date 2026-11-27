import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { AccessScreens } from './AccessScreens'
import { TechnicianReview } from './TechnicianReview'
import { UsersPreparation } from './UsersPreparation'
import {
  accessPaths,
  mechanicLimits,
  passwordCriteria,
  publicAccessPath,
  previewCapabilities,
  resolveAccessPath,
  type AccessPage
} from './accessContract'
import { authReviewAccount } from '../../tests/fixtures/authReviewAccount'
import { reviewAccountMatch } from '../../tests/harness/reviewAccountMatch'

describe('BT-AUTH-01A visual access without authentication', () => {
  it.each<AccessPage>([
    'login',
    'register',
    'verify',
    'recover',
    'recoveryNotice',
    'newPassword',
    'passwordUpdated'
  ])('renders %s as explicit review without real credentials or effects', (page) => {
    const html = renderToStaticMarkup(
      <AccessScreens page={page} presentation="administrador" onNavigate={() => {}} />
    )
    expect(html).toContain('Vista de revisión — sin autenticación real')
    if (page === 'login') expect(html).toContain('correo verificado')
    expect(html).not.toContain(authReviewAccount.email)
    expect(html).not.toContain(authReviewAccount.password)
    for (const input of html.match(/<input[^>]*>/g) ?? []) expect(input).toContain('disabled=""')
    expect(html).not.toMatch(
      /Te enviamos|Enlace enviado|Tu cuenta ahora está protegida|fue restablecido/
    )
  })
  it('resolves only explicit presentation paths, never role flags or arbitrary endpoints', () => {
    expect(resolveAccessPath(accessPaths.mechanic)).toEqual({
      page: 'login',
      presentation: 'mecanico'
    })
    expect(resolveAccessPath(accessPaths.verify)?.page).toBe('verify')
    expect(resolveAccessPath('/?role=admin')).toBeUndefined()
    expect(resolveAccessPath('/auth/unknown')).toBeUndefined()
    expect(publicAccessPath({ hash: '#/acceso', pathname: '/' })).toBe('/acceso')
    expect(publicAccessPath({ hash: '', pathname: '/acceso' })).toBe('/acceso')
  })
  it('grants no capability in a visual preview, even when the administrator entry is selected', () => {
    expect(Object.values(previewCapabilities()).every((v) => v === false)).toBe(true)
    expect(Object.isFrozen(previewCapabilities())).toBe(true)
  })
  it('offers no mechanic self-registration', () => {
    const html = renderToStaticMarkup(
      <AccessScreens page="register" presentation="mecanico" onNavigate={() => {}} />
    )
    expect(html).toContain('Mecánico invitado')
    expect(html).not.toContain('Registrar mecánico')
    expect(html).toContain('No hay autorregistro')
    expect(html).not.toContain('<input')
  })
  it('checks each visual password criterion without inventing strength for an empty value', () => {
    expect(Object.values(passwordCriteria('')).some(Boolean)).toBe(false)
    expect(passwordCriteria('abcdefgh')).toEqual({
      length: true,
      uppercase: false,
      number: false,
      symbol: false
    })
    expect(Object.values(passwordCriteria('Ejemplo-123!')).every(Boolean)).toBe(true)
  })
  it('shows only technical areas and unavailable assigned work in the mechanic review', () => {
    const html = renderToStaticMarkup(<TechnicianReview onNavigate={() => {}} />)
    expect(html).toContain('Sin órdenes asignadas')
    expect(html).toContain('Fotografías de inspección')
    expect(html).not.toMatch(/Cotización|IVA|Suscripción|Facturación|\$|Configurar taller/)
    expect(html).toContain('disabled=""')
  })
  it('presents plan quotas as reference without an active plan or invitation operation', () => {
    expect(mechanicLimits).toEqual({ Básico: 0, Plus: 2, Full: 4 })
    const html = renderToStaticMarkup(<UsersPreparation />)
    expect(html).toContain('Cuenta personal sin taller nuevo')
    expect(html).toContain('Mecánicos 0/2')
    expect(html.match(/Mecánicos 0\/4/g)).toHaveLength(1)
    expect(html).toContain('sin plan activo')
    expect(html).toContain('disabled=""')
  })
  it('keeps the single fictitious account in the harness, without authenticating or granting another presentation', () => {
    expect(authReviewAccount.authenticated).toBe(false)
    expect(
      reviewAccountMatch(authReviewAccount.email, authReviewAccount.password, 'administrador')
    ).toEqual({ path: accessPaths.administratorReview, authenticated: false })
    expect(
      reviewAccountMatch(authReviewAccount.email, authReviewAccount.password, 'mecanico').error
    ).toBeTruthy()
    expect(
      reviewAccountMatch(authReviewAccount.email, 'incorrecta', 'administrador').error
    ).toBeTruthy()
  })
})
