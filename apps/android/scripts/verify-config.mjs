import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const json = (path) => JSON.parse(readFileSync(path, 'utf8'))
const app = json('app.json').expo
const eas = json('eas.json')
const pkg = json('package.json')
assert.equal(app.name, 'ByteTorque')
assert.deepEqual(app.platforms, ['android'])
assert.match(app.android.package, /^cl\.bytetorque\./)
assert.equal(eas.build.preview.android.buildType, 'apk')
assert.equal(eas.build.preview.distribution, 'internal')
assert.ok(pkg.dependencies.expo.startsWith('~57.'))
assert.ok(pkg.dependencies['react-native'].startsWith('0.86.'))
const code = readFileSync('App.tsx', 'utf8')
assert.ok(code.includes('ScrollView'))
assert.ok(code.includes('ByteTorque'))
assert.ok(code.includes('DEMO VISUAL'))
assert.ok(!/WebView\b/.test(code), 'Android no debe ser una WebView')
assert.ok(code.includes('OT-1001'))
console.log('ByteTorque Android: configuración nativa y perfil APK PASS (APK no generada)')
// BT-BRAND-01: validate prepared native resources; this does not build an APK.
const { createHash } = await import('node:crypto')
const brand = json('../../assets/brand/manifest.json')
for (const item of brand.derivatives.filter((d) => d.path.startsWith('apps/android/'))) {
  const bytes = readFileSync('../../' + item.path)
  assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256)
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
  assert.equal(bytes.readUInt32BE(16), item.width)
  assert.equal(bytes.readUInt32BE(20), item.height)
}
assert.equal(app.icon, './assets/brand/icon.png')
assert.equal(app.android.adaptiveIcon.foregroundImage, './assets/brand/adaptive-foreground.png')
assert.equal(app.android.adaptiveIcon.backgroundColor, '#061c39')
assert.equal(app.splash.image, app.icon)
assert.equal(app.splash.resizeMode, 'contain')
assert.ok(code.includes('./assets/brand/logo-horizontal-dark.png'))
console.log('BT-BRAND-01: native icon, adaptive foreground, splash and horizontal artwork PASS')

// BT-ANDROID-02: supervisar que todo el cliente de prueba permanezca offline.
const native = readFileSync('screens/NativeModules.tsx','utf8')
const gateway = readFileSync('data/demoGateway.ts','utf8')
const combined = code + native + gateway
for (const label of ['Órdenes de trabajo','Clientes y vehículos','Informes y cotizaciones',
  'Configuración','Descargar PDF archivado','Historial de visitas de ejemplo']) {
  assert.ok(native.includes(label),'Falta módulo nativo: '+label)
}
for (const marker of ['DATOS FICTICIOS','DEMO-01','COT-DEMO-001',
  'No se han guardado datos','SESSION_EXPIRED','FORBIDDEN','OFFLINE','NOT_FOUND']) {
  assert.ok(combined.includes(marker),'Falta verificación de laboratorio: '+marker)
}
assert.ok(!/WebView\b|fetch\s*\(|\.from\s*\(|createClient\s*\(/.test(combined),
  'Android DEMO no debe consultar red, SDK Supabase ni WebView')
for (const name of ['listOrders','getOrder','listCustomers','listVehicles','listHistory',
  'listQuotes','getQuote','getWorkshop']) {
  assert.ok(gateway.includes(name+' =') || gateway.includes(name+'('),
    'Falta contrato de lectura: '+name)
}
assert.ok(code.includes('openDemoSession'), 'Acceso de prueba explícito obligatorio')
assert.ok(code.includes('key={section+demoSession.workshopId'), 'Reinicio por taller/rol al navegar')
assert.ok(native.includes('gateway.listHistory(session'), 'Historial debe consultar por sesión')
assert.ok(native.includes('gateway.listQuotes(session'), 'Cotizaciones deben consultar por sesión')
console.log('BT-ANDROID-02: vistas R2, solo lectura, sesión demo y barreras OFFLINE verificadas')
