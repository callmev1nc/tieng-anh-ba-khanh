# ✂ Tiếng Anh Ba Khanh

English learning PWA for a barber / salon owner — Duolingo-style lessons, explained
in Vietnamese, with barber-specific content (consultation, hair color, booking,
payment). Built to be **installed on the iPhone Home Screen** — no App Store needed.

**v1.5** — 40 lessons (30-day program + days 31–40), 6 exercise types, a lesson
mini-test, a reply stage ("hỏi — đáp") in every lesson, and number drills for
money/time lessons.

## Exercise types (v1.5 lesson flow)

`vocab → listen → speak → dialogue → reply → numbers → quiz → mini-test`

- **Nghe & chọn** — hear a sentence, pick the right card (generated per visit)
- **Tự nói** — repeat, optionally record yourself and compare (self-checked)
- **Xếp câu** — tap words in order to rebuild the sentence
- **Hỏi—Đáp** (situations) — a client line + 3 possible replies, "đáp lại đúng chuyện"
- **Luyện số** — money/time listening drills (lessons with `numbers`)
- **Mini test cuối bài** — 5 items mixed from the lesson, regenerated every time;
  perfect score = +10 XP bonus

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
npm run ci        # lesson check + type-check + production build (CI gate)
npm run smoke     # lesson check + headless walkthrough + screenshots into shots/
npm run deploy    # check + build + vercel deploy --prod
```

## Lesson JSON structure

**All 40 lessons live in `src/lessons/`** — picked up automatically, no code
changes. Every lesson has (full examples in `31-khong-hieu-phai-lam-gi.json`):

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
  "situations": [{             // Hỏi—Đáp stage (3+ per lesson recommended)
    "client": { "en": "client line", "vi": "...", "phon": "..." },
    "hint": "gợi ý tiếng Việt",
    "options": [{ "en": "...", "phon": "..." }, ...],   // 3 options
    "answer": 0,
    "explain": "vì sao đúng — tiếng Việt"
  }],
  "numbers": [{                // Luyện số stage (optional, money/time lessons)
    "say": "two hundred thousand", "phon": "...",
    "options": ["20.000đ", "200.000đ", "..."], "answer": 1
  }],
  "quiz": [{ "q": "Câu hỏi tiếng Việt", "options": ["A", "B", "C", "D"], "answer": 0 }]
}
```

Rules:

- `words[].en` must be unique across all lessons (it is the review-tracking key).
  Review lessons (id contains `on-tap`) may repeat words on purpose.
- `phon` is the "phiên âm bồi" — Vietnamese-friendly sound hint ("hê-lô").
  Never sent to TTS, it is only shown as a hint under the English text.
- Quiz + situations answers: spread `answer` indexes around (don't always 0).
- Keep Vietnamese explanations short and practical — for a working barber.
- After editing lessons, run `npm run check` (JSON validity, duplicate words,
  suspicious/garbled phon, quiz & situations sanity). `npm run smoke` runs
  everything automatically.

## Progress model

- Finishing a lesson: **+50 XP**, streak bumped, words scheduled for review in
  1, 2, 4, 7, 14, 30 days (spaced repetition boxes).
- Review session: **+20 XP**. "Nhớ rồi" moves the word to the next box,
  "Chưa nhớ" sends it back to tomorrow.
- Data lives in `localStorage` under `tk-progress-v1` (per device).

## Deploy to Vercel

Deployed via CLI (`npm run deploy`, project already linked in `.vercel/`) — build
`npm run build`, output `dist`, framework auto-detected as Vite.

GitHub Actions (`.github/workflows/ci.yml`) runs the quality gate (`check` +
`build`) on every push. Auto-deploy from CI stays **off** until the repo has:

- repo **variable** `ENABLE_VERCEL_DEPLOY = true`
- secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

HTTPS is required for mic recording — Vercel provides it. The PWA auto-updates:
deploy a new build and it installs silently the next time the app is opened
online.

## CI smoke (browser walkthrough)

`npm run smoke` drives a real browser (system Edge locally; set
`SMOKE_CHANNEL=chromium` + installed Playwright browser when CI runs it). It
walks a full lesson — vocab → listen → speak → dialogue → situations → numbers →
quiz → mini-test — and fails on any console/page error.

## Install on Dad's iPhone

1. Open the site in **Safari**.
2. Tap **Share** → **Add to Home Screen** → **Add**.
3. It opens full-screen like a native app and works offline.

## Notes / known limits (v1.5)

- Speaking practice is self-checked (listen → repeat → optional record & compare).
  No AI pronunciation scoring (on purpose — keep it simple and private).
- TTS voice/speed is selectable in-app (Giọng đọc card on Home); quality depends
  on the iPhone's installed English voices
  (Settings → Accessibility → Spoken Content → Voices → English).
