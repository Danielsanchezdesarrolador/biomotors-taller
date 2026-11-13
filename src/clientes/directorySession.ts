import {
  demoClients,
  demoVehicles,
  validateRegistration,
  type DemoClient,
  type DemoVehicle,
  type RegistrationDraft
} from './clientesData'
import { validateVisitaDraft, type VisitaDraft } from './registroVisitaData'
import { sessionChanged } from '../session/sessionSignal'
export function addSessionClient(draft: RegistrationDraft): DemoClient {
  const errors = validateRegistration(draft)
  if (Object.keys(errors).length) throw new Error(Object.values(errors).join(' '))
  if (demoClients.some((c) => c.email.toLowerCase() === draft.email.trim().toLowerCase()))
    throw new Error('Ya existe una ficha con ese correo DEMO. Selecciona la ficha existente.')
  const client: DemoClient = {
    id: 'customer-demo-' + crypto.randomUUID(),
    emailVerified: false,
    name: draft.name.trim(),
    phone: draft.phone,
    email: draft.email.trim(),
    address: draft.address || 'No indicada',
    commune: draft.commune || 'No indicada',
    status: 'Pendiente',
    lastVisit: 'Sin visitas'
  }
  demoClients.push(client)
  sessionChanged()
  return client
}
export type ReceptionInput = {
  clientId?: string
  vehicleId?: string
  draft: VisitaDraft
  date: string
  requestId?: string
}
export function validateReception(input: ReceptionInput): string[] {
  const client = input.clientId ? demoClients.find((c) => c.id === input.clientId) : undefined
  const vehicle = input.vehicleId ? demoVehicles.find((v) => v.id === input.vehicleId) : undefined
  const errors: string[] = []
  if (input.clientId && !client) errors.push('Cliente DEMO inexistente.')
  if (input.vehicleId && (!vehicle || !client || vehicle.clientId !== client.id))
    errors.push(
      'El vehículo no pertenece a la ficha seleccionada. Confirma la relación; la patente no acredita propiedad.'
    )
  const draft = client
    ? {
        ...input.draft,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        commune: client.commune
      }
    : input.draft
  const checked = vehicle
    ? {
        ...draft,
        brand: vehicle.description.split(' ')[0],
        model: vehicle.description.split(' · ')[0],
        year: vehicle.description.split(' · ')[1] ?? '',
        plate: ''
      }
    : draft
  errors.push(...Object.values(validateVisitaDraft(checked)))
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) errors.push('Confirma la fecha de ingreso.')
  if (
    !client &&
    demoClients.some((c) => c.email.toLowerCase() === draft.email.trim().toLowerCase())
  )
    errors.push(
      'Ya existe una ficha con ese correo. Busca el cliente registrado; no se fusionarán fichas automáticamente.'
    )
  if (
    !vehicle &&
    draft.plate.trim() &&
    demoVehicles.some(
      (v) =>
        v.plate.replace(/\W/g, '').toLowerCase() === draft.plate.replace(/\W/g, '').toLowerCase()
    )
  )
    errors.push(
      'Esa patente ya figura en otra ficha. Revisa y selecciona el vehículo por su cliente e ID; no se asignará automáticamente.'
    )
  return errors
}
// Preflight all fields before publishing either entity, so failed reception adds nothing.
export function receiveDirectory(input: ReceptionInput) {
  const errors = validateReception(input)
  if (errors.length) throw new Error(errors.join(' '))
  const d = input.draft
  let client = demoClients.find((c) => c.id === input.clientId),
    vehicle = demoVehicles.find((v) => v.id === input.vehicleId)
  const newClient = !client,
    newVehicle = !vehicle
  client ??= {
    id: 'customer-demo-' + crypto.randomUUID(),
    emailVerified: false,
    name: d.name.trim(),
    phone: d.phone,
    email: d.email.trim(),
    address: d.address || 'No indicada',
    commune: d.commune || 'No indicada',
    status: 'Pendiente',
    lastVisit: 'Sin visitas'
  }
  vehicle ??= {
    id: 'vehicle-demo-' + crypto.randomUUID(),
    clientId: client.id,
    plate: d.plate.trim().toUpperCase() || 'No indicada',
    description: d.brand.trim() + ' ' + d.model.trim() + ' · ' + d.year,
    mileage: Number(d.mileage),
    status: 'Activo'
  } satisfies DemoVehicle
  if (newClient) demoClients.push(client)
  if (newVehicle) demoVehicles.push(vehicle)
  sessionChanged()
  return { client, vehicle }
}
