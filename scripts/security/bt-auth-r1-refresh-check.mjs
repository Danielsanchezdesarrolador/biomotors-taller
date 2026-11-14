#!/usr/bin/env node
// ByteTorque BT-AUTH-01B-R1 — renovación de sesión Auth real y relectura RLS.
// Solo Auth (login/refresh/logout) y SELECT, sin escrituras operativas.
import { loadEnvFile } from 'node:process'
import { createClient } from '@supabase/supabase-js'

const PROJECT = 'https://suxcqqnmcjoezfxltoms.supabase.co'
const EMAIL = 'bt-r1-owner-1411@example.com'
const WORKSHOP = 'Taller ByteTorque de Pruebas'
try {
  loadEnvFile('.env.local')
} catch {
  console.error('BLOQUEADO: falta el archivo local .env.local.')
  process.exit(2)
}
const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
const password = process.env.BT_R1_PASSWORD_A
if (
  url !== PROJECT ||
  !/^sb_publishable_[A-Za-z0-9_-]+$/.test(key || '') ||
  !password ||
  process.env.BT_R1_REFRESH_TEST !== 'YES'
) {
  console.error('BLOQUEADO: comprueba URL, clave publica, contrasena A y BT_R1_REFRESH_TEST=YES.')
  process.exit(2)
}
const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
})
let checks = 0
let hadSession = false
function check(condition, label) {
  if (!condition) throw Error(label)
  console.log('PASS ' + (++checks) + ' — ' + label)
}
async function read(table, columns) {
  const { data, error } = await client.from(table).select(columns)
  if (error || !Array.isArray(data)) throw Error('SELECT RLS ' + table)
  return data
}
try {
  const login = await client.auth.signInWithPassword({ email: EMAIL, password })
  if (login.error || !login.data?.user || !login.data?.session) {
    throw Error('Inicio de sesion de prueba')
  }
  hadSession = true
  const original = login.data.session
  const userId = login.data.user.id
  check(login.data.user.email_confirmed_at != null, 'Inicio de sesion confirmado')
  check(!!original.access_token && !!original.refresh_token, 'Par de tokens inicial disponible')

  // Fuerza renovación sin esperar a que caduque el token. No imprime su contenido.
  const refreshed = await client.auth.refreshSession()
  if (refreshed.error || !refreshed.data?.session) throw Error('Renovacion Auth')
  const next = refreshed.data.session
  check(refreshed.data.user?.id === userId, 'La identidad se mantiene tras renovar')
  check(next.access_token !== original.access_token, 'Nuevo token de acceso emitido')
  check(next.refresh_token !== original.refresh_token, 'Token de renovacion rotado')
  const session = await client.auth.getSession()
  if (session.error || !session.data.session) throw Error('Sesion posterior a renovacion')
  check(session.data.session.access_token === next.access_token, 'SDK usa el token renovado')

  const identity = await client.auth.getUser()
  if (identity.error) throw Error('Verificacion remota del usuario')
  check(identity.data.user?.id === userId, 'Auth verifica la misma identidad con el nuevo token')

  const memberships = await read('workshop_memberships', 'user_id,workshop_id,role,status')
  check(memberships.length === 1 && memberships[0].user_id === userId &&
    memberships[0].status === 'active' && memberships[0].role === 'owner',
    'La membresia RLS sigue autorizada tras renovar')
  const workshops = await read('workshops', 'id,name,status')
  check(workshops.length === 1 && workshops[0].id === memberships[0].workshop_id &&
    workshops[0].name === WORKSHOP && workshops[0].status === 'active',
    'Solo el taller autorizado es visible con token renovado')
  console.log('RESULTADO: ' + checks + '/' + checks + ' comprobaciones PASS. Sin escrituras operativas.')
} catch (e) {
  // Nunca imprimir mensajes de red/Auth que puedan contener credenciales o tokens.
  const stage = e instanceof Error ? e.message : 'Verificacion interrumpida'
  const safe = ['Inicio de sesion de prueba', 'Renovacion Auth', 'Sesion posterior a renovacion',
    'Verificacion remota del usuario', 'SELECT RLS workshops',
    'SELECT RLS workshop_memberships'].includes(stage) ||
    stage.startsWith('La ') || stage.startsWith('Nuevo ') ||
    stage.startsWith('Token ') || stage.startsWith('SDK ') ||
    stage.startsWith('Auth ') || stage.startsWith('Solo ') ||
    stage.startsWith('Inicio ') || stage.startsWith('Par ')
  console.error('FAIL — ' + (safe ? stage : 'Error inesperado'))
  process.exitCode = 1
} finally {
  if (hadSession) {
    try {
      const { error } = await client.auth.signOut({ scope: 'local' })
      if (error) console.error('AVISO: no se confirmo el cierre de sesion del script.')
      else console.log('Sesion aislada del script cerrada. No se modificaron sesiones de Chrome.')
    } catch {
      console.error('AVISO: fallo el cierre remoto de sesion del script.')
    }
  }
  delete process.env.BT_R1_PASSWORD_A
}
