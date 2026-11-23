import {describe,it,expect} from 'vitest'
import {workspaceQuotes} from './workspacePresentation'
import type {Quote} from './contracts'
describe('CP05 authoritative visual state',()=>{
 it('replaces a stale sidebar entry with the same confirmed issued quote used by the header',()=>{
   const old={id:'q',version:2,status:'draft',issued_revision:0} as Quote
   const issued={...old,version:3,status:'issued' as const,issued_revision:1}
   const other={...old,id:'other'}
   const list=[old,other],next=workspaceQuotes(list,issued)
   expect(next).toEqual([issued,other]);expect(list[0]).toBe(old)
 })
 it('retains the confirmed active quote even if the independent recent list refresh failed',()=>{
   const q={id:'q',version:4,status:'draft',issued_revision:1} as Quote
   expect(workspaceQuotes([],q)).toEqual([q]);expect(workspaceQuotes([],null)).toEqual([])
 })
})
