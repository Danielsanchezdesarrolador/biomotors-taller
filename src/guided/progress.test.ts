import {describe,it,expect} from 'vitest'
import {confirmedStage,canOpen,type Evidence} from './progress'
describe('server projection and pilot access',()=>{
 it('resumes each stage from confirmed records only',()=>{
  const e:Evidence={order:false,inspection:false,issued:false,approval:false,execution:false,handover:false,archive:false}
  expect(confirmedStage(e)).toBe(1)
  for(const [key,stage] of [['order',2],['inspection',3],['issued',4],['approval',5],['execution',6],['handover',7],['archive',7]] as const){e[key]=true;expect(confirmedStage(e)).toBe(stage)}
 })
 it('does not infer earlier steps from later flags',()=>{expect(confirmedStage({order:true,inspection:false,issued:true,approval:true,execution:true,handover:true,archive:true})).toBe(2)})
 it('limits access to approved active pilot and administrative roles',()=>{
 const workshop={id:'c943ad51-6d90-447b-8aa7-68866f69a4bc',status:'active'}
 expect(canOpen({role:'owner',workshop})).toBe(true)
 expect(canOpen({role:'admin',workshop})).toBe(true)
 for(const role of ['mechanic','reception'])expect(canOpen({role,workshop})).toBe(false)
 expect(canOpen({role:'owner',workshop:{...workshop,id:'other'}})).toBe(false)
 expect(canOpen({role:'owner',workshop:{...workshop,status:'inactive'}})).toBe(false)
 })
})
