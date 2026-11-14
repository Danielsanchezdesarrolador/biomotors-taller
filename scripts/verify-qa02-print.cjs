// Reproduce R005 with canonical work documents. PDF page/content analysis is separate.
const { chromium } = require('playwright'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path')
;(async () => {
  const out = process.env.OUTPUT_DIR || 'artifacts/bt-qa02-print'
  fs.mkdirSync(out, { recursive: true })
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROMIUM_PATH ||
      (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),
    args: ['--no-sandbox']
  })
  try {
    for (const width of [1650, 390, 375]) {
      const p = await browser.newPage({
        viewport: { width, height: 941 },
        ...(width < 760
          ? {
              isMobile: true,
              hasTouch: true,
              userAgent:
                'Mozilla/5.0 (Linux; Android 13; Demo) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36'
            }
          : {})
      })
      const button = (name) => p.getByRole('button', { name, exact: true })
      await p.goto(process.env.BASE_URL || 'http://localhost:5173')
      await p
        .locator(width > 760 ? '.side-nav button' : '.bottom-nav button')
        .nth(3)
        .click()
      await p.getByRole('button', { name: 'Nuevo informe', exact: false }).click()
      await p.getByLabel('Orden para informe de trabajo', { exact: true }).selectOption('OT-1002')
      await button('Crear informe de trabajo').click()
      await button('Agregar ítem').click()
      await p.getByLabel('Descripción del ítem').fill('Insumo ficticio de prueba QA')
      await p.getByLabel('Precio del ítem').fill('1000')
      await button('Guardar ítem DEMO').click()
      for (const check of await p.getByRole('checkbox', { name: /^Realizado:/ }).all())
        await check.check()
      await p
        .getByLabel('Condiciones comerciales', { exact: true })
        .fill('Condiciones de muestra DEMO. No hay garantía ni autorización contractual real.')
      await p
        .getByLabel('Comentarios técnicos', { exact: true })
        .fill('Cuatro trabajos ficticios realizados expresamente para investigar impresión A4.')
      await button('Imprimir / Guardar como PDF').click()
      assert.equal(await p.locator('dialog .wt-paper table').first().locator('tbody tr').count(), 4)
      await p.pdf({
        format: 'A4',
        printBackground: true,
        path: path.join(out, `BT_QA_02_A4_4_${width}.pdf`)
      })
      await p.getByRole('dialog').getByRole('button', { name: 'Cerrar', exact: true }).click()
      // Long legitimate content must continue onto further pages, never be clipped to one.
      const long = Array.from(
        { length: 20 },
        (_, i) =>
          `Observación ficticia ${i + 1}: revisión técnica DEMO extensa documentada por el operador; conservar contenido y pendientes.`
      ).join('\n')
      await p.getByLabel('Diagnóstico del mecánico', { exact: true }).fill(long)
      await p.getByLabel('Recomendaciones / pendientes', { exact: true }).fill(long)
      await p.getByLabel('Condiciones comerciales', { exact: true }).fill(long)
      await button('Imprimir / Guardar como PDF').click()
      await p.pdf({
        format: 'A4',
        printBackground: true,
        path: path.join(out, `BT_QA_02_A4_LARGO_${width}.pdf`)
      })
      await p.close()
      console.log(
        'QA02 PRINT',
        width,
        'PDF generated; inspect page count and text before declaring PASS'
      )
    }
  } finally {
    await browser.close()
  }
})().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
