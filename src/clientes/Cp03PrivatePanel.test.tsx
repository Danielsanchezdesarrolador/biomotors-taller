import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { AuthController } from '../auth/controller'
import { Cp03PrivatePanel } from './Cp03PrivatePanel'

describe('CP03 private Auth bridge; no public access without private flag',()=>{
  it('renders only loading during SSR and never constructs another SDK client',()=>{
    const controller=new AuthController(null,'Acceso inactivo')
    const html=renderToStaticMarkup(<Cp03PrivatePanel controller={controller}/>)
    expect(html).toContain('Abriendo fichas del taller autorizado')
    expect(html).not.toMatch(/Registrar cliente|Guardar ficha|sb_secret_/)
  })
  it('AuthController without a verified gateway cannot produce a directory client',async()=>{
    const controller=new AuthController(null,'Acceso inactivo')
    expect(await controller.directoryClient()).toBeNull()
  })
})
