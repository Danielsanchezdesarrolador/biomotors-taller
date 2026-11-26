import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import App from './WorkflowApp'
const FlowFixFixture=lazy(()=>import('./FlowFixFixture'))
const OperationsFixture=lazy(()=>import('./OperationsFixture'))
const AgendaFixture=lazy(()=>import('./AgendaFixture'))
const GuidedFixture=lazy(()=>import('./GuidedFixture'))
const FinalArchiveFixture=lazy(()=>import('./FinalArchiveFixture'))
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
    {path === '/flow-fix-qa'?<Suspense fallback={<p>Cargando…</p>}><FlowFixFixture/></Suspense>:path === '/operations-qa'?<Suspense fallback={<p>Cargando…</p>}><OperationsFixture/></Suspense>:path === '/agenda-qa' ? <Suspense fallback={<p>Cargando Agenda…</p>}><AgendaFixture/></Suspense> : path === '/guided-qa' ? (<Suspense fallback={<p>Cargando fixture…</p>}><GuidedFixture/></Suspense>) : path === '/final-archive-qa' ? (<Suspense fallback={<p>Preparando expediente ficticio…</p>}><FinalArchiveFixture/></Suspense>) : path === '/records-qa' ? (<Suspense fallback={<p>Preparando registros sintéticos…</p>}><RecordsFixture/></Suspense>) : path === '/com01d-review-qa' ? (
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
