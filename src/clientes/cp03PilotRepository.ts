/**
 * BT-CP03-P2 · Candidate repository on real supabase-js Data API syntax.
 * NOT wired to Render, React, Android or an operational Supabase table.
 *
 * Only a FUTURE explicitly approved caller may supply a logged-in client
 * with publishable key and context from AuthController. Every operation
 * rechecks getUser + active membership + active workshop. These UX checks
 * do not replace PostgreSQL RLS or grants; all mutations use client JWT.
 * Service keys are never used.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Context, Role } from '../auth/controller'
import {
  DirectoryFailure, UUID, customerPayload, vehiclePayload, normalizedPlate,
  validSearch, escapeLike, type CustomerInput, type VehicleInput,
  type CustomerRecord, type VehicleRecord
} from './cp03PilotContracts'

const customerColumns =
  'workshop_id,id,full_name,email,mobile_e164,notes,archived_at,updated_at,created_at'
const vehicleColumns =
  'workshop_id,id,customer_id,plate,plate_key,make,model,model_year,odometer_km,archived_at,updated_at,created_at'
const writeRoles: readonly Role[] = ['owner', 'admin', 'reception']
function failure(error: unknown): never {
  const code = (error as { code?: string } | null)?.code
  if (code === '23505') throw new DirectoryFailure('duplicate')
  if (code === '23503' || code === '23514' || code === '22P02')
    throw new DirectoryFailure('invalid')
  if (code === '42501' || code === 'PGRST301') throw new DirectoryFailure('denied')
  throw new DirectoryFailure('unavailable')
}
function checkRow<T extends { workshop_id: string; id: string }>(row: unknown, workshopId: string): T {
  if (!row || typeof row !== 'object' || Array.isArray(row) ||
      (row as T).workshop_id !== workshopId ||
      typeof (row as T).id !== 'string' || !UUID.test((row as T).id))
    throw new DirectoryFailure('unavailable')
  return row as T
}
function checkMany<T extends { workshop_id: string; id: string }>(
  rows: unknown, workshopId: string
): T[] {
  if (!Array.isArray(rows)) throw new DirectoryFailure('unavailable')
  return rows.map(row => checkRow<T>(row, workshopId))
}
export function cp03PilotRepository(client: SupabaseClient, context: Context) {
  const workshopId = context.workshop.id
  if (!UUID.test(workshopId) || !UUID.test(context.userId))
    throw new DirectoryFailure('denied')
  const tenant = workshopId.toLowerCase()
  let epoch = 0
  let invalidated = false
  function dispose() { invalidated = true; epoch++ }
  async function guard(write: boolean): Promise<number> {
    if (invalidated) throw new DirectoryFailure('denied')
    // No trusted role is selected by the browser: verify exact server row.
    const current = epoch
    try {
      const { data: identity, error: authError } = await client.auth.getUser()
      if (authError || !identity.user || !identity.user.email_confirmed_at ||
          identity.user.id !== context.userId) throw new DirectoryFailure('denied')
      const { data: member, error: memberError } = await client
        .from('workshop_memberships')
        .select('user_id,workshop_id,role,status')
        .eq('workshop_id', tenant).eq('user_id', context.userId)
        .eq('status', 'active').maybeSingle()
      if (memberError) failure(memberError)
      if (!member || member.user_id !== context.userId ||
          member.workshop_id !== tenant || member.status !== 'active' ||
          member.role !== context.role ||
          (write && !writeRoles.includes(member.role as Role)))
        throw new DirectoryFailure('denied')
      const { data: workshop, error: workshopError } = await client
        .from('workshops').select('id,status')
        .eq('id', tenant).eq('status', 'active').maybeSingle()
      if (workshopError) failure(workshopError)
      if (!workshop || workshop.id !== tenant || workshop.status !== 'active')
        throw new DirectoryFailure('denied')
      if (invalidated || epoch !== current) throw new DirectoryFailure('denied')
      return current
    } catch (error) {
      if (error instanceof DirectoryFailure) throw error
      throw new DirectoryFailure('unavailable')
    }
  }
  function stillValid(version: number) {
    if (invalidated || epoch !== version) throw new DirectoryFailure('denied')
  }
  async function search(term: string): Promise<{
    customers: CustomerRecord[]; vehicles: VehicleRecord[]
  }> {
    const value = validSearch(term)
    const version = await guard(false)
    const foundCustomer = client.from('customers').select(customerColumns)
      .eq('workshop_id', tenant).is('archived_at', null)
    const customerQuery = value.includes('@')
      ? foundCustomer.eq('email', value.toLowerCase())
      : value.startsWith('+') ? foundCustomer.eq('mobile_e164', value)
      : foundCustomer.ilike('full_name', '%' + escapeLike(value) + '%')
    const customerResult = await customerQuery.limit(25)
    if (customerResult.error) failure(customerResult.error)
    const customers = checkMany<CustomerRecord>(customerResult.data, tenant)
    const plateKey = normalizedPlate(value)
    let vehicles: VehicleRecord[] = []
    if (/^[A-Z0-9]{5,8}$/.test(plateKey)) {
      const result = await client.from('vehicles').select(vehicleColumns)
        .eq('workshop_id', tenant).eq('plate_key', plateKey)
        .is('archived_at', null).limit(25)
      if (result.error) failure(result.error)
      vehicles = checkMany<VehicleRecord>(result.data, tenant)
    }
    stillValid(version)
    return { customers, vehicles }
  }
  async function getCustomer(id: string): Promise<CustomerRecord | null> {
    if (!UUID.test(id)) throw new DirectoryFailure('invalid')
    const version = await guard(false)
    const result = await client.from('customers').select(customerColumns)
      .eq('workshop_id', tenant).eq('id', id.toLowerCase())
      .is('archived_at', null).maybeSingle()
    if (result.error) failure(result.error)
    stillValid(version)
    return result.data ? checkRow<CustomerRecord>(result.data, tenant) : null
  }
  async function getVehicle(id: string): Promise<VehicleRecord | null> {
    if (!UUID.test(id)) throw new DirectoryFailure('invalid')
    const version = await guard(false)
    const result = await client.from('vehicles').select(vehicleColumns)
      .eq('workshop_id', tenant).eq('id', id.toLowerCase())
      .is('archived_at', null).maybeSingle()
    if (result.error) failure(result.error)
    stillValid(version)
    return result.data ? checkRow<VehicleRecord>(result.data, tenant) : null
  }
  async function vehiclesForCustomer(customerId: string): Promise<VehicleRecord[]> {
    if (!UUID.test(customerId)) throw new DirectoryFailure('invalid')
    const version = await guard(false)
    const result = await client.from('vehicles').select(vehicleColumns)
      .eq('workshop_id', tenant).eq('customer_id', customerId.toLowerCase())
      .is('archived_at', null).order('created_at', { ascending: false }).limit(50)
    if (result.error) failure(result.error)
    stillValid(version)
    return checkMany<VehicleRecord>(result.data, tenant)
  }
  async function createCustomer(input: CustomerInput): Promise<CustomerRecord> {
    const payload = customerPayload(input)
    const version = await guard(true)
    const result = await client.from('customers')
      .insert({ workshop_id: tenant, ...payload })
      .select(customerColumns).single()
    if (result.error) failure(result.error)
    stillValid(version)
    return checkRow<CustomerRecord>(result.data, tenant)
  }
  async function createVehicle(input: VehicleInput): Promise<VehicleRecord> {
    const payload = vehiclePayload(input)
    const version = await guard(true)
    const result = await client.from('vehicles')
      .insert({ workshop_id: tenant, ...payload })
      .select(vehicleColumns).single()
    if (result.error) failure(result.error)
    stillValid(version)
    const row = checkRow<VehicleRecord>(result.data, tenant)
    if (row.customer_id !== payload.customer_id)
      throw new DirectoryFailure('unavailable')
    return row
  }
  async function updateCustomer(
    id: string, expectedUpdatedAt: string, input: CustomerInput
  ): Promise<CustomerRecord> {
    if (!UUID.test(id) || !Number.isFinite(Date.parse(expectedUpdatedAt)))
      throw new DirectoryFailure('invalid')
    const payload = customerPayload(input)
    const version = await guard(true)
    const result = await client.from('customers').update(payload)
      .eq('workshop_id', tenant).eq('id', id.toLowerCase())
      .eq('updated_at', expectedUpdatedAt).is('archived_at', null)
      .select(customerColumns).maybeSingle()
    if (result.error) failure(result.error)
    stillValid(version)
    if (!result.data) throw new DirectoryFailure('conflict')
    return checkRow<CustomerRecord>(result.data, tenant)
  }
  async function updateVehicle(
    id: string, expectedUpdatedAt: string, input: VehicleInput
  ): Promise<VehicleRecord> {
    if (!UUID.test(id) || !Number.isFinite(Date.parse(expectedUpdatedAt)))
      throw new DirectoryFailure('invalid')
    const payload = vehiclePayload(input)
    const version = await guard(true)
    const result = await client.from('vehicles').update(payload)
      .eq('workshop_id', tenant).eq('id', id.toLowerCase())
      .eq('updated_at', expectedUpdatedAt).is('archived_at', null)
      .select(vehicleColumns).maybeSingle()
    if (result.error) failure(result.error)
    stillValid(version)
    if (!result.data) throw new DirectoryFailure('conflict')
    const row = checkRow<VehicleRecord>(result.data, tenant)
    if (row.customer_id !== payload.customer_id)
      throw new DirectoryFailure('unavailable')
    return row
  }
  return Object.freeze({ search, getCustomer, getVehicle, vehiclesForCustomer, createCustomer,
    createVehicle, updateCustomer, updateVehicle, dispose })
}
