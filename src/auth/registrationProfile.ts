/** Profile details are presentation data, never an authorization input. */
export type RegistrationProfile = Readonly<{
  fullName: string
  dateOfBirth: string
}>
export function visibleAccountName(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const name = value.normalize('NFC').trim().replace(/\s+/g, ' ')
  if (name.length < 2 || name.length > 120 || /[\u0000-\u001f\u007f<>]/.test(name)) return undefined
  return name
}
export function parseRegistrationProfile(
  input: RegistrationProfile,
  today = new Date()
): RegistrationProfile {
  const fullName = visibleAccountName(input.fullName)
  if (!fullName || fullName.split(' ').length < 2)
    throw Error('Ingresa tu nombre y apellido (máximo 120 caracteres).')
  const value = input.dateOfBirth
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw Error('Selecciona tu fecha de nacimiento.')
  const date = new Date(value + 'T00:00:00Z')
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value)
    throw Error('Ingresa una fecha de nacimiento válida.')
  const current = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
  ].join('-')
  if (value < '1900-01-01' || value > current)
    throw Error('La fecha de nacimiento no puede ser futura ni anterior a 1900.')
  return { fullName, dateOfBirth: value }
}
