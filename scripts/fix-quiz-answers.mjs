// One-off: spread quiz answers in lessons where every correct option is first.
// Moves the correct option to position (i*3+1) % options.length per question.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const files = [
  '27-before-after.json',
  '28-small-talk-2.json',
  '29-mot-ngay-salon.json',
  '30-on-tap-cuoi.json',
]

for (const file of files) {
  const path = join(process.cwd(), 'src', 'lessons', file)
  const original = readFileSync(path, 'utf8')
  let i = 0
  const updated = original.replace(
    /"options": \[(.+?)\], "answer": 0/g,
    (match, optsRaw) => {
      const options = JSON.parse(`[${optsRaw}]`)
      const correct = options[0]
      const rest = options.slice(1)
      const newPos = (i * 3 + 1) % options.length
      i += 1
      rest.splice(newPos, 0, correct)
      const rendered = `[${rest.map((o) => JSON.stringify(o)).join(', ')}]`
      return `"options": ${rendered}, "answer": ${newPos}`
    },
  )
  if (i === 0) {
    console.log(`${file}: nothing changed`)
    continue
  }
  writeFileSync(path, updated, 'utf8')
  console.log(`${file}: reordered ${i} answers`)
}
