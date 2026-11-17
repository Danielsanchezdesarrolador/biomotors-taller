import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { scrubInviteLocation } from './auth/inviteLinkRouting'
import './styles.css'
import './premium.css'

async function boot() {
 const receivedAt=Date.now()
 let entry = import.meta.env.VITE_BT_PLAN04_WORKSHOPS_ENABLED === 'true'
   ? {pathname:window.location.pathname,search:window.location.search,hash:window.location.hash} : null
 // Scrub before any asynchronous import, SDK initialization or React rendering.
 scrubInviteLocation(window.location,url=>window.history.replaceState(window.history.state,'',url))
 if (import.meta.env.VITE_BT_PLAN04_WORKSHOPS_ENABLED === 'true' && entry) {
   try {const {captureInvitation,watchInvitationNavigation}=await import('./workshops/invitationRuntime');captureInvitation(entry,receivedAt);watchInvitationNavigation()}
   catch { /* The redacted app still boots; no token or provider error is logged. */ }
   finally {entry=null}
 }

const root = document.getElementById('root')
if (!root) throw new Error('No se encontró el contenedor principal')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => {
      // El modo web sigue funcionando si el navegador impide el registro.
    })
  })
}

}
void boot()
