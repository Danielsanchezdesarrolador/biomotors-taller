import type { DemoDocument, DeliveryEvent } from './documentosData'
type ReportSession={documents:DemoDocument[];events:DeliveryEvent[];selectedId:string}
let current:ReportSession|undefined
// Pure page memory, discarded on reload. No storage or network calls.
export function readReportSession(){return current?structuredClone(current):undefined}
export function saveReportSession(session:ReportSession){current=structuredClone(session)}
