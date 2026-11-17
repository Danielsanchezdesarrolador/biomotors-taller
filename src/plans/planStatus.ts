/**
 * BT-PLAN-04A: user-visible plan values are always server-derived.
 * Fail closed on malformed/unavailable RPC data; never infer Plus/Full in the browser.
 */
export type PlanName = 'basic' | 'plus' | 'full'
export type PlanStatus = {
  scope: 'personal' | 'workshop'
  effectivePlan: PlanName
  personalPlan: PlanName
  isLifetime: boolean
  expiresAt: string | null
  workshopId: string | null
}
export function parsePlanStatus(value: unknown): PlanStatus | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const row = value as Record<string, unknown>
  const plan = (p: unknown): p is PlanName => p === 'basic' || p === 'plus' || p === 'full'
  if (row.scope !== 'personal' && row.scope !== 'workshop') return null
  if (!plan(row.effectivePlan) || !plan(row.personalPlan)) return null
  if (typeof row.isLifetime !== 'boolean') return null
  if (row.expiresAt !== null && (typeof row.expiresAt !== 'string' ||
      !Number.isFinite(Date.parse(row.expiresAt)))) return null
  if (row.workshopId !== null && typeof row.workshopId !== 'string') return null
  if (row.scope === 'personal' && row.workshopId !== null) return null
  if (row.scope === 'workshop' && !row.workshopId) return null
  if (row.isLifetime && row.expiresAt !== null) return null
  return {
    scope: row.scope,
    effectivePlan: row.effectivePlan,
    personalPlan: row.personalPlan,
    isLifetime: row.isLifetime,
    expiresAt: row.expiresAt,
    workshopId: row.workshopId
  }
}
export function planLabel(value: PlanStatus | null): string {
  if (!value) return 'Plan no disponible'
  const name = { basic: 'Básico', plus: 'Plus', full: 'Full' }[value.effectivePlan]
  return value.effectivePlan === 'basic' ? 'Plan Básico' : name + ' activo'
}
export function planDetail(value: PlanStatus | null): string {
  if (!value || value.effectivePlan === 'basic') return ''
  if (value.isLifetime) return 'Permanente'
  if (value.expiresAt) return 'Hasta ' + new Date(value.expiresAt).toLocaleDateString('es-CL')
  return 'Sin vencimiento registrado'
}
