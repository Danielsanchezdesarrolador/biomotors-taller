import { emptyVisitaDraft, type VisitaDraft } from '../clientes/registroVisitaData'
import { sessionRequests } from '../clientes/intakeSession'
export type ReceptionDraft = {
  key: string
  step: 1 | 2 | 3
  clientMode: 'existing' | 'new'
  clientId: string
  vehicleId: string
  newVehicle: boolean
  requestId?: string
  draft: VisitaDraft
  date: string
}
const drafts = new Map<string, ReceptionDraft>()
const cacheKey = (requestId?: string) => requestId || 'manual'
export function initialReception(requestId?: string): ReceptionDraft {
  const current = drafts.get(cacheKey(requestId))
  if (current) return structuredClone(current)
  const request = sessionRequests().find((r) => r.id === requestId),
    description = request?.vehicle.split(' · '),
    words = description?.[0].split(' ')
  return {
    key: 'VIS-DEMO-' + crypto.randomUUID(),
    step: 1,
    clientMode: request ? 'new' : 'existing',
    clientId: '',
    vehicleId: '',
    newVehicle: !!request,
    requestId,
    draft: request?.details
      ? { ...structuredClone(request.details), consent: false }
      : {
          ...emptyVisitaDraft,
          name: request?.name ?? '',
          brand: words?.[0] ?? '',
          model: words?.slice(1).join(' ') ?? '',
          year: description?.[1] ?? '',
          plate: request?.plate === 'No indicada' ? '' : (request?.plate ?? ''),
          mileage: request ? String(request.mileage) : '',
          clientReportedReason: request?.clientReportedReason ?? ''
        },
    date: new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(new Date())
  }
}
export function saveReceptionDraft(draft: ReceptionDraft) {
  drafts.set(cacheKey(draft.requestId), structuredClone(draft))
}
export function clearReceptionDraft(requestId?: string) {
  drafts.delete(cacheKey(requestId))
}
