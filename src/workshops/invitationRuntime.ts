import type {InviteLocation} from '../auth/inviteLinkRouting'
import { createMemoryOnlyInviteHandoff } from '../auth/inviteHandoffCandidate'
// Imported only by the separately gated workshop rollout. Tokens never enter storage.
export const invitationHandoff = createMemoryOnlyInviteHandoff()
let expiryTimer:number|undefined
let watching=false
export function watchInvitationNavigation() {
  if(watching)return
  watching=true
  const clear=()=>{invitationHandoff.clear();window.clearTimeout(expiryTimer)}
  // Runs before React's hash listener, including a second invitation in an open tab.
  const capture=()=>{
    if(window.location.hash.startsWith('#/auth/aceptar-invitacion?'))
      captureInvitation({pathname:window.location.pathname,search:window.location.search,hash:window.location.hash},Date.now())
  }
  window.addEventListener('hashchange',capture)
  window.addEventListener('popstate',capture)
  window.addEventListener('pagehide',clear)
  window.addEventListener('offline',clear)
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible')clear()})
}
export function captureInvitation(entry:InviteLocation,receivedAt:number) {
  if(Date.now()-receivedAt>=300_000)return
  window.clearTimeout(expiryTimer)
  invitationHandoff.capture(entry, url => window.history.replaceState(window.history.state,'',url))
  expiryTimer=window.setTimeout(invitationHandoff.clear, Math.max(0,300_000-(Date.now()-receivedAt)))
}
