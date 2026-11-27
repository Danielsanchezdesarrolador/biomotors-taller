const {navigateSection}=require('../tests/harness/navigation.cjs')
// Seven reference screens + explicit read-only reviews. The single fake account is tested only on loopback.
const { chromium } = require('playwright'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path')
;(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROMIUM_PATH ||
      (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),
    args: ['--no-sandbox']
  })
  const out = process.env.OUTPUT_DIR || 'artifacts/bt-auth-01a'
  fs.mkdirSync(out, { recursive: true })
  const results = []
  const pages = [
    ['LOGIN', '/acceso', 'Inicia sesión'],
    ['REGISTRO', '/acceso/registro', 'Crea tu cuenta'],
    ['VERIFICACION', '/auth/confirmacion', 'Verifica tu correo'],
    ['RECUPERACION', '/auth/recuperacion', '¿Olvidaste tu contraseña?'],
    ['REVISA_CORREO', '/auth/revisa-correo', 'Revisa tu correo'],
    ['NUEVA_CONTRASENA', '/auth/nueva-contrasena', 'Crear nueva contraseña'],
    ['CONTRASENA_ACTUALIZADA', '/auth/contrasena-actualizada', 'Contraseña actualizada']
  ]
  try {
    for (const width of JSON.parse(process.env.AUTH_WIDTHS || '[1650,1440,768,390,375]')) {
      const p = await browser.newPage({ viewport: { width, height: 941 } }),
        errors = [],
        writes = [],
        store = []
      await p.exposeFunction('__recordStore', (value) => store.push(value))
      await p.addInitScript(() => {
        const set = Storage.prototype.setItem
        Storage.prototype.setItem = function (...args) {
          window.__recordStore('Storage')
          return set.apply(this, args)
        }
        const open = indexedDB.open.bind(indexedDB)
        indexedDB.open = (...args) => {
          window.__recordStore('IndexedDB')
          return open(...args)
        }
      })
      p.on('pageerror', (e) => errors.push(e.message))
      p.on('request', (r) => {
        if (!['GET', 'HEAD'].includes(r.method()) || /supabase\.(co|in)/.test(r.url()))
          writes.push(r.url())
      })
      const base = process.env.BASE_URL || 'http://127.0.0.1:5173'
      const publicUrl = (route) => base + '/#' + route
      const publicPath = () => new URL(p.url()).hash.slice(1) || new URL(p.url()).pathname
      const button = (name) => p.getByRole('button', { name, exact: true })
      const capture = async (name) => {
        assert.equal(
          await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          false
        )
        if ([1650, 390, 375].includes(width)) {
          await p.evaluate(() => scrollTo(0, 0))
          await p.screenshot({
            path: path.join(out, `BT_AUTH_01A_${name}_${width}.png`),
            fullPage: true
          })
        }
      }
      // Root bookmarks and existing installed PWAs must enter access, without an extra history step.
      const login = () => p.getByRole('heading', { name: 'Inicia sesión', exact: true })
      await p.goto(base + '/')
      await login().waitFor()
      assert.equal(new URL(p.url()).hash, '#/acceso')
      assert.equal(await p.locator('.official-panel').count(), 0)
      await capture('ENTRADA_RAIZ')
      await p.reload()
      await login().waitFor()
      assert.equal(publicPath(), '/acceso')
      await p.goto(publicUrl('/acceso/registro'))
      await p.getByRole('heading', { name: 'Crea tu cuenta', exact: true }).waitFor()
      await p.goto(base + '/')
      await login().waitFor()
      await p.goBack()
      await p.getByRole('heading', { name: 'Crea tu cuenta', exact: true }).waitFor()
      await p.goForward()
      await login().waitFor()
      assert.equal(publicPath(), '/acceso')
      await button('Ver interfaz pública sin sesión').click()
      await p.locator('.official-panel').waitFor()
      assert.equal(publicPath(), '/revision/publica')
      await p.reload()
      await p.locator('.official-panel').waitFor()
      assert.equal(publicPath(), '/revision/publica')
      await p.goBack()
      await login().waitFor()
      await p.goForward()
      await p.locator('.official-panel').waitFor()
      await button('Volver al acceso').click()
      await login().waitFor()
      const manifest = await p.evaluate(async () => (await fetch('/manifest.webmanifest')).json())
      assert.equal(manifest.id, '/')
      assert.equal(manifest.display, 'standalone')
      assert.equal(manifest.start_url, '/')
      const worker = await p.evaluate(async () => {
        const registration = await navigator.serviceWorker.ready
        return registration.active?.scriptURL
      })
      assert.ok(worker.endsWith('/sw.js'))
      await p.goto(new URL(manifest.start_url, base).href)
      await login().waitFor()
      assert.equal(publicPath(), '/acceso')
      for (const [name, url, title] of pages) {
        await p.goto(publicUrl(url))
        await p.getByRole('heading', { name: title, exact: true }).waitFor()
        await p.reload()
        await p.getByRole('heading', { name: title, exact: true }).waitFor()
        assert.match(
          await p.locator('.access-review-note').innerText(),
          /Vista de revisión — sin autenticación real/
        )
        assert.equal(await p.locator('input:enabled,textarea:enabled,select:enabled').count(), 0)
        const text = await p.locator('body').innerText()
        assert.doesNotMatch(
          text,
          /revision\.admin@bytetorque\.test|VistaBT-2026!|ignacio@|felipe@|Enlace enviado|Te enviamos|Tu cuenta ahora está protegida/
        )
        for (const control of await p.locator('.access-stage button:visible').all()) {
          const box = await control.boundingBox()
          assert.ok(box.height >= 43.5, 'touch target ' + (await control.innerText()))
        }
        await capture(name)
      }
      await button('Ir a iniciar sesión').click()
      assert.equal(publicPath(), '/acceso')
      await button('Mecánico').click()
      assert.equal(publicPath(), '/acceso/mecanico')
      await p.reload()
      assert.equal(publicPath(), '/acceso/mecanico')
      await p.goBack()
      assert.equal(publicPath(), '/acceso')
      await p.goForward()
      assert.equal(publicPath(), '/acceso/mecanico')
      assert.equal(await button('Ingresar').isDisabled(), true)
      await button('Mostrar contraseña').click()
      assert.equal(await p.getByLabel('Contraseña', { exact: true }).getAttribute('type'), 'text')
      await button('Ocultar contraseña').click()
      await button('¿Olvidaste tu contraseña?').click()
      assert.equal(await button('Enviar enlace de recuperación').isDisabled(), true)
      await button('Previsualizar revisión del correo').click()
      await button('Previsualizar nueva contraseña').click()
      assert.equal(await p.getByRole('meter').getAttribute('value'), '0')
      await button('Previsualizar confirmación').click()
      assert.match(
        await p.locator('.access-positive').innerText(),
        /No se ha cambiado ninguna contraseña/
      )
      await p.goto(publicUrl('/acceso/registro'))
      await button('Mecánico invitado').click()
      assert.match(await p.locator('.access-information').innerText(), /No hay autorregistro/)
      assert.equal(await p.locator('.access-form input').count(), 0)
      await button('Administrador').click()
      await button('Términos de servicio').click()
      await p.getByRole('dialog').waitFor()
      await p.keyboard.press('Escape')
      assert.equal(await p.getByRole('dialog').count(), 0)
      await p.goto(publicUrl('/revision/administrador'))
      assert.match(await p.locator('.access-review-note').innerText(), /sin autenticación real/)
      const sectionIds = ['inicio', 'ordenes', 'clientes', 'informes', 'configuracion']
      const navIds = selector => p.locator(selector).evaluateAll(nodes =>
        nodes.map(node => node.getAttribute('data-screen') || node.getAttribute('aria-label')).sort()
      )
      assert.deepEqual(await navIds('.side-nav button'), [...sectionIds].sort(), 'All and only expected sections are in the sidebar')
      assert.deepEqual(await navIds('.bottom-nav button'), [...sectionIds].sort(), 'Public default-off navigation exposes exactly its permitted sections')
      for (const section of sectionIds) {
        await navigateSection(p, section)
        assert.equal(await p.locator('.side-nav [aria-current="page"]').getAttribute('data-screen'), section, 'Selected section must match the requested destination')
        assert.equal(await p.locator('input:enabled,textarea:enabled,select:enabled').count(), 0)
      }
      await button('Ver usuarios y permisos').click()
      assert.equal(await button('Invitar mecánico').isDisabled(), true)
      assert.match(await p.locator('.access-users-preparation').innerText(), /Cuenta personal sin taller nuevo/)
      const seats = p.locator('.access-users-preparation dl[aria-label="Referencia de cupos por plan"] > div')
      assert.deepEqual(await seats.evaluateAll(rows => rows.map(row => [
        row.querySelector('dt')?.textContent?.trim(),
        row.querySelector('dd')?.textContent?.trim()
      ])), [
        ['Básico', 'Cuenta personal sin taller nuevo'],
        ['Plus', 'Mecánicos 0/2'],
        ['Full', 'Mecánicos 0/4']
      ], 'Read-only public preview must show the exact current plan/seat mapping')
      assert.match(await p.locator('.access-users-preparation').innerText(), /sin plan activo/)
      await capture('USUARIOS_PERMISOS')
      await p.getByRole('dialog').getByRole('button', { name: 'Cerrar', exact: true }).click()
      await button('Volver al acceso').click()
      await p.getByRole('heading', { name: 'Inicia sesión', exact: true }).waitFor()
      await p.goto(publicUrl('/revision/mecanico'))
      assert.doesNotMatch(
        await p.locator('body').innerText(),
        /Cotizaci[oó]n|IVA|CLP|\$|Facturaci[oó]n|Suscripci[oó]n|Configuración/
      )
      assert.equal(await p.locator('.technician-tools>span').count(), 5)
      assert.equal(await p.locator('input:enabled,textarea:enabled,select:enabled').count(), 0)
      await capture('MECANICO')
      await button('Volver al acceso').click()
      assert.equal(publicPath(), '/acceso/mecanico')
      await p.goto(base + '/?role=admin&authenticated=true#/acceso')
      assert.equal(await button('Ingresar').isDisabled(), true)
      assert.match(await p.locator('.access-review-note').innerText(), /sin autenticación real/)
      if (!process.env.SKIP_HARNESS) {
        const harness = process.env.HARNESS_URL || 'http://127.0.0.1:5177'
        assert.ok(['127.0.0.1', 'localhost'].includes(new URL(harness).hostname))
        const source = fs.readFileSync(
          path.join(process.cwd(), 'tests/fixtures/authReviewAccount.ts'),
          'utf8'
        )
        const email = /email:\s*'([^']+)'/.exec(source)[1],
          password = /password:\s*'([^']+)'/.exec(source)[1]
        await p.goto(harness + '/acceso')
        await button('Ingresar').click()
        assert.match(await p.getByRole('status').innerText(), /Completa/)
        await p.getByLabel('Correo electrónico', { exact: true }).fill(email)
        await p.getByLabel('Contraseña', { exact: true }).fill('incorrecta')
        await button('Ingresar').click()
        assert.match(await p.getByRole('status').innerText(), /Datos de revisión inválidos/)
        await p.getByLabel('Contraseña', { exact: true }).fill(password)
        await button('Mostrar contraseña').click()
        assert.equal(await p.getByLabel('Contraseña', { exact: true }).getAttribute('type'), 'text')
        await button('Ocultar contraseña').click()
        if (width <= 760) {
          await p.setViewportSize({ width, height: 520 })
          await button('Ingresar').scrollIntoViewIfNeeded()
          const box = await button('Ingresar').boundingBox()
          assert.ok(box.y >= 0 && box.y + box.height <= 520)
          await p.setViewportSize({ width, height: 941 })
        }
        await button('Mecánico').click()
        await p.getByLabel('Correo electrónico', { exact: true }).fill(email)
        await p.getByLabel('Contraseña', { exact: true }).fill(password)
        await button('Ingresar').click()
        assert.match(await p.getByRole('status').innerText(), /Elegir otra entrada no cambia/)
        await button('Administrador').click()
        await p.getByLabel('Correo electrónico', { exact: true }).fill(email)
        await p.getByLabel('Contraseña', { exact: true }).fill(password)
        await button('Ingresar').click()
        assert.equal(new URL(p.url()).pathname, '/revision/administrador')
        assert.match(await p.locator('.access-review-note').innerText(), /sin autenticación real/)
        assert.equal(await p.locator('input:enabled,textarea:enabled,select:enabled').count(), 0)
        assert.doesNotMatch(
          await p.locator('body').innerText(),
          /OT-1001|Camila|Torres|@example\.com/
        )
        await p.goto(harness + '/auth/nueva-contrasena')
        await p.getByLabel('Nueva contraseña', { exact: true }).fill(password)
        await p.getByLabel('Confirmar nueva contraseña', { exact: true }).fill(password)
        assert.equal(await p.getByRole('meter').getAttribute('value'), '4')
        await button('Actualizar contraseña').click()
        assert.match(await p.getByRole('status').innerText(), /no se ha creado una cuenta/)
      }
      assert.deepEqual(writes, [])
      assert.deepEqual(store, [])
      assert.deepEqual(errors, [])
      assert.deepEqual(await p.context().cookies(), [])
      assert.deepEqual(await p.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0])
      results.push({
        width,
        screens: 7,
        readOnlyReview: true,
        rootRedirect: true,
        previewHistory: true,
        pwaStartUrl: manifest.start_url,
        harnessTested: !process.env.SKIP_HARNESS,
        realSessions: 0,
        networkWrites: 0,
        persistentWrites: 0,
        pageErrors: 0
      })
      console.log('AUTH PASS', width)
      await p.close()
    }
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2) + '\n')
  } finally {
    await browser.close()
  }
})().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
