#!/usr/bin/env node
// R1: A/B acelerado, solo SELECT y Auth temporal, sin datos reales.
import { loadEnvFile } from 'node:process'
import { createClient } from '@supabase/supabase-js'
const URL = 'https://suxcqqnmcjoezfxltoms.supabase.co'
const EMAIL = 'bt-r1-recepcion-1411@example.com'
const USER = 'f1b1ee14-7f89-4352-b7cd-263979a2f6f0'
const A = 'c943ad51-6d90-447b-8aa7-68866f69a4bc'
const B = 'e7b4fc0c-6966-4039-b33c-84545119e36d'
const OWNER_A = '116f1e51-4ec8-49cd-be9a-6f8aa24c467c'
const OWNER_B = '91100e06-7d25-4413-8894-3430f7b8d06f'
const MECHANIC = '745ee7f1-5c42-4802-983f-746c6d03fe13'
try { loadEnvFile('.env.local') } catch {
  console.error('BLOQUEADO: falta .env.local'); process.exit(2)
}
const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
const password = process.env.BT_R1_PASSWORD_RECEPTION
if (url !== URL || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(key || '') ||
    !password || process.env.BT_R1_FAST_AB !== 'YES' || process.argv.length !== 2) {
  console.error('BLOQUEADO: URL, clave publicable o variables temporales incorrectas.')
  process.exit(2)
}
const api = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
})
let passed = 0
let signed = false
function pass(ok, label) {
  if (!ok) throw new Error('No se cumplio comprobacion ' + (passed + 1))
  console.log('PASS ' + (++passed) + ' — ' + label)
}
async function read(table, columns, filter) {
  let q = api.from(table).select(columns)
  if (filter) q = q.eq(filter[0],filter[1])
  const { data, error } = await q
  if (error || !Array.isArray(data)) throw new Error('Fallo API en ' + table)
  return data
}
try {
  const login = await api.auth.signInWithPassword({ email: EMAIL, password })
  if (login.error || !login.data.session || !login.data.user) throw new Error('Login rechazado')
  signed = true
  const uid = login.data.user.id
  pass(uid === USER && !!login.data.user.email_confirmed_at, 'Cuenta confirmada')
  const verified = await api.auth.getUser()
  pass(!verified.error && verified.data.user?.id === uid, 'Auth verifica identidad')
  const workshops = await read('workshops','id,name,status')
  pass(workshops.length === 2 && [A,B].every(id => workshops.some(w => w.id === id)),
       'Exactamente los talleres A y B visibles')
  const memberships = await read('workshop_memberships','id,user_id,workshop_id,role,status')
  pass(memberships.length === 2 && memberships.every(m => m.user_id === uid && m.status === 'active'),
       'Solo dos membresias propias activas')
  pass(memberships.some(m => m.workshop_id === A && m.role === 'reception'),
       'Rol reception exclusivamente en A')
  pass(memberships.some(m => m.workshop_id === B && m.role === 'admin'),
       'Rol admin exclusivamente en B')
  pass((await read('workshop_memberships','id',['user_id',OWNER_A])).length === 0,
       'No lee membresia del propietario A')
  pass((await read('workshop_memberships','id',['user_id',OWNER_B])).length === 0,
       'No lee membresia del propietario B')
  pass((await read('workshop_memberships','id',['user_id',MECHANIC])).length === 0,
       'No lee membresia de mecanico A')
  const profiles = await read('profiles','user_id')
  pass(profiles.length === 1 && profiles[0].user_id === uid,'Solo lee su perfil')
  const previousAccess = login.data.session.access_token
  const refresh = await api.auth.refreshSession()
  pass(!refresh.error && refresh.data.user?.id === uid &&
       !!refresh.data.session && refresh.data.session.access_token !== previousAccess,
       'Refresh forzado conserva identidad y emite acceso nuevo')
  const later = await read('workshop_memberships','user_id,workshop_id,role,status')
  pass(later.length === 2 && later.every(m => m.user_id === uid && m.status === 'active') &&
    later.some(m => m.workshop_id === A && m.role === 'reception') &&
    later.some(m => m.workshop_id === B && m.role === 'admin'),
    'RLS mantiene ambos roles luego de refresh')
  console.log('RESULTADO: ' + passed + '/' + passed + ' PASS. Sin escrituras operativas.')
} catch (error) {
  console.error('FAIL — ' + (error instanceof Error ? error.message : 'Error desconocido'))
  process.exitCode = 1
} finally {
  if (signed) {
    try {
      const { error } = await api.auth.signOut({ scope: 'local' })
      console.log(error ? 'AVISO: logout del script no confirmado.' :
          'Sesion del script cerrada. Chrome intacto.')
    } catch { console.log('AVISO: logout del script no confirmado.') }
  }
  delete process.env.BT_R1_PASSWORD_RECEPTION
}
