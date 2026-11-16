import { describe,it,expect } from 'vitest'
import { findingInput,orderInput,validPlateSearch,validOdometer,WorkOrderFailure,workMessage,inspectionResolutionLabel } from './cp04Contracts'
const a='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
describe('CP04: typed intake/inspection contracts',()=>{
  it('normalizes plate search and numeric intake',()=>{
    expect(validPlateSearch(' ab-1234 ')).toBe('AB1234')
    expect(orderInput({vehicle_id:a,complaint:'  Ruido al frenar  ',intake_odometer:12345}))
      .toEqual({vehicle_id:a,complaint:'Ruido al frenar',intake_odometer:12345})
    expect(validOdometer(null)).toBeNull()
  })
  it('does not allow empty notes for attention, cross-object invalid UUIDs or forged odometers',()=>{
    expect(()=>findingInput({order_id:a,vehicle_id:a,category:'Frenos',result:'attention',note:''}))
      .toThrow(WorkOrderFailure)
    expect(()=>orderInput({vehicle_id:'foreign',complaint:'Ruido',intake_odometer:null}))
      .toThrow(WorkOrderFailure)
    expect(()=>validOdometer(-1)).toThrow(WorkOrderFailure)
    expect(()=>validOdometer(3100000)).toThrow(WorkOrderFailure)
    expect(()=>validPlateSearch('%%')).toThrow(WorkOrderFailure)
  })
  it('preserves pending observations and distinguishes unreviewed from OK',()=>{
    expect(findingInput({order_id:a,vehicle_id:a,category:'Frenos',result:'attention',note:'Pastillas al límite'}).resolution).toBe('pending')
    expect(findingInput({order_id:a,vehicle_id:a,category:'Luces',result:'ok',note:null}).resolution).toBe('not_applicable')
    expect(findingInput({order_id:a,vehicle_id:a,category:'Motor',result:'not_checked',note:null}).result).toBe('not_checked')
  })
  it('shows original diagnosis separately from later repair resolution',()=>{
    expect(inspectionResolutionLabel({result:'attention',resolution:'pending'})).toBe('Reparación pendiente')
    expect(inspectionResolutionLabel({result:'attention',resolution:'resolved'})).toBe('Reparación resuelta')
    expect(inspectionResolutionLabel({result:'ok',resolution:'not_applicable'})).toBe('')
  })
  it('never exposes unexpected server errors to operator',()=>{
    expect(workMessage(new Error('password Bearer private@client.com')))
      .not.toMatch(/Bearer|private@|password/)
  })
})
