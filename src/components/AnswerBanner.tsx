import type { CSSProperties } from 'react'

interface Props {
  /** Right side = green, wrong side = red */
  correct: boolean
  /** Big short line: "Chính xác — chuẩn mực luôn!" / "Chưa đúng rồi" */
  title: string
  /** Small detail line: the correct answer, the wording of the explanation */
  detail?: string
  /** Button label, keeps the step's usual wording ("Tiếp →", "Tính điểm →"…) */
  actionLabel: string
  onAction: () => void
}

/** Duolingo-style bottom feedback bar: the stage's verdict + the continue
 * button live together, so the thumb never has to travel. */
export function AnswerBanner({ correct, title, detail, actionLabel, onAction }: Props) {
  const edge = correct ? '#1f9d46' : '#c02626'
  const btnEdge: CSSProperties = { ['--btn-edge' as string]: edge }
  return (
    <div
      className={`banner-up fixed inset-x-0 bottom-0 z-50 text-white ${
        correct ? 'bg-ok' : 'bg-flag'
      }`}
      role="status"
      aria-live="polite"
    >
      <div
        className="mx-auto max-w-xl px-4 pt-4"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <p className="font-display text-xl font-extrabold leading-snug">{title}</p>
        {detail && (
          <p className="mt-0.5 text-sm font-semibold leading-snug opacity-95">{detail}</p>
        )}
        <button
          type="button"
          className="btn btn-raise btn-big mt-3 w-full border-0 bg-white text-current"
          style={btnEdge}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  )
}
