import { useEffect, useState, type ReactNode } from 'react'
import { RealAccess } from './auth/RealAccess'
import { InviteAcceptancePreview } from './auth/InviteAcceptancePreview'
import { inviteAcceptancePath, scrubInviteLocation } from './auth/inviteLinkRouting'
import type { AuthController } from './auth/controller'
import { ShieldCheck } from 'lucide-react'
import { AppShell, type Screen } from './layout/AppShell'
import { OfficialPanel } from './official/OfficialPanels'
import { preparationNotice } from './official/officialWorkspace'
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
export function OfficialWorkspaceView({
  review = false,
  onReviewExit,
  session
}: {
  session?: { workshop: string; role: string; controls: ReactNode }
  review?: boolean
  onReviewExit?: () => void
}) {
  const [screen, setScreen] = useState<Screen>('inicio')
  return (
    <AppShell
      screen={screen}
      onNavigate={setScreen}
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
              ? 'Las operaciones de negocio y el guardado permanente aún no están habilitados. No ingreses datos de clientes ni vehículos reales.'
              : preparationNotice}
          </p>
          {session?.controls}
        </div>
      </div>
      <OfficialPanel screen={screen} onNavigate={setScreen} />
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
