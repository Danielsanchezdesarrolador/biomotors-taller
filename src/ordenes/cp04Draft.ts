/**
 * CP04 in-progress forms live only in the current tab for up to 8 hours.
 * Never store Auth tokens, saved customer records, or grant access based on
 * browser state. Scoped to the R1 verified user and active workshop.
 * Pilot use: synthetic vehicle/order descriptions ONLY until privacy approved.
 */
import { UUID } from '../clientes/cp03PilotContracts'
export type Cp04Draft = Readonly<{
  scrollY?: number
  selectedOrderId: string | null
  plate: string
  complaint: string
  intakeOdometer: string
  category: string
  result: 'ok' | 'attention' | 'not_checked'
  note: string
  /** Backwards compatible: older CP04 drafts have no multipoint editor state. */
  multipunto?: {
    open: boolean
    choice: {
      itemId: string | null
      state: 'unreviewed' | 'ok' | 'attention' | 'immediate'
      note: string
    }
  }
}>
type Scope = Readonly<{ userId: string; workshopId: string }>
type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
const key = 'bt:cp04:temporary-draft:v1',
  ttl = 8 * 60 * 60 * 1000
export const emptyCp04Draft: Cp04Draft = {
  selectedOrderId: null,
  plate: '',
  complaint: '',
  intakeOdometer: '',
  category: 'Frenos',
  result: 'not_checked',
  note: ''
}
function storage(): StoragePort | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage
  } catch {
    return null
  }
}
function valid(input: unknown): input is Cp04Draft {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return false
  const v = input as Record<string, unknown>
  return (
    (v.scrollY === undefined ||
      (typeof v.scrollY === 'number' &&
        Number.isFinite(v.scrollY) &&
        v.scrollY >= 0 &&
        v.scrollY <= 10000000)) &&
    (v.selectedOrderId === null ||
      (typeof v.selectedOrderId === 'string' && UUID.test(v.selectedOrderId))) &&
    typeof v.plate === 'string' &&
    v.plate.length <= 14 &&
    typeof v.complaint === 'string' &&
    v.complaint.length <= 2000 &&
    typeof v.intakeOdometer === 'string' &&
    v.intakeOdometer.length <= 10 &&
    typeof v.category === 'string' &&
    v.category.length <= 80 &&
    ['ok', 'attention', 'not_checked'].includes(String(v.result)) &&
    typeof v.note === 'string' &&
    v.note.length <= 2000 &&
    (v.multipunto === undefined ||
      (v.multipunto !== null &&
        typeof v.multipunto === 'object' &&
        typeof (v.multipunto as Record<string, unknown>).open === 'boolean' &&
        (() => {
          const data = (v.multipunto as Record<string, unknown>).choice
          if (!data || typeof data !== 'object' || Array.isArray(data)) return false
          const sel = data as Record<string, unknown>
          return (
            (sel.itemId === null ||
              (typeof sel.itemId === 'string' && /^[a-z-]+\/[a-z-]+$/.test(sel.itemId))) &&
            ['unreviewed', 'ok', 'attention', 'immediate'].includes(String(sel.state)) &&
            typeof sel.note === 'string' &&
            sel.note.length <= 1900
          )
        })()))
  )
}
export function clearCp04Draft(store: StoragePort | null = storage()) {
  try {
    store?.removeItem(key)
  } catch {
    /* best effort when blocked */
  }
}
export function readCp04Draft(
  scope: Scope,
  store: StoragePort | null = storage(),
  now = Date.now()
): Cp04Draft | null {
  try {
    const raw = store?.getItem(key)
    if (!raw) return null
    const v: unknown = JSON.parse(raw)
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const data = v as Record<string, unknown>
      if (
        data.userId === scope.userId &&
        data.workshopId === scope.workshopId &&
        UUID.test(scope.userId) &&
        UUID.test(scope.workshopId) &&
        typeof data.savedAt === 'number' &&
        now >= data.savedAt &&
        now - data.savedAt <= ttl &&
        valid(data.draft)
      )
        return data.draft
    }
  } catch {
    /* malformed or inaccessible */
  }
  clearCp04Draft(store)
  return null
}
export function writeCp04Draft(
  scope: Scope,
  draft: Cp04Draft,
  store: StoragePort | null = storage(),
  now = Date.now()
) {
  if (!UUID.test(scope.userId) || !UUID.test(scope.workshopId) || !valid(draft)) return false
  try {
    store?.setItem(
      key,
      JSON.stringify({
        userId: scope.userId,
        workshopId: scope.workshopId,
        savedAt: now,
        draft
      })
    )
    return store !== null
  } catch {
    return false
  }
}

/** Update only an existing scoped draft; never recreate one cleared by logout. */
export function rememberCp04Position(
  scope: Scope,
  scrollY: number,
  store: StoragePort | null = storage(),
  now = Date.now()
) {
  if (!Number.isFinite(scrollY) || scrollY < 0 || scrollY > 10000000) return false
  const draft = readCp04Draft(scope, store, now)
  return draft ? writeCp04Draft(scope, { ...draft, scrollY }, store, now) : false
}
