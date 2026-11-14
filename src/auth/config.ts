export type AuthConfig =
  | { enabled: false; reason: string }
  | { enabled: true; url: string; key: string }
export function authConfig(env: { enabled?: string; url?: string; key?: string }): AuthConfig {
  if (env.enabled !== 'true')
    return {
      enabled: false,
      reason: 'Inicio de sesión real desactivado. Acceso disponible solo como revisión DEMO.'
    }
  if (
    env.url !== 'https://suxcqqnmcjoezfxltoms.supabase.co' ||
    !/^sb_publishable_[A-Za-z0-9_-]+$/.test(env.key || '')
  )
    return {
      enabled: false,
      reason:
        'Acceso no disponible: falta la configuración pública autorizada. No ingreses credenciales.'
    }
  return { enabled: true, url: env.url, key: env.key! }
}
