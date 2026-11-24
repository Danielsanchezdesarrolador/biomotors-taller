import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import App from './WorkflowApp'
const RecordsFixture = lazy(() => import('./RecordsFixture'))
const RealAuthQaHarness = lazy(() =>
  import('./RealAuthQaHarness').then((module) => ({ default: module.RealAuthQaHarness }))
)
const ClosingReviewFixture = lazy(() =>
  import('./ClosingReviewFixture').then((module) => ({ default: module.ClosingReviewFixture }))
)
import { AuthReviewHarness } from './AuthReviewHarness'
import { publicAccessPath, resolveAccessPath } from '../../src/access/accessContract'
import '../../src/styles.css'
import '../../src/premium.css'
const path = publicAccessPath(window.location)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {path === '/records-qa' ? (<Suspense fallback={<p>Preparando registros sintéticos…</p>}><RecordsFixture/></Suspense>) : path === '/com01d-review-qa' ? (
      <Suspense fallback={<p>Preparando revisión documental aislada…</p>}>
        <ClosingReviewFixture />
      </Suspense>
    ) : path === '/auth-r1-qa' ? (
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
