import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
import { RealAccess } from './auth/RealAccess'
import { InviteAcceptancePreview } from './auth/InviteAcceptancePreview'
import { inviteAcceptancePath, scrubInviteLocation } from './auth/inviteLinkRouting'
import type { AuthController } from './auth/controller'
import type { PlanStatus } from './plans/planStatus'
import { ShieldCheck } from 'lucide-react'
import { AppShell, type Screen } from './layout/AppShell'
import { OfficialPanel } from './official/OfficialPanels'
import { preparationNotice } from './official/officialWorkspace'
import { useWorkspaceNavigation } from './official/useWorkspaceNavigation'
import './informes/informes.css'
import './official/official.css'
import { TechnicianReview } from './access/TechnicianReview'
import { ReviewBanner } from './access/ReviewBanner'
import {
  accessPaths,
  publicAccessPath,
  publicEntryPath,
  resolveAccessPath
} from './access/accessContract'
function PrivateWorkshopSettings({controller}:{controller:AuthController}) {
 const [Panel,setPanel]=useState<ComponentType<{controller:AuthController}>|null>(null)
 const [failed,setFailed]=useState(false)
 useEffect(()=>{let active=true;void import('./workshops/WorkshopSettings').then(m=>{if(active)setPanel(()=>m.WorkshopSettings)}).catch(()=>{if(active)setFailed(true)});return()=>{active=false}},[controller])
 return failed?<p role="alert">No se pudo cargar la configuración del taller.</p>:Panel?<Panel controller={controller}/>:<p role="status">Cargando configuración autorizada…</p>
}
/** A separately approved private R1 rollout. No public-review route can mount it. */
function PrivateWorkOrders({
  controller,
  onQuote
}: {
  controller: AuthController
  onQuote?: (id: string) => void
}) {
  const [Panel, setPanel] = useState<ComponentType<{
    controller: AuthController
    onQuote?: (id: string) => void
  }> | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (import.meta.env.VITE_BT_CP04_PRIVATE_ENABLED !== 'true') return
    let active = true
    void import('./ordenes/Cp04PrivatePanel')
      .then((mod) => {
        if (active) setPanel(() => mod.Cp04PrivatePanel)
      })
      .catch(() => {
        if (active) setFailed(true)
      })
    return () => {
      active = false
    }
  }, [controller])
  if (failed) return <p role="alert">No se pudo cargar el módulo de órdenes. Revisa el acceso.</p>
  return Panel ? (
    <Panel controller={controller} onQuote={onQuote} />
  ) : (
    <p role="status">Preparando órdenes autorizadas…</p>
  )
}
function PrivateQuotes(props: {
  controller: AuthController
  initialOrderId?: string
  initialVehicleId?: string
  onBack: () => void
}) {
  const [Panel, setPanel] = useState<ComponentType<typeof props> | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let active = true
    if (import.meta.env.VITE_BT_CP05_PRIVATE_ENABLED === 'true')
      void import('./cp05/Cp05PrivatePanel')
        .then((m) => {
          if (active) setPanel(() => m.Cp05PrivatePanel)
        })
        .catch(() => {
          if (active) setFailed(true)
        })
    return () => {
      active = false
    }
  }, [props.controller])
  return failed ? (
    <p role="alert">No se pudo cargar cotizaciones. Verifica la conexión.</p>
  ) : Panel ? (
    <Panel {...props} />
  ) : (
    <p role="status">Preparando cotizaciones autorizadas…</p>
  )
}
function PrivateClientDirectory({
  controller,
  onVehicleQuotes
}: {
  controller: AuthController
  onVehicleQuotes?: (id: string) => void
}) {
  const [Panel, setPanel] = useState<ComponentType<{
    controller: AuthController
    onVehicleQuotes?: (id: string) => void
  }> | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (import.meta.env.VITE_BT_CP03_PRIVATE_ENABLED !== 'true') return
    let active = true
    void import('./clientes/Cp03PrivatePanel')
      .then((mod) => {
        if (active) setPanel(() => mod.Cp03PrivatePanel)
      })
      .catch(() => {
        if (active) setFailed(true)
      })
    return () => {
      active = false
    }
  }, [controller])
  if (failed)
    return <p role="alert">No se pudo cargar el directorio privado. Reintenta el acceso.</p>
  return Panel ? (
    <Panel controller={controller} onVehicleQuotes={onVehicleQuotes} />
  ) : (
    <p role="status">Preparando clientes y vehículos del taller autorizado…</p>
  )
}
export function OfficialWorkspaceView({
  review = false,
  onReviewExit,
  session
}: {
  session?: {
    workshop: string
    role: string
    displayName?: string
    planStatus?: PlanStatus | null
    controls: ReactNode
    directoryController?: AuthController
  }
  review?: boolean
  onReviewExit?: () => void
}) {
  const privateSession = !!session && !review
  const navigation = useWorkspaceNavigation(privateSession)
  const {screen,navigate:navigateScreen} = navigation
  const [quoteOrder, setQuoteOrder] = useState<string | undefined>()
  const [quoteVehicle, setQuoteVehicle] = useState<string | undefined>()
  const renderPanel = (screen: Screen) => (
screen === 'configuracion' && !review && session?.directoryController && import.meta.env.VITE_BT_PLAN04_WORKSHOPS_ENABLED === 'true' ? (
        <PrivateWorkshopSettings controller={session.directoryController}/>
      ) : screen === 'ordenes' &&
      session?.directoryController &&
      import.meta.env.VITE_BT_CP04_PRIVATE_ENABLED === 'true' ? (
        <PrivateWorkOrders
          controller={session.directoryController}
          onQuote={
            !review && import.meta.env.VITE_BT_CP05_PRIVATE_ENABLED === 'true'
              ? (id) => {
                  setQuoteOrder(id)
                  setQuoteVehicle(undefined)
                  navigateScreen('informes')
                }
              : undefined
          }
        />
      ) : screen === 'informes' &&
        !review &&
        session?.directoryController &&
        import.meta.env.VITE_BT_CP05_PRIVATE_ENABLED === 'true' ? (
        <PrivateQuotes
          key={quoteOrder ? 'order:'+quoteOrder : quoteVehicle ? 'vehicle:'+quoteVehicle : 'recent'}
          controller={session.directoryController}
          initialVehicleId={quoteVehicle}
          initialOrderId={quoteOrder}
          onBack={() => navigateScreen(quoteVehicle ? 'clientes' : 'ordenes')}
        />
      ) : screen === 'clientes' &&
        session?.directoryController &&
        import.meta.env.VITE_BT_CP03_PRIVATE_ENABLED === 'true' ? (
        <PrivateClientDirectory
          controller={session.directoryController}
          onVehicleQuotes={
            !review && import.meta.env.VITE_BT_CP05_PRIVATE_ENABLED === 'true'
              ? (id) => {
                  setQuoteVehicle(id)
                  setQuoteOrder(undefined)
                  navigateScreen('informes')
                }
              : undefined
          }
        />
      ) : (
        <OfficialPanel screen={screen} onNavigate={navigateScreen} />
      )
  )
  const privateOrders =
    screen === 'ordenes' &&
    !!session?.directoryController &&
    import.meta.env.VITE_BT_CP04_PRIVATE_ENABLED === 'true' &&
    !review
  return (
    <AppShell
      screen={screen}
      onNavigate={navigateScreen}
      preserveNavigationPosition={privateSession}
      copy={
        session
          ? {
              workshopTitle: session.workshop,
              workshopSubtitle: 'Sesión verificada',
              workshopStatus: session.role,
              version: 'ByteTorque · Gestión de talleres',
              accountTitle: session.displayName || session.workshop,
              accountSubtitle: session.role,
              accountPlan: session.planStatus,
              avatarText: session.displayName
                ? session.displayName.split(' ').slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('')
                : undefined,
              notifications: 'Sin notificaciones. Operaciones aún no habilitadas.'
            }
          : undefined
      }
      accountControls={session?.controls}
    >
      {review && <ReviewBanner onBack={onReviewExit} />}
      <div
        className={'official-readiness' + (privateOrders ? ' cp04-session' : '')}
        id="official-readiness"
        role="note"
      >
        <ShieldCheck aria-hidden="true" />
        <div>
          <strong>
            {session
              ? 'Sesión y membresía verificadas'
              : 'Acceso seguro y guardado permanente en preparación'}
          </strong>
          <p>
            {privateOrders
              ? 'Conectado al taller autorizado.'
              : session
                ? session.directoryController &&
                  (screen === 'clientes' ||
                    (screen === 'informes' &&
                      import.meta.env.VITE_BT_CP05_PRIVATE_ENABLED === 'true') ||
                    (screen === 'ordenes' &&
                      import.meta.env.VITE_BT_CP04_PRIVATE_ENABLED === 'true'))
                  ? 'Datos privados conectados al taller autorizado. Utiliza únicamente registros autorizados.'
                  : 'Las demás operaciones de negocio aún no están habilitadas. No ingreses datos reales sin autorización.'
                : preparationNotice}
          </p>
          {!privateOrders && session?.controls}
        </div>
        {privateOrders && session?.controls}
      </div>
      <div ref={navigation.root} className="workspace-views">
        {navigation.rendered.map(section=><div key={section} data-workspace-section={section}
          hidden={section!==screen} inert={section!==screen}>
          {renderPanel(section)}
        </div>)}
      </div>
    </AppShell>
  )
}

function currentSafeEntryPath() {
  // Remove only the referral tracking parameter from ChatGPT, preserving
  // other query parameters, hash routes, and authentication state.
  if (window.location.search) {
    const url = new URL(window.location.href)
    if (url.searchParams.get('utm_source') === 'chatgpt.com') {
      url.searchParams.delete('utm_source')
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
    }
  }
  // Auth has already validated the email at its confirmation URL.
  // Do not leave an unconsumed PKCE callback code in browser history.
  if (window.location.hash.startsWith('#/auth/confirmacion') && window.location.search) {
    const url = new URL(window.location.href)
    for (const field of ['code', 'access_token', 'refresh_token', 'token', 'token_hash',
      'error', 'error_code', 'error_description']) url.searchParams.delete(field)
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
  }
  // Also process links opened by hashchange after the initial page mount.
  const scrubbed = scrubInviteLocation(window.location, (url) => {
    window.history.replaceState(window.history.state, '', url)
  })
  return scrubbed ?? publicEntryPath(window.location)
}
export default function App({ authController }: { authController?: AuthController } = {}) {
  const [path, setPath] = useState(() =>
    typeof window === 'undefined' ? accessPaths.login : currentSafeEntryPath()
  )
  useEffect(() => {
    const pop = () => {
      if (publicAccessPath(window.location) === '/') {
        window.history.replaceState(
          null,
          '',
          '/' + window.location.search + '#' + accessPaths.login
        )
      }
      setPath(currentSafeEntryPath())
    }
    pop()
    window.addEventListener('popstate', pop)
    window.addEventListener('hashchange', pop)
    return () => {
      window.removeEventListener('popstate', pop)
      window.removeEventListener('hashchange', pop)
    }
  }, [])
  function navigate(path: string) {
    window.history.pushState(null, '', '/#' + path)
    setPath(path)
    window.scrollTo({ top: 0 })
  }
  const route = resolveAccessPath(path)
  if (route)
    return <RealAccess key={path} {...route} onNavigate={navigate} controller={authController} />
  if (path === inviteAcceptancePath) return import.meta.env.VITE_BT_PLAN04_WORKSHOPS_ENABLED === 'true'
    ? <RealAccess page="login" presentation="mecanico" onNavigate={navigate} controller={authController}/>
    : <InviteAcceptancePreview onNavigate={navigate} />
  if (path === accessPaths.mechanicReview) return <TechnicianReview onNavigate={navigate} />
  if (path === accessPaths.administratorReview || path === accessPaths.publicPreview)
    return <OfficialWorkspaceView review onReviewExit={() => navigate(accessPaths.login)} />
  return (
    <RealAccess
      page="login"
      presentation="administrador"
      onNavigate={navigate}
      controller={authController}
    />
  )
}
