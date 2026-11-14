#!/usr/bin/env node
// ByteTorque BT-AUTH-01B-R1: consulta RLS real, EXCLUSIVAMENTE de lectura.
// Usa dos propietarios ficticios ya creados. No crea, modifica ni elimina datos.
// Credenciales por variables de proceso temporales; jamás se imprimen ni guardan.
import { loadEnvFile } from 'node:process'
import { createClient } from '@supabase/supabase-js'

const PROJECT_URL = 'https://suxcqqnmcjoezfxltoms.supabase.co'
const EMAIL_A = 'bt-r1-owner-1411@example.com'
const EMAIL_B = 'bt-r1-sin-taller-1411@example.com'
const WORKSHOP_A = 'Taller ByteTorque de Pruebas'
const WORKSHOP_B = 'Taller ByteTorque B de Pruebas'

try {
  loadEnvFile('.env.local')
} catch {
  console.error('BLOQUEADO: falta .env.local en la raiz de ByteTorque.')
  process.exit(2)
}
const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
const passwordA = process.env.BT_R1_PASSWORD_A
const passwordB = process.env.BT_R1_PASSWORD_B
// Comprobacion independiente de acceso anonimo, sin contrasenas ni sesiones Auth.
const anonOnly = process.argv.length === 3 && process.argv[2] === '--anon-only'
const fullRun = process.argv.length === 2
if (!anonOnly && !fullRun) {
  console.error('Uso: node script.mjs [--anon-only]')
  process.exit(2)
}
if (
  url !== PROJECT_URL ||
  !/^sb_publishable_[A-Za-z0-9_-]+$/.test(key || '') ||
  (fullRun && (!passwordA || !passwordB)) ||
  process.env.BT_R1_RLS_READONLY !== 'YES'
) {
  console.error('BLOQUEADO: confirma URL, clave publishable, ambas contrasenas y BT_R1_RLS_READONLY=YES. No compartas secretos.')
  process.exit(2)
}

function client() {
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(15000) }) }
  })
}
const a = client()
const b = client()
const anon = client()
let count = 0
function test(ok, label) {
  if (!ok) throw new Error('No se verifico: ' + label)
  console.log('PASS ' + ++count + ' — ' + label)
}
// Un rechazo HTTP 401/403 tambien valida que los anonimos no pueden leer.
// Cualquier error de red, SQL o API distinto NO se acepta como PASS.
async function checkAnonymous() {
  const response = await anon.from('workshops').select('id')
  const denied = !!response.error && [401, 403].includes(response.status)
  const empty = !response.error && Array.isArray(response.data) && response.data.length === 0
  if (!denied && !empty) {
    throw new Error('Consulta anonima no validada (HTTP ' + response.status + ').')
  }
  test(true, denied
    ? 'Anonimo rechazado por API (HTTP ' + response.status + ')'
    : 'Anonimo recibe cero talleres')
}
async function read(client, table, columns, field, value) {
  let request = client.from(table).select(columns)
  if (field) request = request.eq(field, value)
  const result = await request
  if (result.error || !Array.isArray(result.data)) {
    throw new Error('Consulta fallida: ' + table + ' (HTTP ' + (result.error?.status || '?') + ')')
  }
  return result.data
}
async function login(client, email, password, label) {
  const result = await client.auth.signInWithPassword({ email, password })
  if (result.error || !result.data?.user?.id) throw new Error('No se pudo iniciar sesion de ' + label)
  const verified = await client.auth.getUser()
  if (verified.error || verified.data.user?.id !== result.data.user.id) {
    throw new Error('No se pudo verificar identidad de ' + label)
  }
  test(verified.data.user.email_confirmed_at != null, label + ': identidad confirmada por Auth')
  return verified.data.user.id
}

try {
  if (anonOnly) {
    await checkAnonymous()
    console.log('RESULTADO: prueba anonima independiente PASS; no se usaron contrasenas.')
  } else {
  const userA = await login(a, EMAIL_A, passwordA, 'A')
  const userB = await login(b, EMAIL_B, passwordB, 'B')
  test(userA !== userB, 'Identidades Auth A y B independientes')

  const wa = await read(a, 'workshops', 'id,name,status')
  const wb = await read(b, 'workshops', 'id,name,status')
  test(wa.length === 1 && wa[0].name === WORKSHOP_A && wa[0].status === 'active',
    'A recibe solo su taller desde la API RLS')
  test(wb.length === 1 && wb[0].name === WORKSHOP_B && wb[0].status === 'active',
    'B recibe solo su taller desde la API RLS')
  test(wa[0].id !== wb[0].id, 'UUID de talleres diferentes')

  const aToB = await read(a, 'workshops', 'id', 'id', wb[0].id)
  const bToA = await read(b, 'workshops', 'id', 'id', wa[0].id)
  test(aToB.length === 0, 'A no lee el taller B incluso indicando su UUID')
  test(bToA.length === 0, 'B no lee el taller A incluso indicando su UUID')

  const ma = await read(a, 'workshop_memberships', 'user_id,workshop_id,role,status')
  const mb = await read(b, 'workshop_memberships', 'user_id,workshop_id,role,status')
  test(ma.length === 1 && ma[0].user_id === userA && ma[0].workshop_id === wa[0].id &&
       ma[0].role === 'owner' && ma[0].status === 'active',
       'A lee solo su membresia activa de propietario')
  test(mb.length === 1 && mb[0].user_id === userB && mb[0].workshop_id === wb[0].id &&
       mb[0].role === 'owner' && mb[0].status === 'active',
       'B lee solo su membresia activa de propietario')

  test((await read(a, 'workshop_memberships', 'id', 'workshop_id', wb[0].id)).length === 0,
       'A no lee membresias del taller B')
  test((await read(b, 'workshop_memberships', 'id', 'workshop_id', wa[0].id)).length === 0,
       'B no lee membresias del taller A')

  test((await read(a, 'profiles', 'user_id', 'user_id', userB)).length === 0,
       'A no lee perfil del propietario B')
  test((await read(b, 'profiles', 'user_id', 'user_id', userA)).length === 0,
       'B no lee perfil del propietario A')
  await checkAnonymous()

  console.log('RESULTADO: ' + count + '/' + count + ' pruebas reales de API RLS PASS. Sin cambios de datos.')
  }
} catch (err) {
  console.error('FAIL — ' + (err instanceof Error ? err.message : 'Error no identificado'))
  process.exitCode = 1
} finally {
  if (fullRun) {
    const done = await Promise.allSettled([
      a.auth.signOut({ scope: 'local' }),
      b.auth.signOut({ scope: 'local' })
    ])
    if (done.some(x => x.status !== 'fulfilled' || x.value.error)) {
      console.error('Aviso: no se pudo verificar el cierre de todas las sesiones de prueba del script.')
    } else {
      console.log('Sesiones del script cerradas; sesiones de Chrome independientes.')
    }
  }
  delete process.env.BT_R1_PASSWORD_A
  delete process.env.BT_R1_PASSWORD_B
}
