import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuthState, Context } from '../auth/controller'
import {AuthController} from '../auth/controller'
import { cp03PilotAccessBinding } from './cp03PilotAccessBinding'

const A='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const B='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const U='11111111-1111-4111-8111-111111111111'
function fixture() {
  let state: AuthState = {phase:'checking',message:'Checking'}
  const callbacks = new Set<() => void>()
  const auth = {
    getSnapshot: () => state,
    subscribe: (cb: () => void) => {
      callbacks.add(cb)
      return () => {callbacks.delete(cb)}
    }
  }
  const set = (value: AuthState) => {
    state=value
    callbacks.forEach(cb=>cb())
  }
  const context = (workshopId=A, role: Context['role']='owner'): Context => ({
    userId:U,role,workshop:{id:workshopId,name:'Taller sintético',status:'active'}
  })
  const sdk = {
    auth:{getUser:vi.fn()},
    from:vi.fn()
  }
  return {auth,set,context,sdk:sdk as unknown as SupabaseClient, sdkSpy:sdk}
}
const allowed = (context: Context): AuthState => ({
  phase:context.role==='reception'?'restricted':'authorized',context,message:'Verified'
})
describe('BT-CP03-P4 · cierre fail-closed del repositorio al perder Auth (no publicado)', () => {
  it('retains the real Auth binding during routine checks, disposes it on confirmed revocation',async()=>{
    const f=fixture(),memberships=vi.fn(async()=>[{user_id:U,workshop_id:A,role:'owner',status:'active'}])
    const auth=new AuthController({hasSession:async()=>true,getUser:async()=>({id:U,confirmed:true}),
      signIn:async()=>{},signOut:async()=>{},memberships,workshops:async()=>[{id:A,name:'Taller sintético',status:'active'}],subscribe:()=>()=>{}})
    const binding=cp03PilotAccessBinding(auth,f.sdk)
    await auth.validate();const first=binding.getSnapshot()
    const check=auth.validate();expect(binding.getSnapshot()).toBe(first)
    await check;expect(binding.getSnapshot()).toBe(first)
    memberships.mockResolvedValue([]);await auth.validate()
    expect(binding.getSnapshot()).toBeNull()
    await expect(first!.repository.recentCustomers()).rejects.toMatchObject({kind:'denied'})
    binding.dispose()
  })
  it('no crea repositorio al montar sin identidad verificada', () => {
    const f=fixture(), binding=cp03PilotAccessBinding(f.auth,f.sdk)
    expect(binding.getSnapshot()).toBeNull()
    expect(f.sdkSpy.from).not.toHaveBeenCalled()
    expect(f.sdkSpy.auth.getUser).not.toHaveBeenCalled()
    binding.dispose()
  })
  it('crea solo con Auth autorizado y conserva instancia en estado idéntico', () => {
    const f=fixture(), binding=cp03PilotAccessBinding(f.auth,f.sdk)
    const notify=vi.fn()
    binding.subscribe(notify)
    f.set(allowed(f.context()))
    const first=binding.getSnapshot()
    expect(first?.context.workshop.id).toBe(A)
    expect(first?.repository).toBeDefined()
    f.set(allowed(f.context()))
    expect(binding.getSnapshot()).toBe(first)
    expect(notify).toHaveBeenCalledOnce()
    binding.dispose()
  })
  it('al pasar a checking elimina el acceso anterior sin consultar la API', async () => {
    const f=fixture(),binding=cp03PilotAccessBinding(f.auth,f.sdk)
    f.set(allowed(f.context()))
    const old=binding.getSnapshot()
    f.set({phase:'checking',message:'Verifying again'})
    expect(binding.getSnapshot()).toBeNull()
    await expect(old!.repository.recentCustomers()).rejects.toMatchObject({kind:'denied'})
    expect(f.sdkSpy.auth.getUser).not.toHaveBeenCalled()
    binding.dispose()
  })
  it.each(['anonymous','offline','signing-out','error','choose','no-membership'] as const)(
    'desactiva repositorio en fase %s y cancela uso del anterior', async phase => {
      const f=fixture(),binding=cp03PilotAccessBinding(f.auth,f.sdk)
      f.set(allowed(f.context()))
      const old=binding.getSnapshot()
      f.set({phase,message:'Blocked'})
      expect(binding.getSnapshot()).toBeNull()
      await expect(old!.repository.getCustomer(A)).rejects.toMatchObject({kind:'denied'})
      binding.dispose()
    }
  )
  it('cambia de taller y rol sin conservar el repositorio anterior', async () => {
    const f=fixture(),binding=cp03PilotAccessBinding(f.auth,f.sdk)
    f.set(allowed(f.context(A,'owner')))
    const previous=binding.getSnapshot()
    f.set(allowed(f.context(B,'mechanic')))
    expect(binding.getSnapshot()?.context.workshop.id).toBe(B)
    expect(binding.getSnapshot()?.context.role).toBe('mechanic')
    expect(binding.getSnapshot()?.repository).not.toBe(previous?.repository)
    await expect(previous!.repository.search('ABC')).rejects.toMatchObject({kind:'denied'})
    binding.dispose()
  })
  it('permite recepción solo como rol restricted de AuthController', () => {
    const f=fixture(),binding=cp03PilotAccessBinding(f.auth,f.sdk)
    f.set(allowed(f.context(A,'reception')))
    expect(binding.getSnapshot()?.context.role).toBe('reception')
    f.set({phase:'authorized',context:f.context(A,'reception'),message:'Not allowed'})
    expect(binding.getSnapshot()).toBeNull()
    binding.dispose()
  })
  it('no produce repo con rol declarado cuando el estado sigue anonymous', () => {
    const f=fixture(),binding=cp03PilotAccessBinding(f.auth,f.sdk)
    f.set({phase:'anonymous',context:f.context(),message:'No session'})
    expect(binding.getSnapshot()).toBeNull()
    binding.dispose()
  })
  it('dispose cierra el binding, evita restauración y elimina sus observadores', async () => {
    const f=fixture(),binding=cp03PilotAccessBinding(f.auth,f.sdk)
    const notify=vi.fn()
    binding.subscribe(notify)
    f.set(allowed(f.context()))
    const previous=binding.getSnapshot()
    binding.dispose()
    expect(binding.getSnapshot()).toBeNull()
    f.set(allowed(f.context(B)))
    expect(binding.getSnapshot()).toBeNull()
    expect(notify).toHaveBeenCalledTimes(2) // open, close
    await expect(previous!.repository.getVehicle(A)).rejects.toMatchObject({kind:'denied'})
  })
  it('el estado auth checking inicial no filtra datos al cambiar sin nuevo acceso', () => {
    const f=fixture(),binding=cp03PilotAccessBinding(f.auth,f.sdk)
    f.set({phase:'unconfirmed',message:'No confirmed email'})
    f.set({phase:'disabled',message:'Disabled'})
    expect(binding.getSnapshot()).toBeNull()
    expect(f.sdkSpy.auth.getUser).not.toHaveBeenCalled()
    binding.dispose()
  })
})
