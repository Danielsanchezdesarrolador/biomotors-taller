import {describe,it,expect} from 'vitest'
import {
  multipuntoTemplateItems,multipuntoItemsFromFindings,
  multipuntoFinding,multipuntoSavedState,CP04_IMMEDIATE_PREFIX
} from './cp04Multipunto'
import type {Finding} from './cp04Contracts'
const a='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const row=(category:string,result:'ok'|'attention',note:string|null):Finding=>({
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
    row('Multipunto · Pastillas de freno','attention','Desgastadas')]
   const items=multipuntoItemsFromFindings(f)
   expect(items.find(i=>i.name==='Pastillas de freno')?.state).toBe('attention')
   expect(items.find(i=>i.name==='Discos de freno')?.state).toBe('unreviewed')
 })
})
