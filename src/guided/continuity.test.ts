import {describe,it,expect} from 'vitest'
import {inspectionEvidence,budgetMatches,scopeEvidence} from './continuity'
import {finalArchiveFixture} from '../../tests/fixtures/finalArchive'
import type {Bundle} from '../cp05/contracts'
import type {Finding} from '../ordenes/cp04Contracts'
async function fixture(){
 const {snapshot}=await finalArchiveFixture()
 const bundle={quote:snapshot.quote,items:snapshot.revision.payload.items,source:snapshot.revision.payload,revisions:[snapshot.revision],deliveries:[],events:[]} as Bundle
 const scope={workshopId:bundle.quote.workshop_id,orderId:bundle.quote.order_id,vehicleId:bundle.quote.vehicle_id}
 const finding={...scope,id:'finding',workshop_id:scope.workshopId,order_id:scope.orderId,vehicle_id:scope.vehicleId,category:'Motor',result:'attention',note:'Revisar ruido',resolution:'pending',created_at:'2026-01-01',updated_at:'2026-01-01'} as unknown as Finding
 return {bundle,revision:snapshot.revision,scope,finding}
}
describe('R1 partial inspection and explicit scope review',()=>{
 it('accepts recorded partial and historical inspections without fabricating unchecked components',async()=>{
  const f=await fixture()
  expect(inspectionEvidence([f.finding],f.scope)).toEqual({recorded:true,reviewed:1,notChecked:0,resolved:0})
  expect(inspectionEvidence([{...f.finding,result:'not_checked',resolution:'not_applicable'}],f.scope)).toEqual({recorded:true,reviewed:0,notChecked:1,resolved:0})
  expect(inspectionEvidence([],f.scope).recorded).toBe(false)
  expect(inspectionEvidence([{...f.finding,order_id:'other'}],f.scope).recorded).toBe(false)
 })
 it('does not equate an observation or resolution with an economic revision',async()=>{
  const f=await fixture(),base=scopeEvidence(f.bundle,f.revision,[f.finding],f.scope)
  const resolved={...f.finding,resolution:'resolved',updated_at:'2030-01-01'} as Finding
  expect(scopeEvidence(f.bundle,f.revision,[resolved],f.scope)).toBe(base)
  const edited={...resolved,note:'Observación ampliada sin cambio presupuestario'}
  expect(scopeEvidence(f.bundle,f.revision,[edited],f.scope)).not.toBe(base)
  expect(budgetMatches(f.bundle,f.revision)).toBe(true)
 })
 it('requires a new review for new findings even after their resolution, and detects changed budget items',async()=>{
  const f=await fixture(),base=scopeEvidence(f.bundle,f.revision,[f.finding],f.scope)
  expect(scopeEvidence(f.bundle,f.revision,[f.finding,{...f.finding,id:'new',resolution:'resolved'}],f.scope)).not.toBe(base)
  const changed=structuredClone(f.bundle);changed.items[0].unit_price++
  expect(budgetMatches(changed,f.revision)).toBe(false)
  expect(budgetMatches({...f.bundle,quote:{...f.bundle.quote,status:'draft'}},f.revision)).toBe(false)
  expect(budgetMatches({...f.bundle,quote:{...f.bundle.quote,issued_revision:2}},f.revision)).toBe(false)
 })
})
