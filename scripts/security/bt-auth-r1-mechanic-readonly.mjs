#!/usr/bin/env node
// ByteTorque R1: prueba real API RLS de solo lectura para mecanico ficticio.
// Nunca imprimir ni guardar contrasenas, JWT ni refresh tokens.
import { loadEnvFile } from 'node:process'
import { createClient } from '@supabase/supabase-js'
const URL = 'https://suxcqqnmcjoezfxltoms.supabase.co'
const EMAIL = 'bt-r1-mecanico-1411@example.com'
const A = 'c943ad51-6d90-447b-8aa7-68866f69a4bc'
const B = 'e7b4fc0c-6966-4039-b33c-84545119e36d'
const OWNER_A = '116f1e51-4ec8-49cd-be9a-6f8aa24c467c'
const OWNER_B = '91100e06-7d25-4413-8894-3430f7b8d06f'
try { loadEnvFile('.env.local') } catch {
  console.error('BLOQUEADO: falta .env.local')
  process.exit(2)
}
const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
const password = process.env.BT_R1_PASSWORD_MECHANIC
if (url !== URL || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(key || '') ||
    !password || process.env.BT_R1_MECHANIC_READONLY !== 'YES' ||
    process.argv.length !== 2) {
  console.error('BLOQUEADO: revisar URL, clave publica y variables temporales sin compartirlas.')
  process.exit(2)
}
const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
})
let checks = 0
let logged = false
function pass(condition, label) {
  if (!condition) throw new Error('Comprobacion fallida numero ' + (checks + 1))
  console.log('PASS ' + (++checks) + ' — ' + label)
}
async function read(table, columns, filter) {
  let q = client.from(table).select(columns)
  if (filter) q = q.eq(filter[0], filter[1])
  const { data, error } = await q
  if (error || !Array.isArray(data)) throw new Error('Consulta fallida de ' + table)
  return data
}
try {
  const { data, error } = await client.auth.signInWithPassword({ email: EMAIL, password })
  if (error || !data.user || !data.session) throw new Error('Login de mecanico no confirmado')
  logged = true
  const uid = data.user.id
  pass(!!data.user.email_confirmed_at, 'Correo confirmado')
  const get = await client.auth.getUser()
  pass(!get.error && get.data.user?.id === uid, 'Identidad real verificada')
  const wa = await read('workshops', 'id,name,status')
  pass(wa.length === 1 && wa[0].id === A && wa[0].name === 'Taller ByteTorque de Pruebas' &&
       wa[0].status === 'active', 'Solo Taller A visible')
  pass((await read('workshops','id',['id',B])).length === 0, 'Taller B invisible por UUID')
  const memberships = await read('workshop_memberships','user_id,workshop_id,role,status')
  pass(memberships.length === 1 && memberships[0].user_id === uid &&
       memberships[0].workshop_id === A && memberships[0].role === 'mechanic' &&
       memberships[0].status === 'active', 'Solo membresia propia mechanic')
  pass((await read('workshop_memberships','id',['user_id',OWNER_A])).length === 0,
       'No puede leer membresia del propietario A')
  pass((await read('workshop_memberships','id',['user_id',OWNER_B])).length === 0,
       'No puede leer membresia del propietario B')
  pass((await read('workshop_memberships','id',['workshop_id',B])).length === 0,
       'No puede enumerar membresias del Taller B')
  const profiles = await read('profiles','user_id')
  pass(profiles.length === 1 && profiles[0].user_id === uid, 'Solo perfil propio')
  pass((await read('profiles','user_id',['user_id',OWNER_A])).length === 0,
       'No puede leer perfil del propietario A')
  pass((await read('profiles','user_id',['user_id',OWNER_B])).length === 0,
       'No puede leer perfil del propietario B')
  console.log('RESULTADO: '+checks+'/'+checks+' comprobaciones de lectura RLS PASS. Sin escrituras operativas.')
} catch (e) {
  const msg = e instanceof Error ? e.message : 'Error imprevisto'
  console.error('FAIL — '+msg)
  process.exitCode = 1
} finally {
  if (logged) {
    try {
      const { error } = await client.auth.signOut({ scope:'local' })
      console.log(error ? 'AVISO: cierre del script no confirmado.' : 'Sesion aislada cerrada. Chrome no se modifico.')
    } catch { console.log('AVISO: cierre de la sesion del script no confirmado.') }
  }
  delete process.env.BT_R1_PASSWORD_MECHANIC
}
