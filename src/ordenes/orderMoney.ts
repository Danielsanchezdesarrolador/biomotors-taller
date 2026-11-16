/** Shared quotation arithmetic, extracted from detalleData without fixtures. */
export function calculateTotals<T extends { quantity: number; price: number }>(
  items: readonly T[]
) {
  if (
    items.some(
      (i) =>
        !Number.isFinite(i.quantity) || i.quantity <= 0 || !Number.isFinite(i.price) || i.price < 0
    )
  )
    throw new RangeError('Cantidad o precio inválido')
  const subtotal = items.reduce((sum, i) => {
    const cents = Math.round(i.quantity * 100)
    const exact =
      Math.abs(i.quantity * 100 - cents) < 1e-7 &&
      Number.isSafeInteger(i.price) &&
      Number.isSafeInteger(cents * i.price)
    return (
      sum + (exact ? Math.floor((cents * i.price + 50) / 100) : Math.round(i.quantity * i.price))
    )
  }, 0)
  const tax = Math.floor((subtotal * 19 + 50) / 100),
    total = subtotal + tax
  if (!Number.isSafeInteger(subtotal * 19) || !Number.isSafeInteger(total))
    throw new RangeError('Importe fuera del rango seguro')
  return { subtotal, tax, total }
}
export const clp = (value: number) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(value)
