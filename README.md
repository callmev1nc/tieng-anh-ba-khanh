# ✂ Tiếng Anh Ba Khanh

English learning PWA for a barber / salon owner — Duolingo-style lessons, explained
in Vietnamese, with barber-specific content (consultation, hair color, booking,
payment). Built to be **installed on the iPhone Home Screen** — no App Store needed.

## Stack

- Vite + React + TypeScript + Tailwind CSS v4
- `vite-plugin-pwa` → installable, works offline (service worker precaches everything)
- No backend: lessons are JSON files, progress is saved on the phone (`localStorage`)
- Audio: browser `SpeechSynthesis` for English TTS, `MediaRecorder` for speaking practice
- Deploy target: Vercel (static)

## Commands

```bash
npm install       # install dependencies
npm run dev       # local dev server
npm run build     # type-check + production build (output: dist/)
npm run preview   # serve the production build on http://localhost:4173
npm run icons     # regenerate PWA icons (Windows, GDI+)
npm run check     # validate all lesson JSON files (duplicates, quiz sanity)
npm run smoke     # lesson check + headless walkthrough + screenshots into shots/
```

## Lesson structure (how to add a lesson)

**The full 30-day program is already in `src/lessons/`** — 26 new lessons + 4 review
days (days 7, 14, 21, 30 reuse older words and mix dialogue/quiz). To add more,
create `src/lessons/31-ten-bai.json` — picked up automatically, no code changes:

```jsonc
{
  "id": "31-ten-bai",          // unique, keep the NN- prefix for ordering
  "order": 31,
  "title": "Tên bài (tiếng Việt)",
  "goal": "Học được gì — tiếng Việt.",
  "words":    [{ "en": "word", "vi": "nghĩa", "phon": "quớt", "note": "mẹo dùng (tùy chọn)" }],
  "phrases":  [{ "en": "câu nói.", "vi": "nghĩa.", "phon": "khao nói", "when": "dùng khi nào" }],
  "dialogue": {
    "title": "Tên hội thoại",
    "lines": [{ "who": "barber", "en": "...", "vi": "...", "phon": "..." }]   // barber | client
  },
  "quiz": [{ "q": "Câu hỏi tiếng Việt", "options": ["A", "B", "C", "D"], "answer": 0 }]
}
```

Rules:

- `words[].en` must be unique across all lessons (it is the review-tracking key).
  Review lessons (id contains `on-tap`) may repeat words on purpose.
- `phon` is the "phiên âm bồi" — Vietnamese-friendly sound hint ("hê-lô").
  Never sent to TTS, it is only shown as a hint under the English text.
- Quiz answers: spread `answer` indexes around (don't always 0).
- Keep Vietnamese explanations short and practical — for a working barber.
- After editing lessons, run `node scripts/check-lessons.mjs` (JSON validity,
  duplicate words, quiz sanity). `npm run smoke` runs it automatically.

## Progress model

- Finishing a lesson: **+50 XP**, streak bumped, words scheduled for review in
  1, 2, 4, 7, 14, 30 days (spaced repetition boxes).
- Review session: **+20 XP**. "Nhớ rồi" moves the word to the next box,
  "Chưa nhớ" sends it back to tomorrow.
- Data lives in `localStorage` under `tk-progress-v1` (per device).

## Deploy to Vercel

1. Push this folder to a GitHub repo (or use the Vercel CLI).
2. Vercel: **New Project → Import** — framework auto-detected as Vite,
   build `npm run build`, output `dist`. No extra config needed.
3. Custom domain optional. HTTPS is required for mic recording — Vercel provides it.

## Install on Dad's iPhone

1. Open the site in **Safari**.
2. Tap **Share** → **Add to Home Screen** → **Add**.
3. It opens full-screen like a native app and works offline.

## Notes / known limits (v1)

- Speaking practice is self-checked (listen → repeat → optional record & compare).
  No AI pronunciation scoring yet.
- TTS quality depends on the iPhone's installed English voices
  (Settings → Accessibility → Spoken Content → Voices → English).
