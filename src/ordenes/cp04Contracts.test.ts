import { describe,it,expect } from 'vitest'
import { findingInput,orderInput,validPlateSearch,validOdometer,WorkOrderFailure,workMessage,inspectionResolutionLabel,effectivePendingFindings,type Finding } from './cp04Contracts'
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
  it('later confirmed OK suppresses previous multipoint pending, not history',()=>{
    const original:Finding={id:a,workshop_id:a,vehicle_id:a,order_id:a,
      category:'Multipunto · Luces bajas',result:'attention',resolution:'pending',
      note:'Requiere atención',recorded_by:a,created_at:'2026-11-20T12:00:00.000001Z',
      updated_at:'2026-11-20T12:00:00.000001Z',resolved_at:null}
    const ok={...original,id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',result:'ok' as const,
      note:null,resolution:'not_applicable' as const,
      created_at:'2026-11-20T12:01:00.000001Z'}
    const history=[original,ok]
    expect(effectivePendingFindings(history)).toEqual([])
    expect(history).toHaveLength(2)
    expect(original.resolution).toBe('pending')
  })
  it('a new attention reopens the issue; later unreviewed cannot conceal it',()=>{
    const first:Finding={id:a,workshop_id:a,vehicle_id:a,order_id:a,
      category:'Multipunto · Luces bajas',result:'attention',resolution:'pending',
      note:'Observación',recorded_by:a,created_at:'2026-11-20T12:00:00.000001Z',
      updated_at:'2026-11-20T12:00:00.000001Z',resolved_at:null}
    const ok={...first,id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',result:'ok' as const,
      resolution:'not_applicable' as const,created_at:'2026-11-20T12:01:00.000001Z'}
    const again={...first,id:'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      created_at:'2026-11-20T12:02:00.000001Z'}
    const unreviewed={...first,id:'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      result:'not_checked' as const,resolution:'not_applicable' as const,
      created_at:'2026-11-20T12:03:00.000001Z'}
    expect(effectivePendingFindings([first,ok,again,unreviewed])).toEqual([again])
  })
  it('preserves broad legacy faults and isolates other vehicles/workshops',()=>{
    const first:Finding={id:a,workshop_id:a,vehicle_id:a,order_id:a,
      category:'Frenos',result:'attention',resolution:'pending',note:'Discos',
      recorded_by:a,created_at:'2026-11-20T12:00:00Z',
      updated_at:'2026-11-20T12:00:00Z',resolved_at:null}
    const second={...first,id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',note:'Pastillas'}
    const broadOk={...first,id:'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      result:'ok' as const,resolution:'not_applicable' as const}
    const mp={...first,id:'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      category:'Multipunto · Extintor'}
    const foreignOk={...mp,id:'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      workshop_id:'ffffffff-ffff-4fff-8fff-ffffffffffff',result:'ok' as const,
      resolution:'not_applicable' as const,created_at:'2026-11-20T12:01:00Z'}
    expect(effectivePendingFindings([first,second,broadOk,mp,foreignOk]).map(x=>x.id).sort())
      .toEqual([first.id,second.id,mp.id].sort())
  })
})
