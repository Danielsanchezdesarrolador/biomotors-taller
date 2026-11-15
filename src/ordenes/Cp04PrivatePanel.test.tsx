import {describe,it,expect} from 'vitest'
import {renderToStaticMarkup} from 'react-dom/server'
import {AuthController} from '../auth/controller'
import {Cp04PrivatePanel} from './Cp04PrivatePanel'
describe('CP04 private auth gate',()=>{
 it('SSR without authorized SDK exposes no directory/order form or credentials',()=>{
   const html=renderToStaticMarkup(<Cp04PrivatePanel controller={new AuthController(null,'Disabled')}/>)
   expect(html).toContain('Preparando órdenes')
   expect(html).not.toContain('Guardar orden en Supabase')
   expect(html).not.toContain('sb_secret_')
 })
})
