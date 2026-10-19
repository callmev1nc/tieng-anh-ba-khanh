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
 * stage is on screen — vocab gate, options, pairs, build chips, self-grade,
 * continue banner. Exits once "Về trang chủ" is clicked (session completes).
 */
async function walkSession(prefix, maxSteps = 320) {
  for (let step = 0; step < maxSteps; step++) {
    await page.waitForTimeout(110)

    const done = page.locator('[data-testid="done-home"]')
    if (await done.count()) {
      await shot(`${prefix}-done`)
      await done.click()
      return
    }

    // Vocab meaning gate: open it, then answer it
    const gate = page.locator('[data-testid="gate-open"]').first()
    if (await gate.count()) {
      if (step === 0) await shot(`${prefix}-vocab-front`)
      await gate.click()
      await page.waitForTimeout(140)
      continue
    }
    const vocabOpt = page.locator('[data-testid="vocab-opt"]:not([disabled])').first()
    if (await vocabOpt.count()) {
      if (step === 1) await shot(`${prefix}-gate-options`)
      await vocabOpt.click()
      await page.waitForTimeout(700)
      continue
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
        hasText: /Tiếp|Xong|Bắt đầu|Tình huống|Tiếp tục/,
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

    // Review drill options / quiz options / pairs
    const revOpts = page.locator('[data-testid="review-opt"]').first()
    if (await revOpts.count()) {
      await revOpts.click()
      await page.waitForTimeout(120)
      continue
    }
    const pairs = page.locator('[data-testid="pair"]').first()
    if (await pairs.count()) {
      await pairs.click()
      await page.waitForTimeout(90)
      continue
    }

    const opts = page.locator('[data-testid="opt"]')
    if (await opts.count()) {
      if (step === 0) await shot(`${prefix}-first`)
      await opts.first().click()
      await page.waitForTimeout(90)
      continue
    }

    // Vocab card flip (review-mode fallback)
    const flipCard = page.locator('button', { hasText: /^\d/ }).first()
    if ((await flipCard.count()) && /Xem nghĩa/.test((await flipCard.getAttribute('aria-label')) ?? '')) {
      await flipCard.click()
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

  // Walk lesson #1 end to end (default lesson of the day)
  await click(/Bắt đầu bài học/)
  await walkSession('lesson01')

  // Open another lesson via the winding path (days with numbers drills)
  await page.locator('nav button', { hasText: /Bài học/ }).first().click()
  await page.waitForTimeout(250)
  await shot('02-lessons-path')
  const node = page.locator('[data-testid="lesson-node"]').first()
  await node.click()
  await page.waitForTimeout(220)
  await shot('03-lesson-card')
  await click(/Bắt đầu bài học/)
  await walkSession('lesson-node')

  // Tabs sweep
  const tab = (re) => page.locator('nav button', { hasText: re }).first()
  await tab(/Ôn tập/).click()
  await page.waitForTimeout(120)
  await shot('04-review')
  await tab(/Từ của tôi/).click()
  await page.waitForTimeout(120)
  await shot('05-words')
  await tab(/Hôm nay/).click()
  await page.waitForTimeout(150)
  await shot('06-home-after')
} catch (e) {
  errors.push(`flow: ${e.message}`)
  await shot('99-error')
}

console.log(
  errors.length === 0 ? 'SMOKE OK — no console/page errors' : `ERRORS:\n${errors.join('\n')}`,
)
await browser.close()
