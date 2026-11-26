import {afterEach,expect,it,vi} from 'vitest'
import {AuthController,type AuthGateway} from './controller'
import {rememberPrivateScreen,readPrivateScreen,clearPrivateScreen} from '../official/privateScreen'
const values=new Map<string,string>(),store={getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v)},removeItem:(k:string)=>{values.delete(k)}}
function gateway():AuthGateway{return {hasSession:async()=>true,getUser:async()=>({id:'a',confirmed:true}),signIn:async()=>{},signOut:async()=>{},subscribe:()=>()=>{},memberships:async()=>['one','two'].map(workshop_id=>({user_id:'a',workshop_id,role:'owner',status:'active'})),workshops:async()=>['one','two'].map(id=>({id,name:id,status:'active'})),workshopAccess:async()=>({operationsEnabled:true,documentsEnabled:true})}}
afterEach(()=>{values.clear();vi.unstubAllGlobals()})
it('restores selected workshop only after fresh server authorization, falling back safely after revocation',async()=>{
 vi.stubGlobal('window',{localStorage:store});const g=gateway(),first=new AuthController(g)
 await first.validate();expect(first.getSnapshot().phase).toBe('choose');await first.choose('two')
 const next=new AuthController(g);expect(next.getSnapshot().context).toBeUndefined();await next.validate();expect(next.getSnapshot().context?.workshop.id).toBe('two')
 g.workshops=async()=>[{id:'one',name:'one',status:'active'}];await next.validate();expect(next.getSnapshot().phase).toBe('choose');expect(next.getSnapshot().context).toBeUndefined();await next.choose('one');expect(next.getSnapshot().context?.workshop.id).toBe('one')
 await next.logout();expect(values.has('bt:workshop-hint:v1')).toBe(false)
})
it('never applies another operator hint or bypasses server failure',async()=>{
 vi.stubGlobal('window',{localStorage:store});values.set('bt:workshop-hint:v1',JSON.stringify({userId:'other',workshopId:'two'}));const g=gateway(),c=new AuthController(g)
 await c.validate();expect(c.getSnapshot().phase).toBe('choose');g.memberships=async()=>{throw Error('denied')};await c.validate();expect(c.getSnapshot().context).toBeUndefined()
})
it('keeps screen hints isolated per confirmed actor/workshop',()=>{
 rememberPrivateScreen('configuracion',store,'a:one');rememberPrivateScreen('clientes',store,'a:two')
 expect(readPrivateScreen(store,'a:one')).toBe('configuracion');expect(readPrivateScreen(store,'a:two')).toBe('clientes');expect(readPrivateScreen(store,'b:one')).toBe('inicio')
 clearPrivateScreen(store,'a:one');expect(readPrivateScreen(store,'a:one')).toBe('inicio');expect(readPrivateScreen(store,'a:two')).toBe('clientes')
})
