// Opens a lesson straight from the lessons list and screenshots the first stage.
// Usage: node scripts/preview-lesson.mjs "Tổng duyệt"
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/'
const titleNeedle = process.argv[2] ?? 'Tổng duyệt'
mkdirSync('shots', { recursive: true })

const errors = []
const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`)
})
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.waitForTimeout(200)

// Lessons tab
await page.locator('button', { hasText: /Bài học/ }).last().click()
await page.waitForTimeout(200)

// Open the requested lesson
const card = page.locator('button', { hasText: titleNeedle }).first()
await card.waitFor({ timeout: 5000 })
await card.click()
await page.waitForTimeout(250)

const safe = titleNeedle.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()
await page.screenshot({ path: `shots/late-${safe}-1.png` })
await page.waitForTimeout(100)

// Flip the first vocab card if the flip button is there
const flip = page.locator('button', { hasText: /^Xem nghĩa$|^Xem nghĩa$/ }).first()
if (await flip.count()) {
  await flip.click()
  await page.waitForTimeout(150)
  await page.screenshot({ path: `shots/late-${safe}-2-back.png` })
}

await browser.close()
if (errors.length) {
  console.log('ERRORS:\n' + errors.join('\n'))
  process.exit(1)
}
console.log(`Preview OK for "${titleNeedle}" — no console errors.`)
