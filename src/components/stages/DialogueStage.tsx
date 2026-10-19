import { useState } from 'react'
import type { Lesson } from '../../types'
import { SpeakButton } from '../SpeakButton'

type Role = 'barber' | 'client' | 'listen'

interface Props {
  dialogue: Lesson['dialogue']
  onDone: () => void
}

const ROLE_LABEL: Record<Role, string> = {
  barber: '✂️ Thợ tóc',
  client: '🧑 Khách',
  listen: '👂 Nghe mẫu',
}

/** Step-by-step conversation practice: pick a role, read your lines aloud. */
export function DialogueStage({ dialogue, onDone }: Props) {
  const [role, setRole] = useState<Role | null>(null)
  const [i, setI] = useState(0)
  const lines = dialogue.lines
  const line = lines[i]
  const isLast = i + 1 >= lines.length
  const mine = role !== null && role !== 'listen' && role === line.who

  if (role === null) {
    return (
      <div>
        <p className="text-sm font-bold text-inksoft">Bước 1 — Chọn vai của bạn</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold">
          {dialogue.title}
        </h2>
        <p className="mt-1 text-sm text-inksoft">
          Chọn vai để biết câu nào đến lượt mình đọc to.
        </p>
        <div className="mt-4 space-y-3">
          {(['barber', 'client', 'listen'] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              className={`btn btn-big w-full justify-start px-5 ${
                r === 'listen' ? 'btn-ghost' : 'btn-primary'
              }`}
              onClick={() => setRole(r)}
            >
              <span className="text-xl">{ROLE_LABEL[r].slice(0, 2)}</span>
              <span>{ROLE_LABEL[r].slice(3)}</span>
            </button>
          ))}
        </div>
        <p className="mt-4 rounded-xl bg-white p-3 text-sm text-inksoft">
          💡 Gợi ý: đổi vai rồi học lại để quen cả hai phía của cuộc hội thoại.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between text-sm font-bold text-inksoft">
        <span>
          Hội thoại · câu {i + 1} / {lines.length}
        </span>
        <button type="button" className="text-primary underline" onClick={() => setRole(null)}>
          Đổi vai
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="chip">Bạn đang đọc vai: {ROLE_LABEL[role]}</span>
      </div>

      <SpeakButton
        text={line.en}
        className={`card mt-3 w-full p-5 text-left transition-transform active:scale-[0.99] ${
          mine ? 'border-gold bg-[#FFFBEB]' : ''
        }`}
        ariaLabel={`Nghe câu: ${line.en}`}
      >
        <span className="flex flex-wrap items-center gap-2">
          <span className={`chip ${line.who === 'barber' ? '' : 'bg-mist text-ink'}`}>
            {line.who === 'barber' ? '✂️ Thợ tóc' : '🧑 Khách'}
          </span>
          {mine && (
            <span className="chip bg-[#FEF3C7] text-[#B45309]">👉 ĐỌC TO CÂU NÀY</span>
          )}
        </span>
        <span className="mt-3 block font-display text-3xl font-extrabold leading-snug">
          {line.en}
        </span>
        {line.phon && (
          <span className="mt-1 block text-base font-semibold text-inksoft">
            {line.phon}
          </span>
        )}
        <span className="mt-2 block text-lg text-inksoft">{line.vi}</span>
        <span className="mt-3 block text-xs font-semibold text-primary">
          Chạm vào câu để nghe
        </span>
      </SpeakButton>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          className="btn btn-ghost flex-1"
          onClick={() => setI(Math.max(0, i - 1))}
          disabled={i === 0}
          style={i === 0 ? { opacity: 0.4 } : undefined}
        >
          ← Quay lại
        </button>
        <button
          type="button"
          className="btn btn-primary btn-big flex-[2]"
          onClick={() => (isLast ? onDone() : setI(i + 1))}
        >
          {isLast ? 'Xong hội thoại ✓' : 'Tiếp →'}
        </button>
      </div>
    </div>
  )
}
