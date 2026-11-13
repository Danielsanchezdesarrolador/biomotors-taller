import { createDocument, documentContext } from '../documentosData'
import { calculateTotals, clp, exampleItems, type LineItem } from '../../ordenes/detalleData'
import { loadDemoSettings } from '../../configuracion/settingsSession'
import { listMultipunto, readMultipunto } from '../multipunto/multipuntoSession'
export type WorkMode = 'quote' | 'work'
export type WorkItem = Omit<LineItem, 'type'> & {
  type: LineItem['type'] | 'Insumo'
  performed: boolean
}
export type WorkState = 'Borrador' | 'Pendiente de revisión' | 'Aprobado DEMO' | 'Finalizado DEMO'
export type WorkDocument = {
  id: string
  mode: WorkMode
  workshopId: 'workshop-demo'
  orderId: string
  clientId: string
  vehicleId: string
  date: string
  validDays: number
  terms: string
  comments: string
  diagnosis: string
  recommendations: string
  items: WorkItem[]
  status: WorkState
  revision: number
  saved: boolean
  approval: null | { name: string; date: string; total: number; revision: number; simulation: true }
  inspection: null | {
    id: string
    items: { id: string; name: string; state: string; note: string }[]
    observations: string
  }
  workshop: {
    name: string
    address: string
    phone: string
    email: string
    logo: string | null
    footer: string
  }
}
export type WorkRequest = { mode: WorkMode; orderId: string; draftId?: string }
export const workModes: Record<WorkMode, string> = {
  quote: 'Cotización',
  work: 'Informe de trabajo'
}
export const itemTypes: WorkItem['type'][] = ['Repuesto', 'Insumo', 'Mano de obra', 'Servicio']
export const currency = (value: number) => clp(value) + ' CLP'
export function createWorkDocument(orderId: string, mode: WorkMode): WorkDocument {
  const source = createDocument('source', 'Cotización', orderId),
    { order } = documentContext(source),
    settings = loadDemoSettings()
  return {
    id:
      (mode === 'quote' ? 'COT' : 'ITR') + '-DEMO-' + crypto.randomUUID().slice(0, 8).toUpperCase(),
    mode,
    workshopId: 'workshop-demo',
    orderId,
    clientId: source.clientId,
    vehicleId: source.vehicleId,
    date: new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(new Date()),
    validDays: 10,
    terms:
      'Repuestos sujetos a disponibilidad (DEMO).\nCondiciones de garantía por acordar con el taller.\nNo incluye trabajos ni repuestos adicionales no detallados.',
    comments: '',
    diagnosis: order.diagnosis,
    recommendations: order.recommendation,
    items: source.items.map((i) => ({ ...i, id: crypto.randomUUID(), performed: false })),
    status: 'Borrador',
    revision: 0,
    saved: false,
    approval: null,
    inspection: null,
    workshop: {
      name: settings.branding.name,
      address: settings.profile.address,
      phone: settings.profile.phone,
      email: settings.profile.email,
      logo: settings.branding.logoDataUrl,
      footer: settings.branding.footer
    }
  }
}
export function validateItem(item: WorkItem) {
  if (!item.description.trim() || item.description.trim().length > 160)
    return 'Describe el ítem (1 a 160 caracteres).'
  if (!itemTypes.includes(item.type)) return 'Selecciona un tipo válido.'
  if (!Number.isFinite(item.quantity) || item.quantity <= 0 || item.quantity > 10000)
    return 'Cantidad mayor que cero y hasta 10.000.'
  if (!Number.isSafeInteger(item.price) || item.price < 0 || item.price > 100000000)
    return 'Precio entero entre $0 y $100.000.000 CLP.'
  return ''
}
export function includedItems(doc: WorkDocument) {
  return doc.mode === 'quote' ? doc.items : doc.items.filter((i) => i.performed)
}
export function workTotals(doc: WorkDocument) {
  const items = includedItems(doc)
  if (items.some((i) => validateItem(i))) throw new RangeError('Valores de ítem inválidos')
  // Insumo stays Insumo in the document. The existing calculator only reads quantity/price.
  return calculateTotals(
    items.map((i) => ({ ...i, type: i.type === 'Insumo' ? 'Repuesto' : i.type }))
  )
}
export type WorkPatch = Partial<
  Pick<
    WorkDocument,
    | 'date'
    | 'validDays'
    | 'terms'
    | 'comments'
    | 'diagnosis'
    | 'recommendations'
    | 'items'
    | 'inspection'
  >
>
export function editWorkDocument(doc: WorkDocument, patch: WorkPatch): WorkDocument {
  return {
    ...doc,
    ...structuredClone(patch),
    revision: doc.revision + 1,
    status: 'Borrador',
    approval: null,
    saved: false
  }
}
export function putWorkItem(doc: WorkDocument, item: WorkItem): WorkDocument {
  const error = validateItem(item)
  if (error) throw new Error(error)
  const normalize = (value: string) => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es-CL')
  if (
    doc.items.some(
      (i) =>
        i.id !== item.id &&
        i.type === item.type &&
        normalize(i.description) === normalize(item.description)
    )
  )
    throw new Error(
      'Este ítem ya existe. Edita su cantidad para evitar una duplicación accidental.'
    )
  const items = doc.items.some((i) => i.id === item.id)
    ? doc.items.map((i) =>
        i.id === item.id ? { ...item, description: item.description.trim() } : i
      )
    : [...doc.items, { ...item, description: item.description.trim() }]
  return editWorkDocument(doc, { items })
}
export function validateWorkDocument(doc: WorkDocument) {
  documentContext(doc)
  const errors: string[] = []
  if (!/^\d{4}-\d{2}-\d{2}$/.test(doc.date)) errors.push('Completa la fecha del documento.')
  if (!doc.items.length) errors.push('Agrega al menos un ítem.')
  if (doc.items.some((i) => validateItem(i)))
    errors.push('Revisa las cantidades, precios y descripciones.')
  if (doc.mode === 'work' && !includedItems(doc).length)
    errors.push('Marca expresamente al menos un trabajo como realizado.')
  if (!Number.isInteger(doc.validDays) || doc.validDays < 1 || doc.validDays > 365)
    errors.push('Vigencia entre 1 y 365 días.')
  if (!doc.terms.trim() || doc.terms.length > 2000)
    errors.push('Completa las condiciones (hasta 2.000 caracteres).')
  if (doc.comments.length > 500 || doc.diagnosis.length > 2500 || doc.recommendations.length > 2500)
    errors.push('Revisa el límite de los textos técnicos.')
  return errors
}
export function reviewWorkDocument(doc: WorkDocument): WorkDocument {
  const errors = validateWorkDocument(doc)
  if (errors.length) throw new Error(errors.join(' '))
  return { ...doc, status: 'Pendiente de revisión', saved: true }
}
export function approveWorkDemo(doc: WorkDocument, consent: boolean): WorkDocument {
  if (!consent) throw new Error('Confirma que la acción es una simulación sin validez legal.')
  if (doc.approval) throw new Error('La simulación de esta revisión ya está registrada.')
  const reviewed = reviewWorkDocument(doc),
    { client } = documentContext(doc)
  return {
    ...reviewed,
    status: doc.mode === 'quote' ? 'Aprobado DEMO' : 'Finalizado DEMO',
    approval: {
      name: client.name,
      date: new Date().toISOString(),
      total: workTotals(doc).total,
      revision: doc.revision,
      simulation: true
    }
  }
}
export const workTemplates = [
  { id: 'brakes', name: 'Revisión de frenos · ejemplo DEMO', items: exampleItems },
  {
    id: 'maintenance',
    name: 'Mantención · ejemplo DEMO',
    items: [
      {
        id: 'oil',
        description: 'Aceite de motor · muestra',
        type: 'Repuesto' as const,
        quantity: 1,
        price: 45000
      },
      {
        id: 'supplies',
        description: 'Insumos de mantención · muestra',
        type: 'Insumo' as const,
        quantity: 1,
        price: 12000
      },
      {
        id: 'labor',
        description: 'Mano de obra de mantención · muestra',
        type: 'Mano de obra' as const,
        quantity: 1,
        price: 24900
      }
    ]
  }
]
export function loadWorkTemplate(doc: WorkDocument, id: string): WorkDocument {
  const template = workTemplates.find((t) => t.id === id)
  if (!template) throw new Error('Plantilla DEMO inexistente.')
  return editWorkDocument(doc, {
    items: template.items.map((i) => ({ ...i, id: crypto.randomUUID(), performed: false }))
  })
}
export function availableInspections(doc: WorkDocument) {
  return listMultipunto().filter((r) => r.orderId === doc.orderId)
}
export function attachInspection(doc: WorkDocument, id: string): WorkDocument {
  const report = readMultipunto(id)
  if (
    !report ||
    report.workshopId !== doc.workshopId ||
    report.orderId !== doc.orderId ||
    report.clientId !== doc.clientId ||
    report.vehicleId !== doc.vehicleId
  )
    throw new Error('La inspección no pertenece a esta OT, cliente y vehículo.')
  return editWorkDocument(doc, {
    inspection: {
      id: report.id,
      items: report.items.map((i) => ({ id: i.id, name: i.name, state: i.state, note: i.note })),
      observations: report.observations
    }
  })
}
export function localWorkSummary(doc: WorkDocument) {
  return `${workModes[doc.mode]} ${doc.id}\nDEMO · Datos ficticios · ${doc.status}\n${includedItems(doc).length} ítems · Total: ${currency(workTotals(doc).total)}\nSin envío, firma ni autorización legal. Sin enlace público.`
}
