import type { WorkDocument } from './trabajosData'
// Same lifetime as the existing reportSession: this page only, no web storage.
const drafts = new Map<string, WorkDocument>()
export function rememberWorkDocument(doc: WorkDocument) {
  drafts.set(doc.id, structuredClone(doc))
}
export function readWorkDocument(id: string) {
  const d = drafts.get(id)
  return d ? structuredClone(d) : undefined
}
export function workDrafts() {
  return [...drafts.values()].map((d) => ({
    id: d.id,
    mode: d.mode,
    orderId: d.orderId,
    status: d.status
  }))
}
export function discardWorkDocument(id: string) {
  drafts.delete(id)
}
