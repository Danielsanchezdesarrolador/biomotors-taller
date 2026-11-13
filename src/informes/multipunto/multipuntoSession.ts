import type { MultipuntoReport } from './multipuntoData'
// URLs belong to this page-memory cache, not to a mounted editor. Returning to a
// draft retains photos. Removal/discard revokes URLs; reload releases the page.
const reports = new Map<string, MultipuntoReport>()
export function rememberMultipunto(report: MultipuntoReport) {
  reports.set(report.id, structuredClone(report))
}
export function readMultipunto(id: string) {
  const r = reports.get(id)
  return r ? structuredClone(r) : undefined
}
export function listMultipunto() {
  return [...reports.values()].map((r) => ({
    id: r.id,
    orderId: r.orderId,
    client: r.client,
    finalized: r.finalized
  }))
}
export function discardMultipunto(id: string) {
  const r = reports.get(id)
  r?.photos.forEach((p) => URL.revokeObjectURL(p.url))
  reports.delete(id)
}
