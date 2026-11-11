export const moduleNames = ['Clientes', 'Vehículos', 'Revisiones', 'Presupuestos'] as const

export function getEmptyStateMessage(count: number): string {
  return count === 0 ? 'Sin registros todavía' : count === 1 ? '1 registro disponible' : `${count} registros disponibles`
}

export function formatCount(count: number): string {
  if (!Number.isSafeInteger(count) || count < 0) throw new RangeError('El total debe ser un entero no negativo')
  return new Intl.NumberFormat('es-CL').format(count)
}
