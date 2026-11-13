import {
  crearSolicitudDemo,
  solicitudesDemoIniciales,
  type VisitaDraft
} from './registroVisitaData'
import { sessionChanged } from '../session/sessionSignal'
const requests = structuredClone(solicitudesDemoIniciales)
export function sessionRequests() {
  return structuredClone(requests)
}
export function addSessionRequest(draft: VisitaDraft) {
  const r = crearSolicitudDemo(draft, 'sol-local-' + crypto.randomUUID())
  requests.unshift(r)
  sessionChanged()
  return r
}
