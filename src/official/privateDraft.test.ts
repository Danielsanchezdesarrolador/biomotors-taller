import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearCp03Draft,DRAFT_TTL_HOURS,readCp03Draft,writeCp03Draft, type Cp03Draft } from './privateDraft'
const u='11111111-1111-4111-8111-111111111111'
const w='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const scope={userId:u,workshopId:w}
const draft:Cp03Draft={
  editor:'new-customer',customerId:null,vehicleId:null,expectedUpdatedAt:null,
  customerDraft:{full_name:'Cliente de prueba',email:'',mobile_e164:'',notes:''},
  vehicleDraft:{plate:'',make:'',model:'',model_year:'',odometer_km:''}
}
function tab(){
  const data=new Map<string,string>()
  return {data,port:{
    getItem:vi.fn((key:string)=>data.get(key)??null),
    setItem:vi.fn((key:string,value:string)=>{data.set(key,value)}),
    removeItem:vi.fn((key:string)=>{data.delete(key)})
  }}
}
beforeEach(()=>clearCp03Draft(null))
describe('CP03 temporary draft: tab only, no Supabase writes or stored Auth',()=>{
  it('roundtrips typed customer form after unmount/focus; does not save consent',()=>{
    const {data,port}=tab()
    expect(writeCp03Draft(scope,draft,port,100)).toBe(true)
    expect(readCp03Draft(scope,port,101)).toEqual(draft)
    const value=[...data.values()][0]
    expect(value).not.toMatch(/confirmed|password|access_token|refresh_token|service_role/)
    expect(value).toContain('Cliente de prueba')
  })
  it('rejects another user or workshop and deletes old draft',()=>{
    const {port,data}=tab()
    writeCp03Draft(scope,draft,port,100)
    expect(readCp03Draft({...scope,workshopId:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'},port,101)).toBeNull()
    expect(data.size).toBe(0)
    writeCp03Draft(scope,draft,port,100)
    expect(readCp03Draft({...scope,userId:'22222222-2222-4222-8222-222222222222'},port,101)).toBeNull()
  })
  it('expires at 8 hours and clears malformed, old or oversized values',()=>{
    const {port,data}=tab()
    writeCp03Draft(scope,draft,port,100)
    expect(readCp03Draft(scope,port,100+DRAFT_TTL_HOURS*60*60*1000+1)).toBeNull()
    const key='bt:cp03:temporary-draft:v1'
    data.set(key,'{invalid')
    expect(readCp03Draft(scope,port,100)).toBeNull()
    const invalid={...draft,customerDraft:{...draft.customerDraft,notes:'a'.repeat(1001)}}
    expect(writeCp03Draft(scope,invalid as Cp03Draft,port,100)).toBe(false)
    expect(data.size).toBe(0)
  })
  it('keeps interrupted vehicle edits including their server revision, never trust a new revision',()=>{
    const {port}=tab()
    const editing:Cp03Draft={...draft,editor:'edit-vehicle',customerId:w,
      vehicleId:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      expectedUpdatedAt:'2026-11-15T20:00:00.000Z',
      vehicleDraft:{plate:'QA1234',make:'MarcaDemo',model:'ModeloDemo',model_year:'2020',odometer_km:'12345'}}
    expect(writeCp03Draft(scope,editing,port,100)).toBe(true)
    expect(readCp03Draft(scope,port,101)).toEqual(editing)
  })
  it('clears after signout/save and supports memory fallback if tab storage is unavailable',()=>{
    const {port,data}=tab()
    writeCp03Draft(scope,draft,port,100)
    clearCp03Draft(port)
    expect(data.size).toBe(0)
    expect(readCp03Draft(scope,port,101)).toBeNull()
    const blocked={getItem:()=>{throw Error('blocked')},setItem:()=>{throw Error('blocked')},
      removeItem:()=>{throw Error('blocked')}}
    expect(writeCp03Draft(scope,draft,blocked,100)).toBe(true)
    expect(readCp03Draft(scope,blocked,101)).toEqual(draft)
    clearCp03Draft(blocked)
    expect(readCp03Draft(scope,blocked,102)).toBeNull()
  })
})
