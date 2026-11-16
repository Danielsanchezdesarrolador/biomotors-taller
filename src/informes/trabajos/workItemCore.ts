import { clp } from '../../ordenes/orderMoney'
export type WorkItem = { id: string; description: string; quantity: number; price: number } & {
  type: 'Repuesto' | 'Servicio' | 'Mano de obra' | 'Insumo'
  performed: boolean
  origin?: 'OT confirmada' | 'Definición manual' | 'Plantilla DEMO' | 'Cotización aceptada DEMO'
}

export const itemTypes: WorkItem['type'][] = ['Repuesto', 'Insumo', 'Mano de obra', 'Servicio']
export const currency = (value: number) => clp(value) + ' CLP'
export function validateItem(item: WorkItem) {
  if (!item.description.trim() || item.description.trim().length > 160)
    return 'Describe el ítem (1 a 160 caracteres).'
  if (!itemTypes.includes(item.type)) return 'Selecciona un tipo válido.'
  if (!Number.isFinite(item.quantity) || item.quantity <= 0 || item.quantity > 10000)
    return 'Cantidad mayor que cero y hasta 10.000.'
  if (!Number.isSafeInteger(item.price) || item.price < 0 || item.price > 100000000)
    return 'Precio entero entre $0 y $100.000.000 CLP.'
  return ''
}
