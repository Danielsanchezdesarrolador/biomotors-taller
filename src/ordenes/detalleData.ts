import { itemFixtures, inspectionFixture } from '#test-records'
import type { InspectionState } from './ordenesData'
export type LineItem = { id: string; description: string; type: 'Repuesto' | 'Servicio' | 'Mano de obra'; quantity: number; price: number }
export const exampleItems: LineItem[] = structuredClone(itemFixtures)

export const inspectionItems = [
  ['aceite','Nivel de aceite de motor'], ['frenos','Sistema de frenos (pastillas y discos)'],
  ['neumaticos','Estado y presión de neumáticos'], ['bateria','Batería y sistema de carga'],
  ['suspension','Suspensión y dirección'], ['luces','Sistema de iluminación'],
  ['fluidos','Niveles de fluidos (refrigerante, frenos, etc.)'], ['correas','Correas y mangueras'],
] as const
export const initialInspection: Record<string, InspectionState> = structuredClone(inspectionFixture)
export const inspectionLabels: Record<InspectionState,string> = { correcto:'Correcto', atencion:'Requiere atención', 'no-revisado':'Pendiente' }
export const completedInspections = (states: Record<string, InspectionState>) => inspectionItems.filter(([key]) => states[key] && states[key] !== 'no-revisado').length
export { calculateTotals, clp } from './orderMoney'
