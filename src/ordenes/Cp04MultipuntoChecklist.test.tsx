import {describe,it,expect} from 'vitest'
import {renderToStaticMarkup} from 'react-dom/server'
import {MultipuntoTable} from '../informes/multipunto/MultipuntoTable'
import {multipuntoTemplateItems} from './cp04Multipunto'
describe('CP04 inline X controls',()=>{
 it('renders an independent row-status slot for every multipoint item',()=>{
   const html=renderToStaticMarkup(<MultipuntoTable
     items={multipuntoTemplateItems()}
     renderAfterRow={item=><small>Guardar automáticamente {item.id}</small>}/>)
   expect((html.match(/Guardar automáticamente /g)||[]).length).toBe(34)
   expect(html).toContain('Luces de neblina')
 })
})
