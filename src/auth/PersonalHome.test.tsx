import {describe,it,expect} from 'vitest'
import {renderToStaticMarkup} from 'react-dom/server'
import {AuthController} from './controller'
import {PersonalHome} from './PersonalHome'
describe('PLAN04 personal home without a workshop',()=>{
 it('gives a verified Basic account a useful home without inventing membership or payments',()=>{
  const html=renderToStaticMarkup(<PersonalHome controller={new AuthController(null)} name="Cuenta propia" plan={{scope:'personal',effectivePlan:'basic',personalPlan:'basic',isLifetime:false,expiresAt:null,workshopId:null}}/>)
  expect(html).toContain('Plan Básico');expect(html).toContain('Explorar la interfaz pública')
  expect(html).not.toContain('Panel del creador');expect(html).not.toContain('Crear mi taller')
 })
 it('never claims Full when the server plan lookup failed',()=>{
  const html=renderToStaticMarkup(<PersonalHome controller={new AuthController(null)} plan={null}/>)
  expect(html).toContain('Plan no disponible');expect(html).not.toContain('Full activo')
 })
})
