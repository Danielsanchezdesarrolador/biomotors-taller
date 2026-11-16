/**
 * ByteTorque: remember only the visible navigation section in this browser.
 *
 * No user ID, workshop ID, customer/vehicle data, authorization state or
 * credentials are stored. Every visit still requires live R1 Auth/RLS.
 * localStorage lets a new tab opened from chat restore the section as well.
 */
import type { Screen } from '../layout/AppShell'

const key = 'bt:private-screen:v1'
const permitted: readonly Screen[] = ['inicio', 'ordenes', 'clientes', 'informes', 'configuracion']
type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function browserStore(): Store | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

export function readPrivateScreen(store: Store | null = browserStore()): Screen {
  try {
    const value = store?.getItem(key)
    return permitted.includes(value as Screen) ? value as Screen : 'inicio'
  } catch {
    return 'inicio'
  }
}

export function rememberPrivateScreen(screen: Screen, store: Store | null = browserStore()): void {
  if (!permitted.includes(screen)) return
  try {
    store?.setItem(key, screen)
  } catch {
    // Private browsing or blocked storage: navigation works in memory.
  }
}

export function clearPrivateScreen(store: Store | null = browserStore()): void {
  try {
    store?.removeItem(key)
  } catch {
    // Best effort; Auth itself remains the security boundary.
  }
}

/** Remove CP04 draft on explicit sign-out or workshop change. No auth secrets. */
export function clearOperationalDrafts():void {
  try { if(typeof window!=='undefined')
    {const store=window.sessionStorage
      store.removeItem('bt:cp04:temporary-draft:v1')
      for(let i=store.length-1;i>=0;i--){
        const key=store.key(i)
        if(key?.startsWith('bt:cp04:multipunto-autosave:v1:'))store.removeItem(key)
      }
    }
  } catch { /* blocked storage cannot authorize a session */ }
}
