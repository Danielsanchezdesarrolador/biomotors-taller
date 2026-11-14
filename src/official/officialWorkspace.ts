// Presentation only: no tenant, actor, API client, seeds or writable repository.
// Data entry stays unavailable until the separately authorized backend is ready.
const empty: readonly never[] = Object.freeze([])
export const officialWorkspace = Object.freeze({
  clients: empty,
  vehicles: empty,
  orders: empty,
  documents: empty,
  visits: empty,
  observations: empty,
  members: empty,
  history: empty
})
export const preparationNotice =
  'Estamos preparando el acceso seguro y el guardado permanente. Por ahora no ingreses datos de clientes ni vehículos reales.'
export const unavailableReason =
  'Disponible cuando se habiliten el acceso seguro y el guardado permanente.'
