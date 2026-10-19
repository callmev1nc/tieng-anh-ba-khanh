// Validates every lesson JSON: schema, duplicate English keys, quiz sanity,
// situations/numbers structure, and a phon charset whitelist.
// Usage: node scripts/check-lessons.mjs   (npm run check)
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = join(process.cwd(), 'src', 'lessons')
const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort()

const seen = new Map() // en -> first lesson id
const problems = []
const warnings = []
let situOK = 0
let withNumbers = 0
let phonErrors = 0

/** Hard non-Latin scripts are always bugs, in phon AND in Vietnamese text. */
const CJK_OR_SCRIPT_RE = /[\u0E00-\u0E7F\u0400-\u04FF\u3400-\u9FFF\u3100-\u31FF]/u
/** "zó.Lísts" style garbage: a lowercase letter glued right before an uppercase
 * one (hyphenated SHOUTING like "thir-TEEN" is fine). */
const GLUED_CASE_RE = /(?<!-)[\p{Ll}\p{M}]\p{Lu}/u

const PHON_ALLOWED = /^[\p{L}\p{M}\d\s\-,.'!?():%+"'’–—]*$/u

function checkPhon(file, label, phon) {
  if (phon === undefined || phon === null) return
  if (typeof phon !== 'string' || phon.trim() === '') {
    problems.push(`${file}: ${label}: phon must be a non-empty string`)
    phonErrors++
    return
  }
  if (!PHON_ALLOWED.test(phon) || CJK_OR_SCRIPT_RE.test(phon)) {
    problems.push(`${file}: ${label}: suspicious phon "${phon}"`)
    phonErrors++
  }
}

/** Vietnamese meaning/hint text — no script garbage, no glued-case junk. */
function checkText(file, label, text) {
  if (text === undefined || text === null) return
  if (typeof text !== 'string') return
  if (CJK_OR_SCRIPT_RE.test(text) || GLUED_CASE_RE.test(text)) {
    problems.push(`${file}: ${label}: broken/garbled text "${text.slice(0, 60)}"`)
  }
}

for (const file of files) {
  let lesson
  try {
    lesson = JSON.parse(readFileSync(join(dir, file), 'utf8'))
  } catch (e) {
    problems.push(`${file}: invalid JSON — ${e.message}`)
    continue
  }

  const id = lesson.id ?? file
  const isReview = /on-tap/.test(id)
  const need = ['id', 'order', 'title', 'goal', 'words', 'phrases', 'dialogue', 'quiz']
  for (const k of need) if (lesson[k] === undefined) problems.push(`${file}: missing "${k}"`)

  if (!Array.isArray(lesson.words) || lesson.words.length < 8)
    problems.push(`${file}: needs >= 8 words (has ${lesson.words?.length})`)
  if (!Array.isArray(lesson.quiz) || lesson.quiz.length < 5)
    problems.push(`${file}: needs >= 5 quiz questions (has ${lesson.quiz?.length})`)
  if (!Array.isArray(lesson.phrases) || lesson.phrases.length < 3)
    warnings.push(`${file}: only ${lesson.phrases?.length ?? 0} phrases (listen stage needs >= 3)`)
  if (!Array.isArray(lesson.dialogue?.lines) || lesson.dialogue.lines.length < 4)
    problems.push(`${file}: dialogue needs >= 4 lines`)

  // Words: unique keys + basic shape + phon + text sanity
  for (const w of lesson.words ?? []) {
    if (!w.en || !w.vi) {
      problems.push(`${file}: word missing en/vi — ${JSON.stringify(w).slice(0, 60)}`)
      continue
    }
    checkPhon(file, `word ${w.en}`, w.phon)
    checkText(file, `word ${w.en} vi`, w.vi)
    checkText(file, `word ${w.en} note`, w.note)
    if (!isReview) {
      if (seen.has(w.en)) problems.push(`${file}: duplicate word "${w.en}" (also in ${seen.get(w.en)})`)
      else seen.set(w.en, id)
    }
  }

  // Phrases + dialogue lines
  for (const p of lesson.phrases ?? []) {
    if (!p.en || !p.vi) warnings.push(`${file}: phrase missing en/vi`)
    checkPhon(file, `phrase ${p.en}`, p.phon)
    checkText(file, `phrase ${p.en} vi`, p.vi)
    checkText(file, `phrase ${p.en} when`, p.when)
  }
  const lineEns = new Set()
  for (const l of lesson.dialogue?.lines ?? []) {
    if (!['barber', 'client'].includes(l.who)) problems.push(`${file}: dialogue line who="${l.who}" invalid`)
    checkPhon(file, `line ${l.who}`, l.phon)
    checkText(file, `line ${l.who} vi`, l.vi)
    lineEns.add(l.en)
  }

  // Quiz: option sanity + answer spread (no all-0 answers)
  let answerStats = { 0: 0, 1: 0, 2: 0, 3: 0, other: 0 }
  for (const q of lesson.quiz ?? []) {
    if (typeof q.q !== 'string' || typeof q.answer !== 'number') {
      problems.push(`${file}: quiz item missing q/answer`)
      continue
    }
    if (!Array.isArray(q.options) || q.options.length < 3) {
      problems.push(`${file}: quiz needs >= 3 options — "${q.q}"`)
      continue
    }
    if (q.answer < 0 || q.answer >= q.options.length)
      problems.push(`${file}: quiz answer out of range — "${q.q}"`)
    answerStats[q.answer === 0 || q.answer === 1 || q.answer === 2 || q.answer === 3 ? String(q.answer) : 'other']++
  }
  if (answerStats[0] === (lesson.quiz?.length ?? 0) && lesson.quiz?.length >= 3)
    warnings.push(`${file}: every quiz answer is option A — spread them out`)

  // Situations (v1.5) — warn when missing, problem when malformed
  if (!isReview && (!Array.isArray(lesson.situations) || lesson.situations.length === 0)) {
    warnings.push(`${file}: no "situations" yet (need >= 3 for the Reply stage)`)
  }
  if (Array.isArray(lesson.situations) && lesson.situations.length > 0) {
    situOK++
    if (lesson.situations.length < 3)
      warnings.push(`${file}: only ${lesson.situations.length} situations (aim for 3+)`)
    for (const [i, s] of lesson.situations.entries()) {
      const bad = (msg) => problems.push(`${file}: situations[${i}]: ${msg}`)
      if (!s.client?.en) bad('missing client.en')
      else {
        if (!s.client.vi) bad('missing client.vi (what the client means)')
        checkPhon(file, `situation ${i} client`, s.client.phon)
      }
      checkText(file, `situation ${i} hint`, s.hint)
      checkText(file, `situation ${i} explain`, s.explain)
      if (!Array.isArray(s.options) || s.options.length < 3)
        bad(`has ${s.options?.length ?? 0} options, need >= 3`)
      if (typeof s.answer !== 'number' || s.answer < 0 || s.answer >= (s.options?.length ?? 0))
        bad('answer index out of range')
      const seenOpts = new Set()
      for (const [j, o] of (s.options ?? []).entries()) {
        if (!o.en) bad(`option ${j} missing en`)
        if (seenOpts.has(o.en)) bad(`duplicate option text "${o.en}"`)
        seenOpts.add(o.en)
        checkPhon(file, `situation ${i} option ${j}`, o.phon)
      }
    }
  }

  // Numbers drills (v1.5) — optional, validate shape if present
  if (lesson.numbers !== undefined) {
    withNumbers++
    if (!Array.isArray(lesson.numbers) || lesson.numbers.length < 4)
      problems.push(`${file}: "numbers" needs >= 4 drills (has ${lesson.numbers?.length ?? 0})`)
    for (const [i, d] of (lesson.numbers ?? []).entries()) {
      const bad = (msg) => problems.push(`${file}: numbers[${i}]: ${msg}`)
      if (!d.say) bad('missing "say" (the English text to hear)')
      else checkPhon(file, `number ${i} ${d.say}`, d.phon)
      if (!Array.isArray(d.options) || d.options.length < 3) bad(`has ${d.options?.length ?? 0} options, need >= 3`)
      const size = d.options?.length ?? 0
    if (typeof d.answer !== 'number' || d.answer < 0 || d.answer >= size) bad('answer index out of range')
    const seenNum = new Set()
    for (const o of d.options ?? []) {
      if (seenNum.has(o)) bad(`duplicate option "${o}"`)
      seenNum.add(o)
    }
    }
  }
}

const n = files.length
const unique = seen.size
console.log(`Checked ${n} lesson files, ${unique} unique words, ${situOK}/40 with situations, ${withNumbers} with numbers.`)

if (warnings.length > 0) {
  console.warn(`WARNINGS (${warnings.length}):`)
  for (const w of warnings.slice(0, 25)) console.warn('  ⚠ ' + w)
  if (warnings.length > 25) console.warn(`  … and ${warnings.length - 25} more`)
}
if (problems.length > 0) {
  console.error(`PROBLEMS (${problems.length}):`)
  for (const p of problems) console.error('  ✗ ' + p)
  process.exit(1)
}
if (warnings.some((w) => /suspicious phon/.test(w))) {
  console.error('Phon charset problems found — see warnings above.')
  process.exit(1)
}
console.log('ALL CHECKS PASSED')
