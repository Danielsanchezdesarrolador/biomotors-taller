import {describe,it,expect,vi} from 'vitest'
import {readCp04Draft,writeCp04Draft,clearCp04Draft,emptyCp04Draft} from './cp04Draft'
const scope={userId:'11111111-1111-4111-8111-111111111111',workshopId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'}
function tab(){const map=new Map<string,string>();return {map,store:{
  getItem:vi.fn((k:string)=>map.get(k)??null),
  setItem:vi.fn((k:string,v:string)=>{map.set(k,v)}),
  removeItem:vi.fn((k:string)=>{map.delete(k)})
}}}
describe('CP04 same-tab draft lifecycle',()=>{
 it('restores unsent intake and inspection text without Auth tokens',()=>{
   const {map,store}=tab()
   const draft={...emptyCp04Draft,plate:'AA1234',complaint:'Ruido en baches',note:'Revisar amortiguadores'}
   expect(writeCp04Draft(scope,draft,store,100)).toBe(true)
   expect(readCp04Draft(scope,store,101)).toEqual(draft)
   expect([...map.values()][0]).not.toMatch(/token|password|service_role|access_key/)
 })
 it('rejects another user/workshop and discards expired drafts',()=>{
   const {store}=tab()
   writeCp04Draft(scope,emptyCp04Draft,store,100)
   expect(readCp04Draft({...scope,workshopId:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'},store,101)).toBeNull()
   writeCp04Draft(scope,emptyCp04Draft,store,100)
   expect(readCp04Draft(scope,store,100+8*60*60*1000+1)).toBeNull()
 })
 it('clears after save and signout and validates record shape',()=>{
   const {store}=tab()
   expect(writeCp04Draft(scope,{...emptyCp04Draft,note:'a'.repeat(2001)},store,100)).toBe(false)
   writeCp04Draft(scope,emptyCp04Draft,store,100)
   clearCp04Draft(store)
   expect(readCp04Draft(scope,store,101)).toBeNull()
 })
})
