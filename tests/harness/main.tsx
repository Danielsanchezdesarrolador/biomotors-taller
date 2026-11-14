import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './WorkflowApp'
import { AuthReviewHarness } from './AuthReviewHarness'
import { publicAccessPath, resolveAccessPath } from '../../src/access/accessContract'
import '../../src/styles.css'
import '../../src/premium.css'
const path = publicAccessPath(window.location)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {resolveAccessPath(path) || path.startsWith('/revision/') ? <AuthReviewHarness /> : <App />}
  </StrictMode>
)
