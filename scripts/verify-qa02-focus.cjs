// Deterministic regression of delayed milestone rAF stealing focus before Enter.
const { chromium } = require('playwright'),
  assert = require('node:assert/strict')
;(async () => {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox']
  })
  try {
    for (const width of [1440, 375]) {
      const p = await browser.newPage({ viewport: { width, height: 941 } })
      await p.goto(process.env.BASE_URL || 'http://127.0.0.1:5186')
      await p.locator('.fl-case-row button').first().click()
      await p.locator('.fl-milestones').waitFor()
      await p.evaluate(() => {
        const raf = window.requestAnimationFrame.bind(window)
        window.__heldFrames = []
        window.__restoreRaf = () => {
          window.requestAnimationFrame = raf
        }
        window.requestAnimationFrame = (fn) => {
          window.__heldFrames.push(fn)
          return window.__heldFrames.length
        }
      })
      await p.locator('.fl-milestones button').nth(6).click()
      const options = p.getByRole('button', { name: 'Opciones de visita', exact: true })
      await options.focus()
      await p.evaluate(() => {
        const pending = window.__heldFrames
        window.__restoreRaf()
        for (const fn of pending) fn(performance.now())
      })
      const ownsFocus = await options.evaluate((el) => document.activeElement === el)
      if (process.env.EXPECT_OLD_RACE === 'true') {
        assert.equal(ownsFocus, false)
        console.log('Old focus race reproduced', width)
        await p.close()
        continue
      }
      assert.equal(ownsFocus, true, 'Delayed heading focus stole the options control')
      await p.keyboard.press('Enter')
      await p.locator('.fl-options-toggle[aria-expanded="true"]').waitFor()
      await p.keyboard.press('Escape')
      await p.locator('.fl-options-toggle[aria-expanded="false"]').waitFor()
      console.log('QA02 focus PASS', width)
      await p.close()
    }
  } finally {
    await browser.close()
  }
})().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
