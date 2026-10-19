import { useState } from 'react'
import type { Progress } from '../types'
import { allWords } from '../data/lessons'
import { todayISO } from '../lib/progress'
import { SpeakButton } from '../components/SpeakButton'

interface Props {
  progress: Progress
}

export function WordsPage({ progress }: Props) {
  const [query, setQuery] = useState('')
  const learned = progress.words
  const today = todayISO()

  const q = query.trim().toLowerCase()
  const list = allWords().filter(
    (w) => q === '' || w.en.toLowerCase().includes(q) || w.vi.toLowerCase().includes(q),
  )

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Từ của tôi</h1>
        <p className="text-inksoft">
          Đã học {Object.keys(learned).length}/{allWords().length} từ — chạm 🔊 để nghe.
        </p>
      </div>

      <input
        type="search"
        inputMode="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm từ tiếng Anh hoặc nghĩa tiếng Việt…"
        className="w-full rounded-2xl border-2 border-mist bg-white px-4 py-3.5 text-lg outline-none focus:border-primary"
        aria-label="Tìm từ"
      />

      <section className="card divide-y divide-mist overflow-hidden">
        {list.length === 0 && (
          <p className="p-5 text-center text-inksoft">
            Không thấy từ “{query}”. Thử từ khác nhé.
          </p>
        )}
        {list.map((w) => {
          const state = learned[w.en]
          const dueNow = state && state.due <= today
          return (
            <div key={w.en} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-bold leading-tight">{w.en}</p>
                <p className="text-sm text-inksoft">{w.vi}</p>
                {state && (
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      dueNow ? 'bg-flagsoft text-flag' : 'bg-mist text-inksoft'
                    }`}
                  >
                    {dueNow ? '🔁 đến hạn ôn hôm nay' : '✓ đã học'}
                  </span>
                )}
              </div>
              <SpeakButton
                text={w.en}
                className="btn btn-ghost min-h-[46px] shrink-0 px-4"
                ariaLabel={`Nghe: ${w.en}`}
              />
            </div>
          )
        })}
      </section>
    </div>
  )
}
