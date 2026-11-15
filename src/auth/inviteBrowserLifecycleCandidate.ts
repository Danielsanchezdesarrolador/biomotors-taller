/**
 * ByteTorque BT-AUTH-R2-A6-9 · browser lifecycle adapter, OFFLINE only.
 *
 * Not imported by App/main/Edge. Requires explicit future rollout approval.
 * All browser objects injected: NO global window, network, storage, timer,
 * authentication privilege, role selection or backend invocation.
 *
 * A memory-only invitation is discarded when the tab goes into the background,
 * page leaves the BFCache, network goes offline, an unrelated route is opened,
 * Auth signs out, or the lifecycle is detached. Users may revisit the
 * unauthenticated access screen ONLY within the same foreground tab.
 */
import type { InviteLocation } from './inviteLinkRouting'
import { scrubInviteLocation, sanitizedInviteLink } from './inviteLinkRouting'
import type { createInviteSessionCandidate } from './inviteSessionCandidate'

type Session = Pick<ReturnType<typeof createInviteSessionCandidate>,
  'onAuthEvent' | 'onLeave'>
type Events = Pick<EventTarget, 'addEventListener' | 'removeEventListener'>

export type InviteBrowserHost = Readonly<{
  browser: Events
  document: Events & { readonly visibilityState: string }
  readLocation: () => InviteLocation
  replaceUrl: (cleanUrl: string) => void
  subscribeAuth: (callback: (event: string) => void) => () => void
}>

const allowedRoutes = new Set([
  '#/auth/aceptar-invitacion', '#/acceso', '#/acceso/mecanico'
])
const canonicalInviteUrl = '/#/auth/aceptar-invitacion'

export function createInviteBrowserLifecycleCandidate(
  session: Session,
  host: InviteBrowserHost
) {
  let attached = false
  let unsubscribe: (() => void) | undefined

  function onNavigation() {
    try {
      const location = host.readLocation()
      const cleaned = sanitizedInviteLink(location)
      if (cleaned && location.pathname + location.search + location.hash !== canonicalInviteUrl) {
        // A NEW token-bearing URL is never interpreted by this lifecycle.
        // Scrub it first and discard the old token. Only an explicit fresh
        // capture may create a new memory-only invitation in the future.
        scrubInviteLocation(location, host.replaceUrl)
        session.onLeave()
        return
      }
      if (location.pathname !== '/' || location.search !== '' ||
          !allowedRoutes.has(location.hash))
        session.onLeave()
    } catch {
      // A failed replaceState or inaccessible location must never allow
      // a token to survive a navigation.
      session.onLeave()
    }
  }

  function onVisibility() {
    if (host.document.visibilityState !== 'visible') session.onLeave()
  }

  function onPageShow(event: Event) {
    // Browser back/forward cache may restore a JS heap with stale Auth.
    if ((event as Event & { persisted?: boolean }).persisted === true)
      session.onLeave()
  }

  const leave = () => { session.onLeave() }
  function onAuth(event: string) { session.onAuthEvent(event) }

  function detach() {
    if (attached) {
      attached = false
      for (const event of ['hashchange', 'popstate'])
        host.browser.removeEventListener(event, onNavigation)
      for (const event of ['pagehide', 'beforeunload', 'offline'])
        host.browser.removeEventListener(event, leave)
      host.browser.removeEventListener('pageshow', onPageShow)
      host.document.removeEventListener('visibilitychange', onVisibility)
      try { unsubscribe?.() } catch { /* keep local invitation invalidated */ }
      unsubscribe = undefined
    }
    session.onLeave()
  }

  function attach(): () => void {
    if (attached) return detach
    attached = true
    for (const event of ['hashchange', 'popstate'])
      host.browser.addEventListener(event, onNavigation)
    for (const event of ['pagehide', 'beforeunload', 'offline'])
      host.browser.addEventListener(event, leave)
    host.browser.addEventListener('pageshow', onPageShow)
    host.document.addEventListener('visibilitychange', onVisibility)
    try {
      unsubscribe = host.subscribeAuth(onAuth)
    } catch {
      detach()
      return detach
    }
    onNavigation()
    return detach
  }

  return Object.freeze({ attach, detach })
}
