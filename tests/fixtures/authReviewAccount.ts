// The single fictitious review account. Not a secret, Supabase user, session or access control.
// This module is allowed only inside the local QA harness and its tests.
export const authReviewAccount = Object.freeze({
  email: 'revision.admin@bytetorque.test',
  password: 'VistaBT-2026!',
  presentation: 'administrador' as const,
  authenticated: false as const
})
