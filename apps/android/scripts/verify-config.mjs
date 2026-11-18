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

const native = readFileSync('screens/NativeModules.tsx', 'utf8')
for (const label of ['Órdenes de trabajo','Clientes y vehículos',
  'Informes y cotizaciones','Configuración','Descargar PDF archivado']) {
  assert.ok(native.includes(label), 'Falta pantalla nativa: ' + label)
}
for (const marker of ['DATOS FICTICIOS','DEMO-01','COT-DEMO-001',
  'No se han guardado datos']) {
  assert.ok(native.includes(marker), 'Debe indicarse demo sin persistencia: ' + marker)
}
assert.ok(!/WebView\b|fetch\s*\(|\.from\s*\(|createClient\s*\(/.test(native),
  'BT-ANDROID-01 no puede abrir WebView ni consultar backend real')
assert.ok(code.includes("section={section}"), 'Las 5 pestañas deben usar la navegación nativa')
console.log('BT-ANDROID-01: 4 módulos R2, navegación y límites DEMO verificados (sin Auth/Storage)')
