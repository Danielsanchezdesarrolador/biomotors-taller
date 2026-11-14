import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './WorkflowApp'
import { AuthReviewHarness } from './AuthReviewHarness'
import { resolveAccessPath } from '../../src/access/accessContract'
import '../../src/styles.css'
import '../../src/premium.css'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {resolveAccessPath(window.location.pathname) ||
    window.location.pathname.startsWith('/revision/') ? (
      <AuthReviewHarness />
    ) : (
      <App />
    )}
  </StrictMode>
)
