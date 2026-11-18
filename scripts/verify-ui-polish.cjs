// BT-UI-POLISH-01: visual regression of real AppShell with a synthetic
// loopback-only profile/plan fixture. No Supabase, production or browser writes.
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const out = process.env.OUTPUT_DIR || 'artifacts/bt-ui-polish'
const widths = [360, 390, 430, 768, 1366, 1440, 1920]
;(async () => {
  fs.mkdirSync(out, { recursive: true })
  const browser = await chromium.launch({
    executablePath: fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined,
    args: ['--no-sandbox']
  })
  const results = []
  try {
    for (const plan of ['basic', 'plus', 'full']) {
      for (const width of widths) {
        // All sizes are inspected for Basic, plus additional Plus/Full examples
        // at mobile and desktop sizes, not an exhaustive redundant 21-screenshot set.
        if (plan !== 'basic' && width !== 390 && width !== 1366) continue
        const page = await browser.newPage({ viewport: { width, height: 941 } })
        const errors = []
        page.on('pageerror', error => errors.push(error.message))
        await page.goto('http://127.0.0.1:5177/?uiPolishPlan=' + plan, {
          waitUntil: 'networkidle'
        })
        const header = page.locator('.topbar')
        await header.waitFor()
        const desktop = width > 760
        const chip = page.locator(desktop ? '.account-plan-badge' : '.mobile-plan-indicator')
        assert.equal(await chip.count(), 1, 'missing plan chip: ' + width + '/' + plan)
        assert.equal(await chip.isVisible(), true, 'hidden plan chip')
        assert.equal((await chip.innerText()).includes(
          plan === 'basic' ? 'Básico' : plan === 'plus' ? 'Plus' : 'Full'
        ), true)
        assert.equal(await chip.locator('svg').count(), plan === 'basic' ? 0 : 1)
        assert.equal(await page.locator(desktop ?
          '.mobile-plan-indicator' : '.account-plan-badge').isVisible(), false,
          'duplicate desktop/mobile plan indicator')
        const position = await page.evaluate((selector) => {
          const outer = document.querySelector('.topbar').getBoundingClientRect()
          const chip = document.querySelector(selector).getBoundingClientRect()
          const name = document.querySelector('.account-copy > strong')?.getBoundingClientRect()
          return {
            header: { top: outer.top, bottom: outer.bottom },
            chip: { top: chip.top, bottom: chip.bottom, right: chip.right },
            name: name ? { top: name.top, bottom: name.bottom } : null,
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth
          }
        }, desktop ? '.account-plan-badge' : '.mobile-plan-indicator')
        assert.ok(position.chip.top >= position.header.top - 1,
          'plan overflows above topbar: ' + width + '/' + plan)
        assert.ok(position.chip.bottom <= position.header.bottom + 1,
          'plan overflows below topbar: ' + width + '/' + plan)
        assert.ok(position.chip.right <= width + 1,
          'plan overflows screen: ' + width + '/' + plan)
        assert.ok(position.scrollWidth <= position.innerWidth + 1,
          'horizontal overflow: ' + width + '/' + plan)
        if (desktop) {
          assert.ok(position.name, 'name not rendered')
          assert.ok(position.name.top >= position.header.top - 1)
          assert.ok(position.name.bottom <= position.header.bottom + 1,
            'long name clipped in topbar')
          assert.match(await page.locator('.account-copy > strong').innerText(), /Verificación Extensa/)
          assert.match(await page.locator('.account-meta > small').innerText(), /Administrador/)
        }
        const style = await chip.evaluate(el => ({
          background: getComputedStyle(el).backgroundImage,
          color: getComputedStyle(el).color
        }))
        if (plan === 'plus' || plan === 'full')
          assert.match(style.background, /linear-gradient/, 'premium plan must use R2 gradient')
        assert.deepEqual(errors, [], 'browser errors')
        await page.screenshot({ path: `${out}/perfil-${plan}-${width}.png` })
        results.push({ width, plan, inBounds: true, overflow: false, runtimeErrors: errors.length })
        await page.close()
      }
    }
  } finally {
    await browser.close()
  }
  fs.writeFileSync(out + '/results.json', JSON.stringify(results, null, 2) + '\n')
  console.log('BT-UI-POLISH-01: account, actual plan styles, responsive bounds PASS')
})().catch(error => {
  console.error(error)
  process.exitCode = 1
})
