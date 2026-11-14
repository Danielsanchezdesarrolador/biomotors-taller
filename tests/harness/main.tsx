import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './WorkflowApp'
import '../../src/styles.css'
import '../../src/premium.css'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
