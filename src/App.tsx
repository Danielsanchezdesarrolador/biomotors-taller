import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { AppShell, type Screen } from './layout/AppShell'
import { OfficialPanel } from './official/OfficialPanels'
import { preparationNotice } from './official/officialWorkspace'
import './informes/informes.css'
import './official/official.css'
import { AccessScreens } from './access/AccessScreens'
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
  onReviewExit
}: {
  review?: boolean
  onReviewExit?: () => void
}) {
  const [screen, setScreen] = useState<Screen>('inicio')
  return (
    <AppShell screen={screen} onNavigate={setScreen}>
      {review && <ReviewBanner onBack={onReviewExit} />}
      <div className="official-readiness" id="official-readiness" role="note">
        <ShieldCheck aria-hidden="true" />
        <div>
          <strong>Acceso seguro y guardado permanente en preparación</strong>
          <p>{preparationNotice}</p>
        </div>
      </div>
      <OfficialPanel screen={screen} onNavigate={setScreen} />
    </AppShell>
  )
}

export default function App() {
  const [path, setPath] = useState(() =>
    typeof window === 'undefined' ? accessPaths.login : publicEntryPath(window.location)
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
      setPath(publicEntryPath(window.location))
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
  if (route) return <AccessScreens key={path} {...route} onNavigate={navigate} />
  if (path === accessPaths.mechanicReview) return <TechnicianReview onNavigate={navigate} />
  if (path === accessPaths.administratorReview || path === accessPaths.publicPreview)
    return <OfficialWorkspaceView review onReviewExit={() => navigate(accessPaths.login)} />
  return <AccessScreens page="login" presentation="administrador" onNavigate={navigate} />
}
