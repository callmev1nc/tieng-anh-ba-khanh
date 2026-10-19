// Injects situations from scripts/i-sit.json into a lesson JSON.
// Usage: node scripts/add-situations.mjs 01-chao-hoi
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const id = process.argv[2]
if (!id) { console.error('usage: node scripts/add-situations.mjs <lesson-id>'); process.exit(1) }

const lessonDir = join(process.cwd(), 'src', 'lessons')
const lessonPath = join(lessonDir, `${id}.json`)
const dataPath = join(process.cwd(), 'scripts', process.argv[3] ?? 'i-sit.json')

const lesson = JSON.parse(readFileSync(lessonPath, 'utf8'))
const situations = JSON.parse(readFileSync(dataPath, 'utf8'))
if (!Array.isArray(situations) || situations.length < 3) {
  console.error(`i-sit.json must be an array with >= 3 situations (has ${situations.length})`)
  process.exit(1)
}
lesson.situations = situations
writeFileSync(lessonPath, JSON.stringify(lesson, null, 2) + '\n', 'utf8')
console.log(`injected ${situations.length} situations into ${id}.json`)
