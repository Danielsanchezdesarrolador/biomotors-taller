import {describe,it,expect} from 'vitest'
import {
  multipuntoTemplateItems,multipuntoItemsFromFindings,
  multipuntoFinding,multipuntoSavedState,CP04_IMMEDIATE_PREFIX
} from './cp04Multipunto'
import type {Finding} from './cp04Contracts'
const a='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const row=(category:string,result:'ok'|'attention'|'not_checked',note:string|null):Finding=>({
  workshop_id:a,id:a,order_id:a,vehicle_id:a,category,result,note,
  resolution:result==='attention'?'pending':'not_applicable',
  resolved_at:null,recorded_by:a,created_at:'2026-11-15T10:00:00Z',
  updated_at:'2026-11-15T10:00:00Z'
})
describe('CP04 live X multipoint checklist',()=>{
 it('shares the original complete template without copying personal/demo data',()=>{
   const list=multipuntoTemplateItems()
   expect(list.length).toBeGreaterThanOrEqual(34)
   expect(list.some(i=>i.name==='Pastillas de freno')).toBe(true)
   expect(list.some(i=>i.name==='Amortiguadores')).toBe(true)
   expect(list.every(i=>i.state==='unreviewed')).toBe(true)
 })
 it('saves OK and attention to real CP04 findings without requiring schema changes',()=>{
   const item=multipuntoTemplateItems().find(i=>i.name==='Pastillas de freno')!
   expect(multipuntoFinding(item.id,'ok','',a,a)).toMatchObject({
     category:'Multipunto · Pastillas de freno',result:'ok',note:null
   })
   expect(()=>multipuntoFinding(item.id,'attention','',a,a)).toThrow()
   expect(multipuntoFinding(item.id,'attention','Desgastadas',a,a).result).toBe('attention')
 })
 it('preserves urgent priority clearly across reload, without claiming an unsupported DB enum',()=>{
   const item=multipuntoTemplateItems().find(i=>i.name==='Amortiguadores')!
   const finding=multipuntoFinding(item.id,'immediate','Reemplazo urgente',a,a)
   expect(finding.result).toBe('attention')
   expect(finding.note).toBe(CP04_IMMEDIATE_PREFIX+'Reemplazo urgente')
   expect(multipuntoSavedState(row(finding.category,finding.result,finding.note)))
      .toBe('immediate')
 })
 it('restores latest saved X for item, never turns broad legacy Frenos into all OK',()=>{
   const f=[row('Frenos','ok',null),row('Multipunto · Pastillas de freno','ok',null),
    {...row('Multipunto · Pastillas de freno','attention','Desgastadas'),id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',created_at:'2026-11-15T10:01:00Z'}]
   const items=multipuntoItemsFromFindings(f)
   expect(items.find(i=>i.name==='Pastillas de freno')?.state).toBe('attention')
   expect(items.find(i=>i.name==='Discos de freno')?.state).toBe('unreviewed')
 })
})

describe('CP04 deterministic visit selection',()=>{
 it('uses timestamp microseconds then ID, never input order or note update time',()=>{
   const old={...row('Multipunto · Pastillas de freno','attention','Desgastadas'),id:'ffffffff-ffff-4fff-8fff-ffffffffffff',created_at:'2026-11-24T10:00:00.000001Z',updated_at:'2026-11-25T10:00:00Z'}
   const ok={...old,id:a,result:'ok' as const,note:null,created_at:'2026-11-24T07:00:00.000002-03:00'}
   for(const history of [[old,ok],[ok,old]])expect(multipuntoItemsFromFindings(history).find(i=>i.name==='Pastillas de freno')?.state).toBe('ok')
   const tie={...ok,id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',result:'not_checked' as const}
   expect(multipuntoItemsFromFindings([tie,ok]).find(i=>i.name==='Pastillas de freno')?.state).toBe('unreviewed')
 })
 it('requires a visit scope for mixed orders and never borrows another vehicle or workshop X',()=>{
   const old=row('Multipunto · Pastillas de freno','attention','Observación previa')
   const other={...old,id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',order_id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',result:'ok' as const}
   const rows=[old,other,{...other,workshop_id:other.order_id},{...other,vehicle_id:other.order_id}]
   expect(multipuntoItemsFromFindings(rows).find(i=>i.name==='Pastillas de freno')?.state).toBe('unreviewed')
   expect(multipuntoItemsFromFindings(rows,{workshopId:a,vehicleId:a,orderId:a}).find(i=>i.name==='Pastillas de freno')?.state).toBe('attention')
 })
 it('hides and never re-saves a legacy provisional technical note on OK',()=>{
   const provisional='Detalle técnico pendiente de completar'
   const old=row('Multipunto · Pastillas de freno','ok',provisional)
   expect(multipuntoItemsFromFindings([old]).find(i=>i.name==='Pastillas de freno')?.note).toBe('')
   const item=multipuntoTemplateItems().find(i=>i.name==='Pastillas de freno')!
   expect(multipuntoFinding(item.id,'ok',provisional,a,a).note).toBeNull()
 })
})
