// Builds one hand-scene situation per lesson + auto options from lesson phrases.
// Correct option = spec.choose (a real lesson phrase). Distractors = two other
// phrases from the SAME lesson. Injects into lesson JSON before saving.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const dir = join(process.cwd(), 'src', 'lessons')
const spec = JSON.parse(readFileSync(join(process.cwd(), 'scripts', process.argv[2] ?? 'sit-spec.json'), 'utf8'))

let n = 0
for (const s of spec) {
  const path = join(dir, `${s.id}.json`)
  if (existsSync(path) === false) { console.error(`missing ${s.id}`); continue }
  const lesson = JSON.parse(readFileSync(path, 'utf8'))
  const existing = lesson.situations ?? []
  if (existing.some((x) => x.client?.en === s.client.en)) continue // already injected
  const ps = lesson.phrases
  if (ps.length < 4) { console.error(`${s.id}: too few phrases`); continue }
  const correct = ps[s.choose]
  const distractors = ps.filter((_, i) => i !== s.choose).slice(0, 2)
  const options = [...distractors]
  options.splice(s.answer % 3, 0, correct)
  const situation = {
    client: s.client,
    hint: s.hint,
    options,
    answer: s.answer % 3,
    explain: s.explain,
  }
  lesson.situations = [...existing, situation]
  writeFileSync(path, JSON.stringify(lesson, null, 2) + '\n', 'utf8')
  n++
}
console.log(`generated situations for ${n} lessons`)
