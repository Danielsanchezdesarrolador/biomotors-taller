import { useEffect, useState, useSyncExternalStore, type ComponentType, type ReactNode } from 'react'
import { AccessScreens } from '../access/AccessScreens'
import { TechnicianReview } from '../access/TechnicianReview'
import type { AccessPage, AccessPresentation } from '../access/accessContract'
import { OfficialWorkspaceView } from '../App'
import { authConfig } from './config'
import { AuthController, type AuthState, type Role } from './controller'
import { lazyGateway } from './lazyGateway'
import { parsePlanStatus, planDetail, planLabel, type PlanStatus } from '../plans/planStatus'
import { clearPrivateScreen, clearOperationalDrafts } from '../official/privateScreen'
import { clearCp03Draft } from '../official/privateDraft'
import './auth.css'
import { PersonalHome } from './PersonalHome'
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
  const [Mechanic,setMechanic]=useState<ComponentType<{controller:AuthController;plan:PlanStatus|null;controls:ReactNode}>|null>(null)
  useEffect(()=>{let active=true;if(import.meta.env.VITE_BT_PLAN04_WORKSHOPS_ENABLED==='true')void import('../workshops/MechanicWorkspace').then(m=>{if(active)setMechanic(()=>m.MechanicWorkspace)}).catch(()=>{});return()=>{active=false}},[])
  const [Invitation,setInvitation]=useState<ComponentType<{controller:AuthController}>|null>(null)
  useEffect(()=>{let active=true;if(import.meta.env.VITE_BT_PLAN04_WORKSHOPS_ENABLED==='true')
    void import('../workshops/AcceptInvitation').then(m=>{if(active)setInvitation(()=>m.AcceptInvitation)}).catch(()=>{});
    return()=>{active=false}},[])
  const [creatorOpen, setCreatorOpen] = useState(false)
  const [CreatorPanel, setCreatorPanel] = useState<ComponentType<{controller:AuthController;onBack:()=>void}> | null>(null)
  const [creatorLoadError,setCreatorLoadError] = useState(false)
  const principalScope = [state.phase,state.context?.userId ?? state.identityId,state.authorityVersion].join(':')
  const privateScope = [state.context?.userId ?? state.identityId,state.context?.workshop.id,state.context?.role,state.authorityVersion].join(':')
  const [creatorGrant, setCreatorGrant] = useState<{scope:string;allowed:boolean}|null>(null)
  const creatorAccess = creatorGrant?.scope === principalScope && creatorGrant.allowed
  const [planRevision, setPlanRevision] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') setPlanRevision(v => v + 1) }, 30_000)
    return () => window.clearInterval(timer)
  }, [])
  const planScope = [principalScope,state.context?.workshop.id].join(':')
  const [planResponse, setPlanResponse] = useState<{scope:string;value:PlanStatus|null}|null>(null)
  const planStatus = planResponse?.scope === planScope ? planResponse.value : null
  useEffect(() => {
    let active = true
    if (import.meta.env.VITE_BT_PLAN04_PRIVATE_ENABLED !== 'true' ||
        !['authorized', 'restricted', 'no-membership'].includes(state.phase)) {setPlanResponse(null);return}
    void controller.personalPlanClient().then(async (client) => {
      if (!client) return null
      const { data, error } = await client.rpc('bt_plan04_my_status', {
        p_workshop_id: state.context?.workshop.id ?? null
      })
      return !error ? parsePlanStatus(data) : null
    }).then(plan => { if (active) setPlanResponse({scope:planScope,value:plan}) })
      .catch(() => { if (active) setPlanResponse({scope:planScope,value:null}) })
    return () => { active = false }
  }, [controller, planScope, planRevision])
  useEffect(() => {
    let active = true
    setCreatorGrant(null)
    if (import.meta.env.VITE_BT_CREATOR_PRIVATE_ENABLED === 'true' &&
        ['authorized', 'restricted', 'no-membership'].includes(state.phase)) {
      void controller.personalPlanClient().then(async (client) => {
        if (!client) return false
        const { data, error } = await client.rpc('bt_creator_is_creator')
        return !error && data === true
      }).then((allowed) => { if (active) setCreatorGrant({scope:principalScope,allowed}) })
        .catch(() => { if (active) setCreatorGrant({scope:principalScope,allowed:false}) })
    }
    return () => { active = false }
  }, [controller, principalScope])
  useEffect(() => { if (!['authorized', 'restricted', 'no-membership'].includes(state.phase)) setCreatorOpen(false) }, [state.phase])
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
      if (document.visibilityState !== 'hidden') controller.requestRevalidation()
    }
    const visibility = () => {
      if (document.visibilityState === 'visible') verify()
    }
    const offline = () => {
      controller.goOffline()
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
  const refreshAccess = () => { void controller.validate().then(() => setPlanRevision(value => value + 1)) }
  const controls = (
    <div className="auth-session-controls">
      <button type="button" onClick={logout}>
        Cerrar sesión
      </button>
      {import.meta.env.VITE_BT_CREATOR_PRIVATE_ENABLED === 'true' && creatorAccess && (
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
  const creatorView = CreatorPanel
    ? <CreatorPanel key={privateScope} controller={controller} onBack={()=>{setCreatorOpen(false);refreshAccess()}}/>
    : <p role="status">{creatorLoadError?'No se pudo cargar el panel del creador.':'Cargando panel privado del creador…'}</p>
  if (page==='login' && creatorOpen && creatorAccess && state.phase==='restricted') return creatorView
  if (page==='login' && ['authorized','restricted','no-membership'].includes(state.phase) &&
      typeof window !== 'undefined' && window.location.hash==='#/auth/aceptar-invitacion' && Invitation) return <main className="personal-home"><Invitation key={privateScope} controller={controller}/><button onClick={()=>onNavigate('/acceso')}>Volver a mi cuenta</button></main>
  if (page === 'login' && state.phase === 'no-membership' && import.meta.env.VITE_BT_PLAN04_PRIVATE_ENABLED === 'true') {
    return <><div hidden={creatorOpen && creatorAccess} inert={creatorOpen && creatorAccess}>
      <PersonalHome key={privateScope} controller={controller} plan={planStatus} name={state.identityName}
        onRefresh={refreshAccess}
        onCreator={creatorAccess ? () => setCreatorOpen(true) : undefined} />
      </div>{creatorOpen && creatorAccess && creatorView}</>
  }
  // The only private entry is the login route; public review routes never render this component.
  if (page === 'login' && state.phase === 'authorized' && state.context) {
    const { workshop, role } = state.context
    if(role==='mechanic' && import.meta.env.VITE_BT_PLAN04_WORKSHOPS_ENABLED==='true' && Mechanic) return <Mechanic key={privateScope} controller={controller} plan={planStatus} controls={controls}/>
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
      return (<><div hidden={creatorOpen && creatorAccess} inert={creatorOpen && creatorAccess}>
        <OfficialWorkspaceView
          key={privateScope}
          session={{ workshop: workshop.name, role: roleNames[role],
            displayName: state.context.displayName, controls,
            planStatus: import.meta.env.VITE_BT_PLAN04_PRIVATE_ENABLED === 'true'
              ? planStatus : undefined,
            directoryController: import.meta.env.VITE_BT_CP03_PRIVATE_ENABLED === 'true'
              ? controller : undefined }}
        />
        </div>{creatorOpen && creatorAccess && creatorView}</>
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
          <AuthStatus state={state} controller={controller} busy={busy} planStatus={planStatus} />
        ) : undefined
      }}
    />
  )
}
function AuthStatus({
  state,
  controller,
  busy,
  planStatus
}: {
  state: AuthState
  controller: AuthController
  busy: boolean
  planStatus: PlanStatus | null
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
      {import.meta.env.VITE_BT_PLAN04_PRIVATE_ENABLED === 'true' &&
        state.phase === 'no-membership' && (
          <p className="personal-plan-status" role="status">
            {planLabel(planStatus)}
            {planDetail(planStatus) ? ' · ' + planDetail(planStatus) : ''}
          </p>
        )}
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
