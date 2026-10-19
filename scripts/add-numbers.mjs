// Injects number drills from a spec JSON into lesson JSONs.
// Usage: node scripts/add-numbers.mjs scripts/num-spec.json
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const specPath = join(process.cwd(), 'scripts', process.argv[2] ?? 'num-spec.json')
const spec = JSON.parse(readFileSync(specPath, 'utf8'))
const dir = join(process.cwd(), 'src', 'lessons')

for (const [id, drills] of Object.entries(spec)) {
  const path = join(dir, `${id}.json`)
  const lesson = JSON.parse(readFileSync(path, 'utf8'))
  lesson.numbers = drills
  writeFileSync(path, JSON.stringify(lesson, null, 2) + '\n', 'utf8')
  console.log(`${id}: +${drills.length} number drills`)
}
