import type { Progress } from '../types'
import { dueWords, upcomingWords } from '../lib/progress'
import { SpeakButton } from '../components/SpeakButton'

interface Props {
  progress: Progress
  onStart: () => void
}

function shortDate(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

export function ReviewPage({ progress, onStart }: Props) {
  const due = dueWords(progress)
  const upcoming = upcomingWords(progress, 5)

  if (due.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Ôn tập</h1>
          <p className="text-inksoft">Mỗi từ sẽ quay lại đúng hạn để bạn không quên.</p>
        </div>
        <section className="card p-6 text-center">
          <div className="text-5xl" aria-hidden>
            🔭
          </div>
          <h2 className="mt-3 font-display text-xl font-extrabold">
            Chưa có từ nào đến hạn
          </h2>
          <p className="mt-2 text-inksoft">
            {progress.words && Object.keys(progress.words).length > 0
              ? 'Quay lại sau nhé — mỗi từ được ôn sau 1, 2, 4, 7… ngày.'
              : 'Học bài đầu tiên ở tab “Hôm nay” để bắt đầu tích lũy từ.'}
          </p>
        </section>
        {upcoming.length > 0 && (
          <section className="card p-4">
            <p className="font-bold">Sắp đến hạn</p>
            <ul className="mt-2 divide-y divide-mist">
              {upcoming.map((w) => (
                <li key={w.en} className="flex items-center gap-3 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{w.en}</span>
                    <span className="block text-sm text-inksoft">{w.vi}</span>
                  </span>
                  <span className="chip shrink-0 bg-mist text-inksoft">
                    📅 {shortDate(w.due)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    )
  }

  const preview = due.slice(0, 6)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Ôn tập</h1>
        <p className="text-inksoft">Chạm thẻ để xem nghĩa — nhớ hay chưa, bạn tự chấm.</p>
      </div>

      <section className="card overflow-hidden">
        <div className="pole h-2.5" aria-hidden />
        <div className="p-5 text-center">
          <div className="font-display text-5xl font-extrabold text-primary">{due.length}</div>
          <p className="font-bold">từ đến hạn hôm nay</p>
          <p className="mt-1 text-sm text-inksoft">Khoảng 2 phút thôi</p>
          <button
            type="button"
            className="btn btn-primary btn-big mt-4 w-full"
            onClick={onStart}
          >
            🔁 Bắt đầu ôn {due.length} từ
          </button>
        </div>
      </section>

      <section className="card p-4">
        <p className="font-bold">Ôn những từ này?</p>
        <ul className="mt-2 divide-y divide-mist">
          {preview.map((w) => (
            <li key={w.en} className="flex items-center gap-3 py-2.5">
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{w.en}</span>
                <span className="block text-sm text-inksoft">{w.vi}</span>
              </span>
              <SpeakButton
                text={w.en}
                className="btn btn-ghost min-h-[44px] shrink-0 px-4"
                ariaLabel={`Nghe: ${w.en}`}
              >
                🔊
              </SpeakButton>
            </li>
          ))}
        </ul>
        {due.length > preview.length && (
          <p className="mt-2 text-center text-sm font-bold text-inksoft">
            và {due.length - preview.length} từ nữa…
          </p>
        )}
      </section>
    </div>
  )
}
