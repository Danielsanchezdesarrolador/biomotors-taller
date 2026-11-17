import { describe, expect, it } from 'vitest'
import { parseRegistrationProfile, visibleAccountName } from './registrationProfile'
const today = new Date(2026, 10, 17)
describe('Signup profile details', () => {
  it('normalizes Unicode names and preserves ISO birth dates without inferring permissions', () => {
    expect(parseRegistrationProfile(
      { fullName: '  José   Muñoz  ', dateOfBirth: '1998-06-27' }, today
    )).toEqual({ fullName: 'José Muñoz', dateOfBirth: '1998-06-27' })
  })
  it.each([
    ['', '1998-06-27'],
    ['José', '1998-06-27'],
    ['<script> José', '1998-06-27'],
    ['José Muñoz', ''],
    ['José Muñoz', '2026-11-18'],
    ['José Muñoz', '1999-02-29'],
    ['José Muñoz', '1899-12-31']
  ])('rejects invalid personal data', (fullName, dateOfBirth) => {
    expect(() => parseRegistrationProfile({ fullName, dateOfBirth }, today)).toThrow()
  })
  it('ignores invalid or unsafe display labels', () => {
    expect(visibleAccountName(null)).toBeUndefined()
    expect(visibleAccountName('<img>')).toBeUndefined()
    expect(visibleAccountName('  Usuario  QA  ')).toBe('Usuario QA')
  })
})
