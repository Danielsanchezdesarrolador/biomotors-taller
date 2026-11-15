import { describe, it, expect, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Context, Role } from '../auth/controller'
import {
  DirectoryFailure, customerPayload, vehiclePayload, normalizedPlate,
  validSearch, escapeLike
} from './cp03PilotContracts'
import { cp03PilotRepository } from './cp03PilotRepository'

const T = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const OTHER = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const U = '11111111-1111-4111-8111-111111111111'
const CUSTOMER = '33333333-3333-4333-8333-333333333333'
const VEHICLE = '44444444-4444-4444-8444-444444444444'
const timestamp = '2026-11-15T13:00:00.000Z'
const context = (role: Role = 'owner'): Context => ({
  userId: U, role, workshop: {id:T,name:'Synthetic Workshop A',status:'active'}
})
const customer = {
  workshop_id:T, id:CUSTOMER, full_name:'Cliente sintético',
  email:'pilot@example.test', mobile_e164:'+56912345678',
  notes:null, archived_at:null, created_at:timestamp, updated_at:timestamp
}
const vehicle = {
  workshop_id:T, id:VEHICLE, customer_id:CUSTOMER, plate:'AB1234',
  plate_key:'AB1234', make:'Kia', model:'Rio', model_year:2012,
  odometer_km:115000, archived_at:null, created_at:timestamp, updated_at:timestamp
}
type Operation = { table:string; kind:string; args: unknown[] }
function fixture(options: {
  role?: Role; authenticated?: boolean; member?: boolean
  memberRole?: Role; workshopActive?: boolean
  wrongTenant?: boolean; errorCode?: string; emptyUpdate?: boolean
} = {}) {
  const ops: Operation[] = []
  const user = vi.fn(async () => ({
    data: { user: options.authenticated === false ? null :
      { id: U, email_confirmed_at: timestamp } }, error:null
  }))
  const client = {
    auth: {getUser:user},
    from(table:string) {
      let action = 'read'
      let entity: Record<string, unknown> = {}
      const query: Record<string, unknown> = {}
      function method(kind: string) {
        return (...args: unknown[]) => {
          ops.push({table,kind,args})
          if (kind === 'insert' || kind === 'update') {
            action = kind
            entity = args[0] as Record<string, unknown>
          }
          return query
        }
      }
      for (const key of ['select','eq','is','ilike','limit','order','in',
        'insert','update']) query[key] = method(key)
      function response() {
        if (table === 'workshop_memberships')
          return {data:options.member === false ? null : {
            user_id:U,workshop_id:T,status:'active',
            role: options.memberRole ?? options.role ?? 'owner'
          },error:null}
        if (table === 'workshops')
          return {data:options.workshopActive === false ? null :
            {id:T,status:'active'},error:null}
        if (options.errorCode) return {data:null,error:{code:options.errorCode,message:'Sensitive SQL text'}}
        if (options.emptyUpdate && action === 'update') return {data:null,error:null}
        const row = table === 'customers' ? customer : vehicle
        if (action !== 'read') return {data:{...row,...entity},error:null}
        const qPlate = ops.some(o=>o.table===table&&o.kind==='eq'&&o.args[0]==='plate_key')
        return {data:table==='vehicles' && !qPlate ? [vehicle] : [row],error:null}
      }
      query.single = vi.fn(async () => response())
      query.maybeSingle = vi.fn(async () => response())
      query.then = (
        resolve:(result:ReturnType<typeof response>)=>unknown,
        reject?: (error:unknown)=>unknown
      ) => Promise.resolve(response()).then(resolve,reject)
      return query
    }
  }
  return { client:client as unknown as SupabaseClient, ops, user }
}
const expectFailure = async (promise: Promise<unknown>, kind: DirectoryFailure['kind']) => {
  await expect(promise).rejects.toMatchObject({name:'DirectoryFailure', kind})
}

describe('CP03-P2 · datos y validaciones, sin acceso a Supabase hospedado', () => {
  it('valida ficha y normaliza contacto chileno sin obligar correo', () => {
    expect(customerPayload({full_name:' Test Usuario ',mobile_e164:'9 1234 5678'}))
      .toEqual({full_name:'Test Usuario',email:null,mobile_e164:'+56912345678',notes:null})
    expect(customerPayload({full_name:' Test ',email:'TEST@EXAMPLE.TEST',mobile_e164:'56912345678'}).email)
      .toBe('test@example.test')
  })
  it('rechaza email, teléfono y texto inválidos', () => {
    for (const data of [
      {full_name:'X'}, {full_name:' Test ',email:'bad@email'},
      {full_name:' Test ', mobile_e164:'123456789'},
      {full_name:' Test ',notes:'n'.repeat(1001)}
    ]) expect(() => customerPayload(data)).toThrow(DirectoryFailure)
  })
  it('normaliza patente y campos del vehículo sin inventar datos', () => {
    expect(normalizedPlate(' ab-1234 ')).toBe('AB1234')
    expect(vehiclePayload({customer_id:CUSTOMER,plate:'ab-1234',
      make:' Kia ',model:' Rio ',odometer_km:0})).toMatchObject({
        plate:'AB-1234', customer_id:CUSTOMER,make:'Kia',model:'Rio',
        model_year:null,odometer_km:0
      })
  })
  it('rechaza UUID, patente, kilómetros y años fuera de rango', () => {
    for (const value of [
      {customer_id:'foreign',make:'Kia',model:'Rio'},
      {customer_id:CUSTOMER,make:'Kia',model:'Rio',plate:'$$$'},
      {customer_id:CUSTOMER,make:'Kia',model:'Rio',odometer_km:-1},
      {customer_id:CUSTOMER,make:'Kia',model:'Rio',model_year:2101}
    ]) expect(() => vehiclePayload(value)).toThrow(DirectoryFailure)
    expect(() => validSearch('%')).toThrow(DirectoryFailure)
    expect(escapeLike('A_B%')).toBe('A\\_B\\%')
  })
  it('exige Auth real confirmado y miembro activo antes de leer', async () => {
    for (const opts of [{authenticated:false},{member:false},{workshopActive:false}]) {
      const f = fixture(opts)
      const r = cp03PilotRepository(f.client,context())
      await expectFailure(r.search('Cliente'), 'denied')
      expect(f.ops.some(x=>x.table==='customers')).toBe(false)
    }
  })
  it('rechaza contexto elegido que no coincida con rol verificado', async () => {
    const f = fixture({memberRole:'mechanic'})
    const r = cp03PilotRepository(f.client,context('owner'))
    await expectFailure(r.search('Cliente'), 'denied')
    expect(f.ops.some(x=>x.table==='customers')).toBe(false)
    expect(() => cp03PilotRepository(f.client,
      {...context(),userId:'not-an-uuid'})).toThrow(DirectoryFailure)
  })
  it('busca cliente por nombre filtrando workshop y excluyendo archivados', async () => {
    const f = fixture()
    const r = cp03PilotRepository(f.client,context())
    expect((await r.search('Cliente')).customers).toMatchObject([customer])
    expect(f.ops).toEqual(expect.arrayContaining([
      {table:'customers',kind:'eq',args:['workshop_id',T]},
      {table:'customers',kind:'ilike',args:['full_name','%Cliente%']},
      {table:'customers',kind:'is',args:['archived_at',null]}
    ]))
    expect(f.ops.some(x=>x.kind==='delete')).toBe(false)
  })
  it('consulta patente normalizada exacta por workshop sin fusionar talleres', async () => {
    const f = fixture()
    const result = await cp03PilotRepository(f.client,context()).search('ab-1234')
    expect(result.vehicles).toMatchObject([vehicle])
    expect(f.ops).toEqual(expect.arrayContaining([
      {table:'vehicles',kind:'eq',args:['workshop_id',T]},
      {table:'vehicles',kind:'eq',args:['plate_key','AB1234']}
    ]))
  })
  it('consulta correo exacto sin inyectar condiciones OR PostgREST', async () => {
    const f=fixture()
    await cp03PilotRepository(f.client,context()).search('PILOT@EXAMPLE.TEST')
    expect(f.ops).toContainEqual({table:'customers',kind:'eq',args:['email','pilot@example.test']})
    expect(f.ops.some(op=>op.kind==='or')).toBe(false)
  })
  it('mecánico lee pero no puede crear ni editar', async () => {
    const f=fixture({role:'mechanic'})
    const r=cp03PilotRepository(f.client,context('mechanic'))
    expect((await r.vehiclesForCustomer(CUSTOMER)).length).toBe(1)
    await expectFailure(r.createCustomer({full_name:'Nuevo cliente'}),'denied')
    await expectFailure(r.createVehicle({customer_id:CUSTOMER,make:'Kia',model:'Rio'}),'denied')
    expect(f.ops.some(op=>op.kind==='insert')).toBe(false)
  })
  it('recepción puede registrar cliente y vehículo; jamás decide created_by o role', async () => {
    const f=fixture({role:'reception'})
    const r=cp03PilotRepository(f.client,context('reception'))
    expect((await r.createCustomer({full_name:'Cliente nuevo'})).id).toBe(CUSTOMER)
    expect((await r.createVehicle({customer_id:CUSTOMER,make:'Kia',model:'Rio'})).customer_id)
      .toBe(CUSTOMER)
    const writes=f.ops.filter(op=>op.kind==='insert')
    expect(writes).toHaveLength(2)
    for(const write of writes){
      const data=write.args[0] as Record<string,unknown>
      expect(data.workshop_id).toBe(T)
      expect(data).not.toHaveProperty('created_by')
      expect(data).not.toHaveProperty('role')
      expect(data).not.toHaveProperty('plan')
    }
  })
  it('edita por ID, workshop y updated_at; un 0 filas es conflicto, no éxito', async () => {
    const f=fixture()
    const r=cp03PilotRepository(f.client,context())
    await r.updateCustomer(CUSTOMER,timestamp,{full_name:'Actualizado'})
    await r.updateVehicle(VEHICLE,timestamp,{customer_id:CUSTOMER,make:'Kia',model:'Rio'})
    expect(f.ops).toContainEqual({table:'customers',kind:'eq',args:['updated_at',timestamp]})
    expect(f.ops).toContainEqual({table:'vehicles',kind:'eq',args:['updated_at',timestamp]})
    expect(f.ops.filter(o=>o.kind==='update')).toHaveLength(2)
    const empty=fixture({emptyUpdate:true})
    await expectFailure(cp03PilotRepository(empty.client,context())
      .updateCustomer(CUSTOMER,timestamp,{full_name:'Actualizado'}),'conflict')
  })
  it('no revela correos, tokens o SQL crudo si backend rechaza duplicado o permiso', async () => {
    for (const [code,kind] of [['23505','duplicate'],['23503','invalid'],
      ['42501','denied'],['XX000','unavailable']] as const) {
      const f=fixture({errorCode:code})
      const r=cp03PilotRepository(f.client,context())
      try {
        await r.createCustomer({full_name:'Persona Test'})
        throw new Error('Expected a failure')
      } catch (error) {
        expect(error).toBeInstanceOf(DirectoryFailure)
        expect((error as DirectoryFailure).kind).toBe(kind)
        expect(JSON.stringify(error)).not.toMatch(/Sensitive|SQL|pilot@example/)
      }
    }
  })
  it('rechaza una respuesta cruzada de tenant en lugar de mostrar otra ficha', async () => {
    const f=fixture({wrongTenant:true})
    const client=f.client
    const real=client.from.bind(client)
    vi.spyOn(client,'from').mockImplementation((table: never) => {
      const q=real(table) as unknown as {then: (r:(v:unknown)=>unknown)=>Promise<unknown>}
      if (table==='customers') {
        q.then=(resolve) => Promise.resolve(resolve({
          data:[{...customer,workshop_id:OTHER}],error:null
        }))
      }
      return q as never
    })
    await expectFailure(cp03PilotRepository(client,context()).search('Cliente'),'unavailable')
  })
  it('dispose invalida el repositorio tras cierre/cambio de cuenta', async () => {
    const f=fixture()
    const r=cp03PilotRepository(f.client,context())
    r.dispose()
    await expectFailure(r.search('Cliente'),'denied')
    expect(f.user).not.toHaveBeenCalled()
  })
})
