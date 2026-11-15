/**
 * BT-CP03-P2 · Pilot directory: customer and vehicle records, not DEMO.
 * Schema contract: docs/sql/BT_CP03_P1_CUSTOMERS_VEHICLES_CANDIDATE.sql
 * OFFLINE until SQL, real permissions and operator approval are verified.
 * Never import from App, OfficialPanels, main or the public bundle.
 */
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export type CustomerRecord = Readonly<{
  workshop_id: string; id: string; full_name: string; email: string | null
  mobile_e164: string | null; notes: string | null; archived_at: string | null
  updated_at: string; created_at: string
}>
export type VehicleRecord = Readonly<{
  workshop_id: string; id: string; customer_id: string; plate: string | null
  plate_key: string | null; make: string; model: string
  model_year: number | null; odometer_km: number | null
  archived_at: string | null; updated_at: string; created_at: string
}>
export type CustomerInput = {
  full_name: string
  email?: string | null
  mobile_e164?: string | null
  notes?: string | null
}
export type VehicleInput = {
  customer_id: string
  plate?: string | null
  make: string
  model: string
  model_year?: number | null
  odometer_km?: number | null
}

export class DirectoryFailure extends Error {
  constructor(public readonly kind: 'invalid' | 'denied' | 'duplicate' | 'conflict' | 'unavailable') {
    super(kind) // Never contain SQL, token, address, emails or personal records.
    this.name = 'DirectoryFailure'
  }
}
const invalid = () => new DirectoryFailure('invalid')
function length(value: unknown, min: number, max: number): value is string {
  return typeof value === 'string' && value.trim().length >= min &&
    value.trim().length <= max
}
export function normalizedPlate(value: string): string {
  // Not a vehicle identity. A unique plate is scoped to the SAME workshop.
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}
/** Chilean mobile search accepts 9XXXXXXXX, 569XXXXXXXX or +56 9XXXXXXXX. */
export function normalizedPhoneSearch(value: string): string | null {
  const candidate = value.trim()
  if (!/^[+()0-9\s-]+$/.test(candidate)) return null
  const compact = candidate.replace(/[()\s-]/g, '')
  const phone = compact.startsWith('+56') ? compact
    : compact.startsWith('56') ? '+' + compact
    : compact.startsWith('9') ? '+56' + compact
    : ''
  return /^\+569[0-9]{8}$/.test(phone) ? phone : null
}
function optionalText(input: unknown, max: number): string | null {
  if (input == null || input === '') return null
  if (typeof input !== 'string' || input.trim().length > max) throw invalid()
  return input.trim() || null
}
export function customerPayload(input: CustomerInput) {
  if (!length(input.full_name, 2, 120)) throw invalid()
  const full_name = input.full_name.trim()
  const email = optionalText(input.email, 254)?.toLowerCase() ?? null
  if (email && (email.length < 5 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))
    throw invalid()
  const rawPhone = optionalText(input.mobile_e164, 24)
  const phone = rawPhone?.replace(/[\s()-]/g, '') ?? null
  const mobile_e164 = phone
    ? phone.startsWith('+56') ? phone : phone.startsWith('56') ? '+' + phone :
      phone.startsWith('9') ? '+56' + phone : phone
    : null
  if (mobile_e164 && !/^\+569\d{8}$/.test(mobile_e164)) throw invalid()
  return { full_name, email, mobile_e164, notes: optionalText(input.notes, 1000) }
}
export function vehiclePayload(input: VehicleInput) {
  if (!UUID.test(input.customer_id) || !length(input.make, 2, 80) ||
      !length(input.model, 1, 80)) throw invalid()
  const plate = optionalText(input.plate, 14)?.toUpperCase() ?? null
  if (plate && (plate.length < 5 || !/^[A-Z0-9]{5,8}$/.test(normalizedPlate(plate))))
    throw invalid()
  const model_year = input.model_year ?? null
  const odometer_km = input.odometer_km ?? null
  if (model_year !== null && (!Number.isInteger(model_year) || model_year < 1900 || model_year > 2100))
    throw invalid()
  if (odometer_km !== null && (!Number.isInteger(odometer_km) || odometer_km < 0 ||
      odometer_km > 3_000_000)) throw invalid()
  return { customer_id: input.customer_id.toLowerCase(), plate, make: input.make.trim(),
    model: input.model.trim(), model_year, odometer_km }
}
export function validSearch(value: string): string {
  if (typeof value !== 'string' || value.trim().length < 2 || value.trim().length > 80)
    throw invalid()
  return value.trim()
}
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&')
}
