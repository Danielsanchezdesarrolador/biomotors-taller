/** Shared 34-component multipoint format, UI-only and independent of any
 * fixtures, sessions or document generators. Single source of truth for the
 * historical X-marking sheet AND the private CP04 inspector. */
export type Result = 'unreviewed' | 'ok' | 'attention' | 'immediate'
export type InspectionItem = {
  id: string
  category: string
  name: string
  order: number
  state: Result
  note: string
}
export const resultLabels: Record<Result, string> = {
  unreviewed: 'Sin revisar',
  ok: 'OK',
  attention: 'Requiere atención',
  immediate: 'Cambio inmediato'
}
export const results: Result[] = ['ok', 'attention', 'immediate']
export const categories = [
  {
    id: 'general',
    name: 'General',
    items: [
      ['neblina', 'Luces de neblina'],
      ['bajas', 'Luces bajas'],
      ['intermitentes', 'Luces intermitentes'],
      ['altas', 'Luces altas'],
      ['freno-luces', 'Luces de freno'],
      ['reversa', 'Luz de marcha atrás'],
      ['posicion', 'Luces de posición'],
      ['bocina', 'Bocina'],
      ['herramientas', 'Kit de herramientas'],
      ['extintor', 'Extintor']
    ]
  },
  {
    id: 'capo',
    name: 'Bajo capó',
    items: [
      ['liquido-frenos', 'Líquido de frenos'],
      ['aceite-motor', 'Nivel de aceite de motor'],
      ['aceite-transmision', 'Aceite de transmisión'],
      ['liquido-direccion', 'Líquido de dirección'],
      ['refrigerante', 'Líquido refrigerante'],
      ['accesorios', 'Correas de accesorios'],
      ['distribucion', 'Distribución'],
      ['embrague', 'Funcionamiento del embrague']
    ]
  },
  {
    id: 'bajo',
    name: 'Bajo vehículo',
    items: [
      ['bandejas', 'Bandejas'],
      ['bieletas', 'Bieletas'],
      ['axiales', 'Axiales y terminales'],
      ['amortiguadores', 'Amortiguadores'],
      ['fuga-aceite', 'Fugas de aceite'],
      ['fuga-refrigerante', 'Fugas de refrigerante'],
      ['homocineticas', 'Homocinéticas'],
      ['cremallera', 'Cremallera de dirección']
    ]
  },
  {
    id: 'frenos',
    name: 'Estado de frenos',
    items: [
      ['discos', 'Discos de freno'],
      ['tambores', 'Tambores'],
      ['estacionamiento', 'Freno de estacionamiento'],
      ['pastillas', 'Pastillas de freno']
    ]
  },
  {
    id: 'neumaticos',
    name: 'Estado de neumáticos',
    items: [
      ['delanteras', 'Ruedas delanteras'],
      ['traseras', 'Ruedas traseras'],
      ['repuesto', 'Rueda de repuesto'],
      ['presion', 'Presión de neumáticos']
    ]
  }
]
