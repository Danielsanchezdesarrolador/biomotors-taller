import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import App from './WorkflowApp'
const RealAuthQaHarness = lazy(() =>
  import('./RealAuthQaHarness').then((module) => ({ default: module.RealAuthQaHarness }))
)
import { AuthReviewHarness } from './AuthReviewHarness'
import { publicAccessPath, resolveAccessPath } from '../../src/access/accessContract'
import '../../src/styles.css'
import '../../src/premium.css'
const path = publicAccessPath(window.location)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {path === '/auth-r1-qa' ? (
      <Suspense fallback={<p>Loading private SDK mocks…</p>}>
        <RealAuthQaHarness />
      </Suspense>
    ) : resolveAccessPath(path) || path.startsWith('/revision/') ? (
      <AuthReviewHarness />
    ) : (
      <App />
    )}
  </StrictMode>
)
