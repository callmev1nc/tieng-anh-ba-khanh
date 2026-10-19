import { useEffect, useMemo, useState } from 'react'
import type { Lesson, Situation } from '../../types'
import {
  buildMiniTest,
  freshRand,
  type ListenItem,
  type BuildItem,
} from '../../lib/exercises'
import { SpeakButton } from '../SpeakButton'
import { SelfSpeakStage } from './SelfSpeakStage'

interface Props {
  lesson: Lesson
  onDone: (correct: number, total: number) => void
}

const KIND_LABEL: Record<string, string> = {
  listen: '🎧 Nghe câu',
  reply: '☎️ Đáp lại',
  build: '🧩 Xếp câu',
  numbers: '💰 Số & tiền',
  selfspeak: '🗣 Tự nói',
}

/** The Friday-style 5-question mixed test, freshly shuffled every attempt. */
export function MiniTestStage({ lesson, onDone }: Props) {
  const rand = useMemo(() => freshRand(), [])
  const items = useMemo(() => buildMiniTest(lesson, rand), [lesson, rand])
  const [i, setI] = useState(0)
  const [correct, setCorrect] = useState(0)

  useEffect(() => {
    if (items.length === 0) onDone(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const completeItem = (ok: boolean) => {
    const next = correct + (ok ? 1 : 0)
    setCorrect(next)
    if (i + 1 >= items.length) {
      onDone(next, items.length)
      return
    }
    setI(i + 1)
  }

  if (items.length === 0) {
    // Degenerate lesson (no phrases at all) — don't block the flow.
    return null
  }

  const m = items[i]

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm font-bold text-inksoft">
        <span>🎯 Mini test {i + 1} / {items.length}</span>
        <span>{KIND_LABEL[m.kind]}</span>
      </div>

      {m.kind === 'listen' && <ListenMini item={m.item} onResult={completeItem} />}
      {m.kind === 'reply' && <ReplyMini situation={m.situation} onResult={completeItem} />}
      {m.kind === 'build' && <BuildMini item={m.item} onResult={completeItem} />}
      {m.kind === 'numbers' && <NumbersMini say={m.drill.say} phon={m.drill.phon} options={m.drill.options} answer={m.drill.answer} onResult={completeItem} />}
      {m.kind === 'selfspeak' && (
        <SelfSpeakStage
          vi={m.vi}
          en={m.en}
          phon={m.phon}
          label="Tự nói — câu cuối"
          onDone={completeItem}
        />
      )}
    </div>
  )
}

/** ---------- Mini variants: same logic, tighter UI, 1 question each ---------- */

function ListenMini({ item, onResult }: { item: ListenItem; onResult: (ok: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null)
  const pick = (idx: number) => {
    if (picked !== null) return
    setPicked(idx)
  }
  return (
    <div>
      <div className="card p-5 text-center">
        <p className="text-sm font-semibold text-inksoft">Chưa hiện chữ — chỉ có tai thôi ✌️</p>
        <SpeakButton
          text={item.audio}
          className="mx-auto mt-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary text-4xl text-white shadow-lg"
        >
          🔊
        </SpeakButton>
      </div>
      <div className="mt-4 space-y-3">
        {item.options.map((opt, idx) => (
          <button
            key={idx}
            type="button"
            data-testid="opt"
            className={
              picked === null
                ? 'btn btn-ghost justify-start text-left'
                : idx === item.answer
                  ? 'btn justify-start text-left border-2 border-ok bg-ok text-white'
                  : idx === picked
                    ? 'btn justify-start text-left border-2 border-flag bg-flagsoft text-flag'
                    : 'btn btn-ghost justify-start text-left opacity-50'
            }
            onClick={() => pick(idx)}
          >
            <span className="min-w-0 font-semibold">{opt.en}</span>
          </button>
        ))}
      </div>
      {picked !== null && (
        <div className="mt-4 flex gap-3">
          <button type="button" className="btn btn-ok btn-big flex-1" onClick={() => onResult(picked === item.answer)}>
            Tính điểm →
          </button>
        </div>
      )}
    </div>
  )
}

function ReplyMini({
  situation: s,
  onResult,
}: {
  situation: Situation
  onResult: (ok: boolean) => void
}) {
  const [picked, setPicked] = useState<number | null>(null)
  if (!s) return null
  const pick = (n: number) => {
    if (picked !== null) return
    setPicked(n)
  }
  return (
    <div>
      <div className="card p-5">
        <p className="text-sm font-bold text-inksoft">🧑 Khách nói:</p>
        <p className="font-display text-xl font-extrabold leading-snug">{s.client.en}</p>
        {s.client.phon && (
          <p className="mt-1 text-sm font-semibold text-inksoft">{s.client.phon}</p>
        )}
      </div>
      <div className="mt-3 space-y-3">
        {s.options.map((opt, n) => (
          <button
            key={n}
            type="button"
            data-testid="opt"
            className={
              picked === null
                ? 'btn btn-ghost justify-start text-left'
                : n === s.answer
                  ? 'btn justify-start text-left border-2 border-ok bg-ok text-white'
                  : n === picked
                    ? 'btn justify-start text-left border-2 border-flag bg-flagsoft text-flag'
                    : 'btn btn-ghost justify-start text-left opacity-50'
            }
            onClick={() => pick(n)}
          >
            <span className="min-w-0 font-semibold">{opt.en}</span>
          </button>
        ))}
      </div>
      {picked !== null && (
        <div className="mt-4">
          <button type="button" className="btn btn-ok btn-big w-full" onClick={() => onResult(picked === s.answer)}>
            Tính điểm →
          </button>
        </div>
      )}
    </div>
  )
}

function BuildMini({ item, onResult }: { item: BuildItem; onResult: (ok: boolean) => void }) {
  const [chosen, setChosen] = useState<number[]>([])
  const [done, setDone] = useState<null | boolean>(null)
  const allUsed = chosen.length === item.tokens.length

  const tap = (idx: number) => {
    if (done !== null) return
    setChosen(chosen.includes(idx) ? chosen.filter(c => c !== idx) : [...chosen, idx])
  }

  const submit = () => {
    const built = chosen.map(k => item.tokens[k]).join(' ')
    setDone(built === item.phrase)
  }

  if (done !== null) {
    return (
      <div>
        <div className={`card p-5 text-center ${done ? '' : 'border-flag bg-flagsoft'}`}>
          {done ? '🎉 Câu chuẩn!' : `Đáp án: “${item.phrase}”`}
          <p className="mt-1 font-display text-2xl font-extrabold">{item.phrase}</p>
        </div>
        <button type="button" className="btn btn-ok btn-big mt-4 w-full" onClick={() => onResult(done)}>
          Tính điểm →
        </button>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm font-bold text-inksoft">🗣 Xếp câu cho nghĩa:</p>
      <p className="mt-1 font-display text-xl font-extrabold text-primary">{item.vi}</p>
      <div className="mt-3 min-h-[56px] rounded-2xl border-2 border-dashed border-mist bg-white p-3">
        <div className="flex flex-wrap gap-2">
          {chosen.map(k => (
            <button key={k} type="button" className="chip border border-mist bg-paper text-ink" onClick={() => tap(k)}>
              {item.tokens[k]}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {item.tokens.map((tok, k) => (
          <button
            key={k}
            type="button"
            data-testid="chip"
            className={`chip ${chosen.includes(k) ? 'border bg-mist opacity-40' : 'border-2 border-mist bg-white'}`}
            onClick={() => tap(k)}
          >
            {tok}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="btn btn-primary btn-big mt-4 w-full"
        onClick={submit}
        disabled={!allUsed}
        style={!allUsed ? { opacity: 0.45 } : undefined}
      >
        🧐 Kiểm tra
      </button>
    </div>
  )
}

function NumbersMini({
  say,
  phon,
  options,
  answer,
  onResult,
}: {
  say: string
  phon?: string
  options: string[]
  answer: number
  onResult: (ok: boolean) => void
}) {
  const [picked, setPicked] = useState<number | null>(null)
  return (
    <div>
      <div className="card p-5 text-center">
        <SpeakButton
          text={say}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary text-4xl text-white shadow-lg"
        >
          🔊
        </SpeakButton>
        {phon && <p className="mt-3 text-sm font-bold text-primary">{phon}</p>}
      </div>
      <div className="mt-4 grid gap-3">
        {options.map((o, k) => (
          <button
            key={k}
            type="button"
            data-testid="opt"
            className={
              picked === null
                ? 'btn btn-ghost'
                : k === answer
                  ? 'btn border-2 border-ok bg-ok text-white'
                  : k === picked
                    ? 'btn border-2 border-flag bg-flagsoft text-flag'
                    : 'btn btn-ghost opacity-50'
            }
            onClick={() => picked === null && setPicked(k)}
          >
            <span className="font-display text-xl font-extrabold">{o}</span>
          </button>
        ))}
      </div>
      {picked !== null && (
        <button type="button" className="btn btn-ok btn-big mt-4 w-full" onClick={() => onResult(picked === answer)}>
          Tính điểm →
        </button>
      )}
    </div>
  )
}
