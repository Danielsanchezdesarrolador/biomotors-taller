/** CP04 real multipoint adapter. The original 34-item X template is reused,
 * but no former session-based report data is imported. Each saved X is an
 * immutable inspection_findings visit record with real R1/RLS protection.
 *
 * The approved DB has attention/ok/not_checked only. "Cambio inmediato" is
 * represented as attention plus an explicit priority prefix in the note.
 */
import {categories,type Result,type InspectionItem} from '../informes/multipunto/multipuntoTemplate'
import type {Finding,NewFinding} from './cp04Contracts'
export const CP04_IMMEDIATE_PREFIX='PRIORIDAD INMEDIATA: '
export const multipuntoItemName=(name:string)=>'Multipunto · '+name
const template:InspectionItem[]=categories.flatMap(group=>
  group.items.map(([id,name],order)=>({
    id:group.id+'/'+id,category:group.id,name,order,
    state:'unreviewed' as const,note:''
  }))
)
export function multipuntoTemplateItems():InspectionItem[]{
 return template.map(x=>({...x}))
}
export function latestForMultipuntoItem(item:InspectionItem,findings:readonly Finding[]):Finding|null{
  const category=multipuntoItemName(item.name)
  for(let i=findings.length-1;i>=0;i--)if(findings[i].category===category)return findings[i]
  return null
}
export function multipuntoSavedState(row:Finding|null):Result{
  if(!row)return 'unreviewed'
  if(row.result==='ok')return 'ok'
  if(row.result==='attention')
    return row.note?.startsWith(CP04_IMMEDIATE_PREFIX)?'immediate':'attention'
  return 'unreviewed'
}
export function multipuntoItemsFromFindings(findings:readonly Finding[]):InspectionItem[]{
  return template.map(item=>{
    const row=latestForMultipuntoItem(item,findings)
    return {...item,state:multipuntoSavedState(row),note:row?.note??''}
  })
}
export function multipuntoFinding(
  itemId:string,state:Result,note:string,orderId:string,vehicleId:string
):NewFinding {
  const item=template.find(i=>i.id===itemId)
  if(!item||state==='unreviewed')throw Error('Selecciona primero una casilla con X.')
  const text=note.trim()
  if((state==='attention'||state==='immediate')&&text.length<3)
    throw Error('Agrega una observación técnica para este problema.')
  const saved=state==='immediate'?CP04_IMMEDIATE_PREFIX+text:text
  if(saved.length>2000)throw Error('Observación demasiado larga.')
  return {
    order_id:orderId,vehicle_id:vehicleId,
    category:multipuntoItemName(item.name),
    result:state==='ok'?'ok':'attention',
    note:saved||null
  }
}
