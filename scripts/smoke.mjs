// Headless smoke test + screenshots using the system Edge browser (or bundled
// Chromium when SMOKE_CHANNEL is set — used on CI where Edge is absent).
// Usage: node scripts/smoke.mjs   (BASE_URL to test production)
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/'
mkdirSync('shots', { recursive: true })

const errors = []
const browser = await chromium.launch(
  process.env.SMOKE_CHANNEL ? { channel: process.env.SMOKE_CHANNEL } : { channel: 'msedge' },
)
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

const shot = (name) => page.screenshot({ path: `shots/${name}.png` })
const click = async (re) => {
  const btn = page.locator('button', { hasText: re }).first()
  await btn.waitFor({ timeout: 5000 })
  await btn.click()
  await page.waitForTimeout(150)
}

/**
 * Generic stage walker: keeps pressing the right kind of control for whatever
 * stage is on screen — vocab flip, options, build chips, self-grade, continue.
 * Exits once "Về trang chủ" is clicked (lesson completes).
 */
async function walkLesson(prefix, maxSteps = 260) {
  for (let step = 0; step < maxSteps; step++) {
    await page.waitForTimeout(110)

    const done = page.locator('button', { hasText: /Về trang chủ/ })
    if (await done.count()) {
      await shot(`${prefix}-done`)
      await done.click()
      return
    }

    const gradeOk = page.locator('[data-testid="grade-ok"]').first()
    if (await gradeOk.count()) {
      await shot(`${prefix}-selfspeak`)
      await gradeOk.click()
      continue
    }

    const scoreNext = page.locator('button', { hasText: /Tính điểm/ }).first()
    if (await scoreNext.count()) {
      await scoreNext.click()
      continue
    }

    const checkBtn = page.locator('button', { hasText: /Kiểm tra( lại)?/ }).first()
    if ((await checkBtn.count()) && (await checkBtn.isEnabled())) {
      await checkBtn.click()
      continue
    }

    // Enabled continue/next button beats re-clicking an option or chip
    const next = page
      .locator('button:enabled', {
        hasText: /Tiếp|Xong|Bắt đầu|Tình huống/,
      })
      .first()
    if (await next.count()) {
      const label = (await next.textContent()) ?? ''
      if (!/Dừng thu/.test(label)) {
        await next.click()
        continue
      }
    }

    const chips = page.locator('[data-testid="chip"]:not([class*="opacity-40"])')
    if (await chips.count()) {
      if (step === 0) await shot(`${prefix}-build`)
      await chips.first().click()
      continue
    }

    const reveal = page.locator('button', { hasText: /Thử nói rồi xem đáp án/ }).first()
    if (await reveal.count()) {
      await reveal.click()
      await page.waitForTimeout(80)
      continue
    }

    const barberRole = page.locator('button', { hasText: /Thợ tóc/ }).first()
    if (await barberRole.count()) {
      await shot(`${prefix}-dialogue`)
      await barberRole.click()
      continue
    }

    const opts = page.locator('[data-testid="opt"]')
    if (await opts.count()) {
      if (step === 0) await shot(`${prefix}-first`)
      await opts.first().click()
      await page.waitForTimeout(90)
      continue
    }

    // Vocab card flip
    const flip = page.locator('button', { hasText: /^Xem nghĩa$/ }).first()
    if (await flip.count()) {
      await flip.click()
      continue
    }
  }
  errors.push(`flow: walker stuck after ${maxSteps} steps (${prefix})`)
  await shot(`${prefix}-stuck`)
}

try {
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  await shot('01-home')

  // Voice picker card on home
  await shot('02-voice-card')

  // Walk lesson #1 end to end (default lesson of the day)
  await click(/Bắt đầu bài học/)
  await shot('03-vocab-front')
  await click(/^Xem nghĩa$/)
  await shot('04-vocab-back')
  await walkLesson('lesson01')

  // Open a second lesson to shake out more code paths (numbers drills etc.)
  await page.locator('nav button', { hasText: /Bài học/ }).first().click()
  await page.waitForTimeout(200)
  await shot('05-lessons')
  const richCard = page.locator('button', { hasText: /Số, tiền & giờ|Đáp lại/ }).first()
  if (await richCard.count()) {
    await richCard.click()
    await page.waitForTimeout(250)
    await click(/^Xem nghĩa$/) // if a vocab card is present, flip once for the shot
    await walkLesson('lesson-rich')
  }

  // Tabs sweep
  const tab = (re) => page.locator('nav button', { hasText: re }).first()
  await tab(/Bài học/).click()
  await page.waitForTimeout(120)
  await shot('06-lessons')
  await tab(/Ôn tập/).click()
  await page.waitForTimeout(120)
  await shot('07-review')
  await tab(/Từ của tôi/).click()
  await page.waitForTimeout(120)
  await shot('08-words')
  await tab(/Hôm nay|Trang chủ/).click()
  await page.waitForTimeout(150)
  await shot('09-home-after')
} catch (e) {
  errors.push(`flow: ${e.message}`)
  await shot('99-error')
}

console.log(
  errors.length === 0 ? 'SMOKE OK — no console/page errors' : `ERRORS:\n${errors.join('\n')}`,
)
await browser.close()
