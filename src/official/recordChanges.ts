/** Same-session invalidation only; never an authority or persisted customer data. */
export type RecordChange = {workshopId: string; resource: string; id: string; action: string}
const listeners = new Set<(change: RecordChange) => void>()
export function recordChanged(change: RecordChange) {for (const listener of listeners) {try {listener(change)} catch { /* A confirmed write remains successful even if a subscriber fails. */ }}}
export function onRecordChange(listener: (change: RecordChange) => void) {listeners.add(listener); return () => {listeners.delete(listener)}}
