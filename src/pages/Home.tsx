import { useState } from 'react'
import type { Progress } from '../types'
import { dueWords, learnedTodayCount, nextLessonId, totalWords } from '../lib/progress'
import { getLesson, lessons } from '../data/lessons'
import { VoicePicker } from '../components/VoicePicker'
import { Mascot } from '../components/Mascot'
import { FlameIcon, StarIcon, LettersIcon, RepeatIcon, PlayIcon, SpeakerIcon } from '../components/icons'
import { soundEnabled, enableSound, sfxTap } from '../lib/sfx'

interface Props {
  progress: Progress
  installVisible: boolean
  onOpenLesson: (id: string) => void
  onOpenReview: () => void
  onGoLessons: () => void
  onShowInstall: () => void
  onDismissInstall: () => void
}

export function HomePage({
  progress,
  installVisible,
  onOpenLesson,
  onOpenReview,
  onGoLessons,
  onShowInstall,
  onDismissInstall,
}: Props) {
  const due = dueWords(progress)
  const nextId = nextLessonId(progress)
  const nextLesson = nextId ? getLesson(nextId) : null
  const learnedToday = learnedTodayCount(progress)
  const [sound, setSound] = useState(soundEnabled())

  const dateStr = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  }).format(new Date())

  const isNew = totalWords(progress) === 0

  return (
    <div className="space-y-4">
      {/* Greeting + stats */}
      <section className="card overflow-hidden">
        <div className="pole h-2.5" aria-hidden />
        <div className="flex items-start gap-3 p-5">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-inksoft">{dateStr}</p>
            <h1 className="mt-1 font-display text-2xl font-extrabold leading-snug">
              {isNew ? 'Bắt đầu ngày 1 nhé!' : 'Sẵn sàng học 10 phút chưa?'}
            </h1>
            {learnedToday > 0 && (
              <p className="mt-2 inline-flex rounded-full bg-oksoft px-3 py-1 text-sm font-bold text-ok">
                Hôm nay học thêm {learnedToday} từ mới
              </p>
            )}
          </div>
          <Mascot state={isNew ? 'wave' : 'idle'} size={100} className="shrink-0" />
        </div>
        <div className="grid grid-cols-3 gap-2 p-5 pt-0 text-center">
          <div className="rounded-2xl bg-paper p-3">
            <span className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-flagsoft text-flag" aria-hidden>
              <FlameIcon size={15} />
            </span>
            <div className="mt-1 font-display text-xl font-extrabold">{progress.streak}</div>
            <div className="text-[11px] font-bold text-inksoft">ngày liên tiếp</div>
          </div>
          <div className="rounded-2xl bg-paper p-3">
            <span className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-[#FEF3C7] text-[#B45309]" aria-hidden>
              <StarIcon size={15} />
            </span>
            <div className="mt-1 font-display text-xl font-extrabold">{progress.xp}</div>
            <div className="text-[11px] font-bold text-inksoft">điểm XP</div>
          </div>
          <div className="rounded-2xl bg-paper p-3">
            <span className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-primarysoft text-primary" aria-hidden>
              <LettersIcon size={15} />
            </span>
            <div className="mt-1 font-display text-xl font-extrabold">{totalWords(progress)}</div>
            <div className="text-[11px] font-bold text-inksoft">từ đã học</div>
          </div>
        </div>
      </section>

      {/* Review due */}
      {due.length > 0 && (
        <section className="card flex items-center gap-3 p-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-flagsoft text-flag" aria-hidden>
            <RepeatIcon size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold leading-tight">{due.length} từ đến hạn ôn tập</p>
            <p className="text-sm text-inksoft">Chỉ mất 2 phút, nhớ lâu hơn nhiều</p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-raise min-h-[46px] shrink-0 px-4 py-2 text-sm"
            onClick={onOpenReview}
          >
            Ôn ngay
          </button>
        </section>
      )}

      {/* Next lesson */}
      {nextLesson ? (
        <section className="card p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primarysoft font-display text-lg font-extrabold text-primary">
              {String(nextLesson.order).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-primary">
                Bài tiếp theo
              </p>
              <h2 className="font-display text-xl font-extrabold leading-tight">
                {nextLesson.title}
              </h2>
            </div>
          </div>
          <p className="mt-3 text-inksoft">{nextLesson.goal}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="chip">{nextLesson.words.length} từ mới</span>
            <span className="chip">{nextLesson.phrases.length} câu luyện nói</span>
            <span className="chip">Hội thoại {nextLesson.dialogue.lines.length} câu</span>
            <span className="chip">Quiz {nextLesson.quiz.length} câu</span>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-raise btn-big mt-4 w-full"
            onClick={() => onOpenLesson(nextLesson.id)}
          >
            <PlayIcon size={19} /> Bắt đầu bài học
          </button>
        </section>
      ) : (
        <section className="card p-5 text-center">
          <div className="mx-auto grid place-items-center">
            <Mascot state="celebrate" size={120} />
          </div>
          <h2 className="mt-3 font-display text-xl font-extrabold">
            Đã học hết {lessons.length} bài!
          </h2>
          <p className="mt-2 text-inksoft">
            Giỏi quá! Học lại bất kỳ bài nào ở tab “Bài học”, và ôn tập mỗi ngày để nhớ
            mãi.
          </p>
          <button type="button" className="btn btn-ghost btn-raise btn-big mt-4 w-full" onClick={onGoLessons}>
            Xem lại bài học
          </button>
        </section>
      )}

      {/* Sound effects toggle */}
      <section className="card flex items-center gap-3 p-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primarysoft text-primary" aria-hidden>
          <SpeakerIcon size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold leading-tight">Hiệu ứng âm thanh</p>
          <p className="text-sm text-inksoft">{sound ? 'Đang bật — đúng/sai có tiếng báo' : 'Đang tắt'}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={sound}
          aria-label="Bật tắt hiệu ứng âm thanh"
          className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${sound ? 'bg-ok' : 'bg-mist'}`}
          onClick={() => {
            const on = !sound
            setSound(on)
            enableSound(on)
            if (on) sfxTap()
          }}
        >
          <span
            className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
              sound ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </section>

      {/* Voice preference */}
      <VoicePicker />

      {/* Add to home screen */}
      {installVisible && !progress.installHintDismissed && (
        <section className="card flex items-start gap-3 p-4">
          <div className="min-w-0 flex-1">
            <p className="font-bold leading-tight">Thêm vào màn hình chính</p>
            <p className="text-sm text-inksoft">
              Mở như một app thật, không cần tải qua App Store.
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="btn btn-ghost min-h-[42px] px-4 py-1.5 text-sm"
                onClick={onShowInstall}
              >
                Xem hướng dẫn
              </button>
              <button
                type="button"
                aria-label="Đóng gợi ý"
                className="btn btn-ghost min-h-[42px] px-4 py-1.5 text-sm"
                onClick={onDismissInstall}
              >
                Đóng
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
