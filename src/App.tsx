import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
import { RealAccess } from './auth/RealAccess'
import { InviteAcceptancePreview } from './auth/InviteAcceptancePreview'
import { inviteAcceptancePath, scrubInviteLocation } from './auth/inviteLinkRouting'
import type { AuthController } from './auth/controller'
import { ShieldCheck } from 'lucide-react'
import { AppShell, type Screen } from './layout/AppShell'
import { OfficialPanel } from './official/OfficialPanels'
import { preparationNotice } from './official/officialWorkspace'
import { readPrivateScreen, rememberPrivateScreen } from './official/privateScreen'
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
/** A separately approved private R1 rollout. No public-review route can mount it. */
function PrivateClientDirectory({ controller }: { controller: AuthController }) {
  const [Panel, setPanel] = useState<ComponentType<{ controller: AuthController }> | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (import.meta.env.VITE_BT_CP03_PRIVATE_ENABLED !== 'true') return
    let active = true
    void import('./clientes/Cp03PrivatePanel').then(mod => {
      if (active) setPanel(() => mod.Cp03PrivatePanel)
    }).catch(() => { if (active) setFailed(true) })
    return () => { active = false }
  }, [controller])
  if (failed) return <p role="alert">No se pudo cargar el directorio privado. Reintenta el acceso.</p>
  return Panel ? <Panel controller={controller} /> :
    <p role="status">Preparando clientes y vehículos del taller autorizado…</p>
}
export function OfficialWorkspaceView({
  review = false,
  onReviewExit,
  session
}: {
  session?: { workshop: string; role: string; controls: ReactNode; directoryController?: AuthController }
  review?: boolean
  onReviewExit?: () => void
}) {
  // Auth revalidates on focus and temporarily unmounts the workspace. Restore
  // the selected section only; never persist private records or form drafts.
  const [screen, setScreen] = useState<Screen>(() =>
    session && !review ? readPrivateScreen() : 'inicio'
  )
  const navigateScreen = (next: Screen) => {
    setScreen(next)
    if (session && !review) rememberPrivateScreen(next)
  }
  return (
    <AppShell
      screen={screen}
      onNavigate={navigateScreen}
      copy={
        session
          ? {
              workshopTitle: session.workshop,
              workshopSubtitle: 'Sesión verificada',
              workshopStatus: session.role,
              version: 'ByteTorque · Gestión de talleres',
              accountTitle: session.workshop,
              accountSubtitle: session.role,
              notifications: 'Sin notificaciones. Operaciones aún no habilitadas.'
            }
          : undefined
      }
      accountControls={session?.controls}
    >
      {review && <ReviewBanner onBack={onReviewExit} />}
      <div className="official-readiness" id="official-readiness" role="note">
        <ShieldCheck aria-hidden="true" />
        <div>
          <strong>
            {session
              ? 'Sesión y membresía verificadas'
              : 'Acceso seguro y guardado permanente en preparación'}
          </strong>
          <p>
            {session
              ? session.directoryController && screen === 'clientes'
                ? 'Directorio privado conectado al taller autorizado. En las pruebas utiliza únicamente fichas ficticias.'
                : 'Las demás operaciones de negocio aún no están habilitadas. No ingreses datos reales sin autorización.'
              : preparationNotice}
          </p>
          {session?.controls}
        </div>
      </div>
      {screen === 'clientes' && session?.directoryController &&
       import.meta.env.VITE_BT_CP03_PRIVATE_ENABLED === 'true' ?
        <PrivateClientDirectory controller={session.directoryController} /> :
        <OfficialPanel screen={screen} onNavigate={navigateScreen} />}
    </AppShell>
  )
}

function currentSafeEntryPath() {
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
  if (path === inviteAcceptancePath) return <InviteAcceptancePreview onNavigate={navigate} />
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
