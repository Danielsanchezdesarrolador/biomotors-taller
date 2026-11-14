import { useEffect, useState } from 'react'
import { AccessScreens } from '../../src/access/AccessScreens'
import { TechnicianReview } from '../../src/access/TechnicianReview'
import { accessPaths, publicAccessPath, resolveAccessPath } from '../../src/access/accessContract'
import { OfficialWorkspaceView } from '../../src/App'
import { reviewAccountMatch } from './reviewAccountMatch'
export function AuthReviewHarness() {
  const [path, setPath] = useState(publicAccessPath(window.location))
  useEffect(() => {
    const pop = () => setPath(publicAccessPath(window.location))
    window.addEventListener('popstate', pop)
    window.addEventListener('hashchange', pop)
    return () => {
      window.removeEventListener('popstate', pop)
      window.removeEventListener('hashchange', pop)
    }
  }, [])
  function navigate(next: string) {
    history.pushState(null, '', next)
    setPath(next)
    window.scrollTo({ top: 0 })
  }
  const route = resolveAccessPath(path)
  if (route)
    return (
      <AccessScreens
        key={path}
        {...route}
        onNavigate={navigate}
        onReviewSubmit={(draft, presentation) => {
          const result = reviewAccountMatch(draft.email, draft.password, presentation)
          if (result.error) return result.error
          if (result.path) navigate(result.path)
        }}
      />
    )
  if (path === accessPaths.mechanicReview) return <TechnicianReview onNavigate={navigate} />
  return <OfficialWorkspaceView review onReviewExit={() => navigate(accessPaths.login)} />
}
