import { describe, expect, it } from 'vitest'
import {
  evaluateMechanicSeat,
  mechanicSeatLimits,
  type MechanicSeatInput,
  type WorkshopMember,
  type WorkshopInvitation
} from './mechanicInvitationPolicy'

const workshopId = 'taller-a'
const actor: WorkshopMember = { workshopId, role: 'admin', status: 'active' }
const mechanic = (w = workshopId): WorkshopMember => ({
  workshopId: w, role: 'mechanic', status: 'active'
})
const pending = (w = workshopId, expiresAt = '2026-12-01T00:00:00.000Z'):
  WorkshopInvitation => ({ workshopId: w, role: 'mechanic', status: 'pending', expiresAt })
const input = (patch: Partial<MechanicSeatInput> = {}): MechanicSeatInput => ({
  workshopId,
  actor,
  targetRole: 'mechanic',
  plan: 'basic',
  memberships: [],
  invitations: [],
  nowIso: '2026-11-15T00:00:00.000Z',
  ...patch
})
describe('BT-AUTH-R2 · política pura de cupos (no prueba RLS ni backend)', () => {
  it('mantiene los cupos comerciales aprobados por taller', () => {
    expect(mechanicSeatLimits).toEqual({ basic: 2, plus: 8, full: 8 })
    expect(Object.isFrozen(mechanicSeatLimits)).toBe(true)
  })
  it('Básico permite el segundo cupo y bloquea el tercero', () => {
    expect(evaluateMechanicSeat(input({ memberships: [mechanic()] }))).toMatchObject({
      allowed: true, limit: 2, occupied: 1
    })
    expect(evaluateMechanicSeat(input({ memberships: [mechanic(), mechanic()] }))).toMatchObject({
      allowed: false, limit: 2, occupied: 2, reason: 'quota-full'
    })
  })
  it.each(['plus', 'full'] as const)('%s admite 8 y bloquea el noveno', (plan) => {
    expect(evaluateMechanicSeat(input({ plan, memberships: Array(7).fill(mechanic()) })).allowed)
      .toBe(true)
    expect(evaluateMechanicSeat(input({ plan, memberships: Array(8).fill(mechanic()) })))
      .toMatchObject({ allowed: false, occupied: 8, limit: 8 })
  })
  it('reserva cupos pendientes vigentes y libera invitaciones caducadas o revocadas', () => {
    expect(evaluateMechanicSeat(input({
      memberships: [mechanic()],
      invitations: [pending()]
    }))).toMatchObject({ allowed: false, occupied: 2 })
    expect(evaluateMechanicSeat(input({
      memberships: [mechanic()],
      invitations: [
        pending(workshopId, '2026-11-14T23:59:59.000Z'),
        { ...pending(), status: 'revoked' },
        { ...pending(), status: 'accepted' }
      ]
    }))).toMatchObject({ allowed: true, occupied: 1 })
  })
  it('no confunde mecánicos de talleres vecinos, ni owners/admins con mecánicos', () => {
    expect(evaluateMechanicSeat(input({
      memberships: [
        mechanic('taller-b'), { workshopId, role: 'owner', status: 'active' },
        { workshopId, role: 'admin', status: 'active' }, { ...mechanic(), status: 'disabled' }
      ],
      invitations: [pending('taller-b')]
    }))).toMatchObject({ allowed: true, occupied: 0 })
  })
  it.each(['mechanic', 'reception'] as const)(
    'rechaza rol actor %s aunque sea del mismo taller', (role) => {
      expect(evaluateMechanicSeat(input({
        actor: { workshopId, role, status: 'active' }
      }))).toMatchObject({ allowed: false, reason: 'forbidden' })
    }
  )
  it('rechaza actor desactivado y administrador de otro taller', () => {
    expect(evaluateMechanicSeat(input({
      actor: { ...actor, status: 'disabled' }
    })).reason).toBe('forbidden')
    expect(evaluateMechanicSeat(input({
      actor: { ...actor, workshopId: 'taller-b' }
    })).reason).toBe('forbidden')
  })
  it.each(['owner', 'admin', 'reception'] as const)(
    'no permite invitar un rol %s', (targetRole) => {
      expect(evaluateMechanicSeat(input({ targetRole }))).toMatchObject({
        allowed: false, reason: 'role-not-allowed'
      })
    }
  )
  it('rechaza contexto sin taller ni fecha válida', () => {
    expect(evaluateMechanicSeat(input({ workshopId: '' })).reason).toBe('invalid-context')
    expect(evaluateMechanicSeat(input({ nowIso: 'invalid' })).reason).toBe('invalid-context')
  })
  it('fecha de caducidad inválida no libera cupo automáticamente', () => {
    expect(evaluateMechanicSeat(input({
      memberships: [mechanic()],
      invitations: [pending(workshopId, 'fecha-invalida')]
    }))).toMatchObject({ allowed: false, occupied: 2 })
  })
})
