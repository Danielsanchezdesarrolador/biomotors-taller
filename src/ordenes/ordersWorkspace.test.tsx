import {describe,expect,it,vi} from 'vitest'
import {renderToStaticMarkup} from 'react-dom/server'
import {Cp04MultipuntoChecklist} from './Cp04MultipuntoChecklist'
import type {Cp04Port} from './Cp04OrdersView'

describe('Orders-only presentation boundary',()=>{
 it('keeps all 34 controls and requires an explicit opt-in, leaving existing callers unchanged',()=>{
  const unexpected=vi.fn(async()=>{throw Error('Presentation rendering must not read, write or generate documents')})
  const repository={createFinding:unexpected,updateFindingNote:unexpected,findingsForOrder:unexpected} as unknown as Cp04Port
  const scope={userId:'00000000-0000-4000-8000-000000000001',workshopId:'00000000-0000-4000-8000-000000000011',orderId:'00000000-0000-4000-8000-000000000201',vehicleId:'00000000-0000-4000-8000-000000000101'}
  const render=(workspacePresentation?:boolean)=>renderToStaticMarkup(<Cp04MultipuntoChecklist repository={repository} scope={scope} findings={[]} onSaved={()=>{}} onBack={()=>{}} disabled={false} readOnly={false} plate="QA1234" workspacePresentation={workspacePresentation}/>)
  const original=render(),orders=render(true)
  expect(original).not.toContain('cp04-inspection-progress')
  expect(original).not.toContain('cp04-current-state')
  expect(orders).toContain('0/34 componentes revisados')
  expect(orders).toContain('34 sin revisar')
  expect(original.match(/class="mp-row"/g)).toHaveLength(34)
  expect(orders.match(/class="mp-row"/g)).toHaveLength(34)
  expect(original.match(/type="radio"/g)).toHaveLength(102)
  expect(orders.match(/type="radio"/g)).toHaveLength(102)
  expect(unexpected).not.toHaveBeenCalled()
 })
})
