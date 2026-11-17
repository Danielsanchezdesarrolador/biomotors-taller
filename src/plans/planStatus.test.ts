import { describe, expect, it } from 'vitest'
import { parsePlanStatus, planDetail, planLabel } from './planStatus'
describe('BT-PLAN-04A: plan display is server-validated', () => {
  const basic = { scope:'personal', effectivePlan:'basic', personalPlan:'basic',
    isLifetime:false, expiresAt:null, workshopId:null }
  const full = { scope:'personal', effectivePlan:'full', personalPlan:'full',
    isLifetime:true, expiresAt:null, workshopId:null }
  it('defaults correctly to Basic only when provided by the server', () => {
    expect(planLabel(parsePlanStatus(basic))).toBe('Plan Básico')
    expect(planLabel(parsePlanStatus(null))).toBe('Plan no disponible')
  })
  it('supports a lifetime personal concession before workshop onboarding', () => {
    expect(planLabel(parsePlanStatus(full))).toBe('Full activo')
    expect(planDetail(parsePlanStatus(full))).toBe('Permanente')
  })
  it('uses the workshop plan for mechanics even with a Basic personal account', () => {
    const result = parsePlanStatus({ ...basic, scope:'workshop', workshopId:'workshop-id',
      effectivePlan:'plus' })
    expect(planLabel(result)).toBe('Plus activo')
    expect(result?.personalPlan).toBe('basic')
  })
  it('rejects forged or malformed plan data', () => {
    expect(parsePlanStatus({...basic,effectivePlan:'creator'})).toBeNull()
    expect(parsePlanStatus({...full,isLifetime:true,expiresAt:'2026-12-03'})).toBeNull()
    expect(parsePlanStatus({...basic,scope:'workshop'})).toBeNull()
    expect(parsePlanStatus({...basic,effectivePlan:'full',isLifetime:'yes'})).toBeNull()
    expect(parsePlanStatus({...basic,expiresAt:'not-a-date'})).toBeNull()
    expect(planLabel(parsePlanStatus({effectivePlan:'full'}))).toBe('Plan no disponible')
  })
})
