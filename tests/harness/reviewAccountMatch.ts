import { authReviewAccount } from '../fixtures/authReviewAccount'
import { accessPaths, type AccessPresentation } from '../../src/access/accessContract'
// Visual QA only. No token, role assignment, cookie, membership or authenticated session.
export function reviewAccountMatch(
  email: string,
  password: string,
  presentation: AccessPresentation
) {
  if (email.trim() !== authReviewAccount.email || password !== authReviewAccount.password)
    return {
      error: 'Datos de revisión inválidos. No se ha iniciado una sesión.',
      authenticated: false as const
    }
  if (presentation !== authReviewAccount.presentation)
    return {
      error:
        'Esta credencial ficticia solo previsualiza Administrador. Elegir otra entrada no cambia el perfil de revisión ni concede permisos.',
      authenticated: false as const
    }
  return { path: accessPaths.administratorReview, authenticated: false as const }
}
