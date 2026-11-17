import { useEffect, useState, useSyncExternalStore, type ComponentType } from 'react'
import { AccessScreens } from '../access/AccessScreens'
import { TechnicianReview } from '../access/TechnicianReview'
import type { AccessPage, AccessPresentation } from '../access/accessContract'
import { OfficialWorkspaceView } from '../App'
import { authConfig } from './config'
import { AuthController, type AuthState, type Role } from './controller'
import { lazyGateway } from './lazyGateway'
import { clearPrivateScreen, clearOperationalDrafts } from '../official/privateScreen'
import { clearCp03Draft } from '../official/privateDraft'
import './auth.css'
const roleNames: Record<Role, string> = {
  owner: 'Propietario',
  admin: 'Administrador',
  mechanic: 'Mecánico',
  reception: 'Recepción'
}
let defaultController: AuthController | undefined
export function configuredController() {
  if (!defaultController) {
    const config = authConfig({
      enabled: import.meta.env.VITE_BT_AUTH_R1_ENABLED,
      url: import.meta.env.VITE_SUPABASE_URL,
      key: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
    })
    defaultController = config.enabled
      ? new AuthController(lazyGateway(config))
      : new AuthController(null, config.reason)
  }
  return defaultController
}
export function RealAccess({
  page,
  presentation,
  onNavigate,
  controller = configuredController()
}: {
  page: AccessPage
  presentation: AccessPresentation
  onNavigate: (path: string) => void
  controller?: AuthController
}) {
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot
  )
  const [creatorOpen, setCreatorOpen] = useState(false)
  const [CreatorPanel, setCreatorPanel] = useState<ComponentType<{controller:AuthController;onBack:()=>void}> | null>(null)
  const [creatorLoadError,setCreatorLoadError] = useState(false)
  const [creatorAccess, setCreatorAccess] = useState(false)
  useEffect(() => {
    let active = true
    setCreatorAccess(false)
    if (state.phase === 'authorized' && state.context &&
        (state.context.role === 'owner' || state.context.role === 'admin')) {
      void controller.directoryClient().then(async (client) => {
        if (!client) return false
        const { data, error } = await client.rpc('bt_creator_is_creator')
        return !error && data === true
      }).then((allowed) => { if (active) setCreatorAccess(allowed) })
        .catch(() => { if (active) setCreatorAccess(false) })
    }
    return () => { active = false }
  }, [controller, state.phase, state.context?.userId])
  useEffect(() => { if (state.phase !== 'authorized') setCreatorOpen(false) }, [state.phase])
  useEffect(() => {
    if (import.meta.env.VITE_BT_CREATOR_PRIVATE_ENABLED !== 'true' ||
        !creatorOpen || !creatorAccess) return
    let active = true
    setCreatorLoadError(false)
    void import('../creator/CreatorConsole').then(mod => {
      if (active) setCreatorPanel(() => mod.CreatorConsole)
    }).catch(() => { if (active) setCreatorLoadError(true) })
    return () => { active = false }
  }, [creatorOpen, creatorAccess])
  useEffect(() => {
    const stop = controller.start()
    const verify = () => {
      void controller.validate()
    }
    const visibility = () => {
      if (document.visibilityState === 'visible') verify()
    }
    const offline = () => {
      void controller.validate()
    }
    window.addEventListener('focus', verify)
    window.addEventListener('online', verify)
    window.addEventListener('offline', offline)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      stop()
      window.removeEventListener('focus', verify)
      window.removeEventListener('online', verify)
      window.removeEventListener('offline', offline)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [controller])
  // Never restore a previous operator's section after an explicit sign-out.
  useEffect(() => {
    if (state.phase === 'anonymous' || state.phase === 'no-membership' ||
        state.phase === 'disabled') { clearPrivateScreen(); clearCp03Draft(); clearOperationalDrafts() }
  }, [state.phase])
  const logout = () => {
    clearPrivateScreen()
    clearCp03Draft()
    clearOperationalDrafts()
    void controller.logout()
  }
  const controls = (
    <div className="auth-session-controls">
      <button type="button" onClick={logout}>
        Cerrar sesión
      </button>
      {import.meta.env.VITE_BT_CREATOR_PRIVATE_ENABLED === 'true' && creatorAccess &&
       (state.context?.role === 'owner' || state.context?.role === 'admin') && (
        <button type="button" onClick={() => setCreatorOpen(true)}>
          Panel del creador
        </button>
      )}
      {(state.choices?.length || 0) > 1 && (
        <button type="button" onClick={() => {
          clearPrivateScreen()
          clearCp03Draft()
          clearOperationalDrafts()
          void controller.changeWorkshop()
        }}>
          Cambiar taller
        </button>
      )}
    </div>
  )
  // The only private entry is the login route; public review routes never render this component.
  if (page === 'login' && state.phase === 'authorized' && state.context) {
    const { workshop, role } = state.context
    if (role === 'mechanic')
      return (
        <TechnicianReview
          onNavigate={logout}
          session={
            <div className="official-readiness">
              <div>
                <strong>{state.context.displayName || workshop.name} · Mecánico</strong>
                <p>
                  {state.message}{' '}
                  {presentation === 'administrador' &&
                    'Tu membresía es de Mecánico; la entrada Administrador no concede acceso administrativo.'}
                </p>
                {controls}
              </div>
            </div>
          }
        />
      )
    if (role === 'owner' || role === 'admin') {
      if (creatorOpen && creatorAccess) {
        if (creatorLoadError) return <p role="alert">No se pudo cargar el panel del creador. Vuelve al inicio.</p>
        return CreatorPanel
          ? <CreatorPanel controller={controller} onBack={() => setCreatorOpen(false)} />
          : <p role="status">Cargando panel privado del creador…</p>
      }
      return (
        <OfficialWorkspaceView
          session={{ workshop: workshop.name, role: roleNames[role],
            displayName: state.context.displayName, controls,
            directoryController: import.meta.env.VITE_BT_CP03_PRIVATE_ENABLED === 'true'
              ? controller : undefined }}
        />
      )
    }
  }
  const real = state.phase !== 'disabled'
  const busy = ['checking', 'signing-in', 'registering', 'signing-out'].includes(state.phase)
  // Explicit pilot switch, OFF by default. Registration does not grant membership.
  const registrationEnabled =
    import.meta.env.VITE_BT_AUTH_SIGNUP_ENABLED === 'true' && real
  const needsPanel = real && page === 'login' && !['anonymous', 'signing-in'].includes(state.phase)
  return (
    <AccessScreens
      page={page}
      presentation={presentation}
      onNavigate={onNavigate}
      auth={{
        enabled: real,
        busy,
        registrationEnabled,
        completed: state.phase === 'registration-sent',
        onRegister: (email, password, profile) => {
          if (registrationEnabled) void controller.register(email, password, profile)
        },
        message: state.message,
        onLogin: (email, password) => {
          void controller.login(email, password)
        },
        content: needsPanel ? (
          <AuthStatus state={state} controller={controller} busy={busy} />
        ) : undefined
      }}
    />
  )
}
function AuthStatus({
  state,
  controller,
  busy
}: {
  state: AuthState
  controller: AuthController
  busy: boolean
}) {
  return (
    <section className="auth-status" aria-label="Estado del acceso" aria-busy={busy}>
      <p
        role="status"
        aria-live="polite"
        tabIndex={-1}
        ref={(node) => {
          node?.focus()
        }}
      >
        {state.message}
      </p>
      {state.identityName && <p>Cuenta: {state.identityName}</p>}
      {state.phase === 'choose' &&
        state.choices?.map((choice) => (
          <button
            className="access-secondary"
            type="button"
            key={choice.workshop.id}
            onClick={() => void controller.choose(choice.workshop.id)}
          >
            {choice.workshop.name} · {roleNames[choice.role]}
          </button>
        ))}
      {!busy && (
        <>
          <button
            className="access-secondary"
            type="button"
            onClick={() => void controller.validate()}
          >
            Volver a verificar
          </button>
          <button
            className="access-secondary"
            type="button"
            onClick={() => void controller.logout()}
          >
            Cerrar sesión
          </button>
        </>
      )}
    </section>
  )
}
