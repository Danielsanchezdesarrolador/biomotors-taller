import type { InspectionState } from './ordenesData'
export type LineItem = { id: string; description: string; type: 'Repuesto' | 'Servicio' | 'Mano de obra'; quantity: number; price: number }
export const exampleItems: LineItem[] = [
  { id:'pastillas', description:'Pastillas de freno delanteras', type:'Repuesto', quantity:1, price:52900 },
  { id:'discos', description:'Rectificado de discos (par)', type:'Servicio', quantity:1, price:39900 },
  { id:'trabajo', description:'Mano de obra (sistema de frenos)', type:'Mano de obra', quantity:1.5, price:24900 },
]
export const inspectionItems = [
  ['aceite','Nivel de aceite de motor'], ['frenos','Sistema de frenos (pastillas y discos)'],
  ['neumaticos','Estado y presión de neumáticos'], ['bateria','Batería y sistema de carga'],
  ['suspension','Suspensión y dirección'], ['luces','Sistema de iluminación'],
  ['fluidos','Niveles de fluidos (refrigerante, frenos, etc.)'], ['correas','Correas y mangueras'],
] as const
export const initialInspection: Record<string, InspectionState> = { aceite:'correcto', frenos:'atencion', neumaticos:'correcto', bateria:'correcto', suspension:'atencion', luces:'correcto', fluidos:'no-revisado', correas:'no-revisado' }
export const inspectionLabels: Record<InspectionState,string> = { correcto:'Correcto', atencion:'Requiere atención', 'no-revisado':'Pendiente' }
export const completedInspections = (states: Record<string, InspectionState>) => inspectionItems.filter(([key]) => states[key] && states[key] !== 'no-revisado').length
export function calculateTotals(items: LineItem[]) {
  if (items.some(item => !Number.isFinite(item.quantity) || item.quantity <= 0 || !Number.isFinite(item.price) || item.price < 0)) throw new RangeError('Cantidad o precio inválido')
  const subtotal = items.reduce((sum,item) => sum + Math.round(item.quantity * item.price),0)
  const tax = Math.round(subtotal * .19)
  return { subtotal, tax, total:subtotal + tax }
}
export const clp = (value:number) => new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(value)
