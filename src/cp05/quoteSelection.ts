/**
 * Restore which CP05 quote was open across same-tab navigation and temporary
 * Auth revalidation. Stores IDs only, never client/vehicle data or credentials.
 * This hint grants no permission: repository.load always checks Auth and RLS.
 */
import { UUID } from '../clientes/cp03PilotContracts'

const key = 'bt:cp05:selected-quote:v1'
const ttl = 8 * 60 * 60 * 1000
type Store = Pick<Storage,'getItem'|'setItem'|'removeItem'>

function browserStore(): Store | null {
  try { return typeof window === 'undefined' ? null : window.sessionStorage }
  catch { return null }
}

export function rememberQuoteSelection(
  userId: string, workshopId: string, quoteId: string,
  store: Store | null = browserStore(), now = Date.now()
): void {
  if (![userId, workshopId, quoteId].every(value => UUID.test(value))) return
  try {
    store?.setItem(key, JSON.stringify({ userId, workshopId, quoteId, at: now }))
  } catch { /* no storage permission: current panel continues working */ }
}

export function readQuoteSelection(
  userId: string, workshopId: string,
  store: Store | null = browserStore(), now = Date.now()
): string | null {
  try {
    const raw = store?.getItem(key)
    if (!raw) return null
    const row: unknown = JSON.parse(raw)
    if (row && typeof row === 'object' && !Array.isArray(row)) {
      const v = row as Record<string, unknown>
      if (v.userId === userId && v.workshopId === workshopId
        && typeof v.quoteId === 'string' && UUID.test(v.quoteId)
        && typeof v.at === 'number' && Number.isFinite(v.at)
        && now >= v.at && now - v.at < ttl) return v.quoteId
    }
  } catch { /* ignore invalid or unavailable hint */ }
  return null
}

export function clearQuoteSelection(store: Store | null = browserStore()): void {
  try { store?.removeItem(key) } catch { /* best effort */ }
}
