// Presentation contracts only. These values never authenticate or authorize an operation.
export const accessPaths = {
  login: '/acceso',
  administrator: '/acceso/administrador',
  mechanic: '/acceso/mecanico',
  register: '/acceso/registro',
  verify: '/auth/confirmacion',
  recover: '/auth/recuperacion',
  recoveryNotice: '/auth/revisa-correo',
  newPassword: '/auth/nueva-contrasena',
  passwordUpdated: '/auth/contrasena-actualizada',
  administratorReview: '/revision/administrador',
  mechanicReview: '/revision/mecanico'
} as const
export type AccessPage =
  | 'login'
  | 'register'
  | 'verify'
  | 'recover'
  | 'recoveryNotice'
  | 'newPassword'
  | 'passwordUpdated'
export type AccessPresentation = 'administrador' | 'mecanico'
export function resolveAccessPath(
  path: string
): { page: AccessPage; presentation: AccessPresentation } | undefined {
  const pages: Record<string, AccessPage> = {
    [accessPaths.login]: 'login',
    [accessPaths.administrator]: 'login',
    [accessPaths.mechanic]: 'login',
    [accessPaths.register]: 'register',
    [accessPaths.verify]: 'verify',
    [accessPaths.recover]: 'recover',
    [accessPaths.recoveryNotice]: 'recoveryNotice',
    [accessPaths.newPassword]: 'newPassword',
    [accessPaths.passwordUpdated]: 'passwordUpdated'
  }
  return pages[path]
    ? {
        page: pages[path],
        presentation: path === accessPaths.mechanic ? 'mecanico' : 'administrador'
      }
    : undefined
}
export const reviewNotice = 'Vista de revisión — sin autenticación real'
export const reviewLimit =
  'No ingreses credenciales reales. No se crean cuentas, no se envían correos y no hay sesión autenticada.'
export const mechanicLimits = Object.freeze({ Básico: 2, Plus: 8, Full: 8 })
export const technicalAreas = Object.freeze([
  'Mis órdenes asignadas',
  'Inspección multipunto',
  'Observaciones técnicas',
  'Fotografías de inspección',
  'Trabajos realizados'
])
export function previewCapabilities() {
  return Object.freeze({
    authenticated: false,
    canReadPrivateData: false,
    canWrite: false,
    canInvite: false,
    canManageWorkshop: false
  })
}
export function passwordCriteria(value: string) {
  return {
    length: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    number: /[0-9]/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value)
  }
}
