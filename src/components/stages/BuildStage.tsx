import { useEffect, useState } from 'react'
import type { BuildItem } from '../../lib/exercises'
import { SpeakButton } from '../SpeakButton'

interface Props {
  items: BuildItem[]
  onDone: (correct: number, total: number) => void
}

/** Tap the word chips in the right order to rebuild the sentence.
 * 1st wrong: retry. 2nd wrong: reveal the answer (mercy rule). */
export function BuildStage({ items, onDone }: Props) {
  const [i, setI] = useState(0)
  const [chosen, setChosen] = useState<number[]>([])
  const [wrongOnce, setWrongOnce] = useState(false)
  const [solved, setSolved] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [correct, setCorrect] = useState(0)
  const isLast = i + 1 >= items.length
  const item = items[i]

  useEffect(() => {
    if (!item) onDone(correct, items.length)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!item) return null
  const done = solved || revealed
  const allUsed = chosen.length === item.tokens.length

  const tapToken = (idx: number) => {
    if (done) return
    if (chosen.includes(idx)) {
      setChosen(chosen.filter(c => c !== idx))
      return
    }
    setChosen([...chosen, idx])
  }

  const check = () => {
    const built = chosen.map(idx => item.tokens[idx]).join(' ')
    if (built === item.phrase) {
      setSolved(true)
      setCorrect(c => c + 1)
    } else if (!wrongOnce) {
      setWrongOnce(true)
      setChosen([])
    } else {
      setRevealed(true)
    }
  }

  const advance = () => {
    if (isLast) {
      onDone(correct, items.length)
      return
    }
    setI(i + 1)
    setChosen([])
    setWrongOnce(false)
    setSolved(false)
    setRevealed(false)
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm font-bold text-inksoft">
        <span>
          Xếp câu {i + 1} / {items.length}
        </span>
        <span>🧩 Chạm từng từ</span>
      </div>

      <div className="card p-5">
        <p className="text-sm font-bold text-inksoft">🗣 Ghép thành câu tiếng Anh có nghĩa:</p>
        <p className="mt-1 font-display text-2xl font-extrabold text-primary">{item.vi}</p>
        {done && item.phon && (
          <p className="mt-2 text-base font-semibold text-inksoft">{item.phon}</p>
        )}
        {done && <p className="mt-2 font-display text-2xl font-extrabold">{item.phrase}</p>}
      </div>

      {/* Answer strip */}
      <div className="mt-4 min-h-[64px] rounded-2xl border-2 border-dashed border-mist bg-white p-3">
        {chosen.length === 0 && !done ? (
          <p className="px-1 text-sm font-semibold text-inksoft">
            Chạm các từ ở dưới theo đúng thứ tự…
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {chosen.map(idx => (
              <button
                key={idx}
                type="button"
                className="chip border border-mist bg-paper text-ink"
                onClick={() => tapToken(idx)}
              >
                {item.tokens[idx]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Token pool */}
      <div className="mt-3 flex flex-wrap gap-2">
        {item.tokens.map((tok, idx) => (
          <button
            key={idx}
            type="button"
            data-testid="chip"
            className={`chip ${
              chosen.includes(idx) || done
                ? 'border bg-mist text-inksoft opacity-40'
                : 'border-2 border-mist bg-white text-ink'
            }`}
            onClick={() => tapToken(idx)}
          >
            {tok}
          </button>
        ))}
      </div>

      {wrongOnce && !done && (
        <div className="mt-4 rounded-2xl bg-flagsoft p-3 text-center text-sm font-bold text-flag" role="status">
          🔴 Chưa đúng thứ tự — anh thử lại lần nữa (còn 1 lượt), hoặc xem đáp án.
        </div>
      )}
      {revealed && (
        <div className="mt-4 rounded-2xl bg-flagsoft p-4 text-center font-bold text-flag" role="status">
          Đáp án đúng — đọc theo nhé:
          <span className="mt-1 block font-display text-lg">{item.phrase}</span>
        </div>
      )}

      <div className="mt-4 flex gap-3">
        {done ? (
          <button type="button" className="btn btn-primary btn-big flex-1" onClick={advance}>
            {isLast ? 'Xong xếp câu ✓' : 'Tiếp câu →'}
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-primary btn-big flex-1"
              onClick={check}
              disabled={!allUsed}
              style={!allUsed ? { opacity: 0.45 } : undefined}
            >
              🧐 {wrongOnce ? 'Kiểm tra lại' : 'Kiểm tra'}
            </button>
            {wrongOnce && (
              <button
                type="button"
                className="btn btn-ghost btn-big flex-1"
                onClick={() => setRevealed(true)}
              >
                💡 Bật đáp án
              </button>
            )}
          </>
        )}
      </div>

      {done && (
        <div className="mt-3">
          <SpeakButton text={item.phrase} rate={0.85} className="btn btn-ghost w-full">
            🔊 Nghe lại câu mẫu
          </SpeakButton>
        </div>
      )}
    </div>
  )
}
