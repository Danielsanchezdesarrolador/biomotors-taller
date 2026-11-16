import { createDocument, documentContext } from '../documentosData'
import { loadDemoSettings } from '../../configuracion/settingsSession'
import { readOrderRevision } from '../../ordenes/orderSession'
import type { InspectionState } from '../../ordenes/ordenesData'
import { categories, type Result, type InspectionItem } from './multipuntoTemplate'
export { categories, resultLabels, results } from './multipuntoTemplate'
export type { Result, InspectionItem } from './multipuntoTemplate'
export type Photo = { id: string; name: string; size: number; url: string; itemId: string }
export type MultipuntoReport = {
  id: string
  workshopId: 'workshop-demo'
  orderId: string
  clientId: string
  vehicleId: string
  client: string
  vehicle: string
  plate: string
  mileage: number
  technician: string
  reason: string
  brand: string
  model: string
  year: string
  fuel: string
  date: string
  visitDate: string
  start: string
  end: string
  workshop: {
    name: string
    address: string
    phone: string
    email: string
    logo: string | null
    footer: string
  }
  items: InspectionItem[]
  observations: string
  photos: Photo[]
  saved: boolean
  finalized: boolean
  closedWithPending: boolean
}
export const legacyResult = (state: InspectionState): Result =>
  state === 'correcto' ? 'ok' : state === 'atencion' ? 'attention' : 'unreviewed'
// Only the oil LEVEL is equivalent. Broad groups (brakes, suspension, lights,
// fluids, tyres, belts) cannot certify each individual component in this sheet.
export const exactLegacyMap: Record<string, string> = { 'aceite-motor': 'aceite' }
export function adaptInspection(legacy: Record<string, InspectionState>): InspectionItem[] {
  return categories.flatMap((c) =>
    c.items.map(([id, name], order) => ({
      id,
      category: c.id,
      name,
      order,
      state:
        exactLegacyMap[id] && legacy[exactLegacyMap[id]]
          ? legacyResult(legacy[exactLegacyMap[id]])
          : 'unreviewed',
      note: ''
    }))
  )
}
export function counts(items: InspectionItem[]) {
  const values = { unreviewed: 0, ok: 0, attention: 0, immediate: 0 }
  for (const item of items) values[item.state]++
  return { ...values, total: items.length, reviewed: items.length - values.unreviewed }
}
export function setResult(report: MultipuntoReport, id: string, state: Result): MultipuntoReport {
  return {
    ...report,
    saved: false,
    finalized: false,
    closedWithPending: false,
    items: report.items.map((i) => (i.id === id ? { ...i, state } : i))
  }
}
export function reportStatus(r: MultipuntoReport) {
  return r.finalized
    ? 'Finalizado DEMO'
    : r.saved
      ? 'Borrador'
      : counts(r.items).unreviewed === 0
        ? 'Listo para finalizar'
        : 'En edición'
}
function visitDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const numeric = value.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (numeric) return `${numeric[3]}-${numeric[2]}-${numeric[1]}`
  const nov = value.match(/^(\d{1,2}) nov\.? (\d{4})$/)
  if (nov) return `${nov[2]}-11-${nov[1].padStart(2, '0')}`
  return ''
}
export function createMultipunto(orderId: string): MultipuntoReport {
  const doc = createDocument('source', 'Informe', orderId),
    { client, vehicle, order } = documentContext(doc),
    settings = loadDemoSettings()
  const [description, year] = vehicle.description.split(' · '),
    [brand, ...model] = description.split(' ')
  return {
    id: 'IMP-DEMO-' + crypto.randomUUID().slice(0, 8).toUpperCase(),
    workshopId: 'workshop-demo',
    orderId,
    clientId: client.id,
    vehicleId: vehicle.id,
    client: client.name,
    vehicle: vehicle.description,
    plate: vehicle.plate,
    mileage: order.mileage,
    technician: order.technician,
    reason: order.symptoms,
    brand,
    model: model.join(' '),
    year: year ?? '',
    fuel: '',
    date: new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(new Date()),
    visitDate: visitDate(order.date),
    start: '',
    end: '',
    workshop: {
      name: settings.branding.name,
      address: settings.profile.address,
      phone: settings.profile.phone,
      email: settings.profile.email,
      logo: settings.branding.logoDataUrl,
      footer: settings.branding.footer
    },
    items: adaptInspection(readOrderRevision(order).inspection),
    observations: '',
    photos: [],
    saved: false,
    finalized: false,
    closedWithPending: false
  }
}
export function validateReport(r: MultipuntoReport): string[] {
  const errors: string[] = []
  if (!r.visitDate || !r.date) errors.push('Completa la fecha del informe y de la visita.')
  if (!r.start || !r.end) errors.push('Completa las horas de inicio y término.')
  else if (r.end < r.start)
    errors.push('La hora de término no puede ser anterior al inicio (visita del mismo día).')
  if (!r.fuel.trim()) errors.push('Completa el combustible del vehículo.')
  if (!r.technician.trim()) errors.push('Identifica al técnico responsable.')
  if (r.observations.length > 3000 || r.items.some((i) => i.note.length > 500))
    errors.push('Revisa la longitud de las observaciones.')
  documentContext(r)
  return errors
}
export function finalizeDemo(r: MultipuntoReport, acceptPending: boolean): MultipuntoReport {
  const errors = validateReport(r)
  if (errors.length) throw new Error(errors.join(' '))
  if (counts(r.items).unreviewed && !acceptPending)
    throw new Error('Confirma expresamente el cierre con pendientes o continúa la revisión.')
  return { ...r, finalized: true, saved: true, closedWithPending: counts(r.items).unreviewed > 0 }
}
export function validatePhoto(file: Pick<File, 'type' | 'size'>, current: number) {
  if (current >= 6) return 'Máximo 6 fotografías por informe.'
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    return 'Usa fotografías JPG, PNG o WebP.'
  if (file.size === 0 || file.size > 5 * 1024 * 1024)
    return 'Cada foto debe pesar entre 1 byte y 5 MB.'
  return ''
}
