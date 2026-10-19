interface Props {
  /** 0..1 */
  value: number
  label?: string
}

/** Progress bar styled as a turning barber pole — the app's signature element. */
export function PoleBar({ value, label }: Props) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  return (
    <div className="w-full">
      <div
        className="h-3 w-full overflow-hidden rounded-full bg-mist"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Tiến độ'}
      >
        <div
          className="pole h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
