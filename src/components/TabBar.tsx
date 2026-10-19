import type { TabId } from '../types'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'home', label: 'Hôm nay', icon: '🏠' },
  { id: 'lessons', label: 'Bài học', icon: '📚' },
  { id: 'review', label: 'Ôn tập', icon: '🔁' },
  { id: 'words', label: 'Từ của tôi', icon: '🔤' },
]

interface Props {
  active: TabId
  dueCount: number
  onChange: (id: TabId) => void
}

export function TabBar({ active, dueCount, onChange }: Props) {
  return (
    <nav className="tabbar fixed inset-x-0 bottom-0 z-40 border-t border-mist bg-white/95 backdrop-blur">
      <div className="mx-auto grid max-w-xl grid-cols-4 gap-1 px-2 pt-2">
        {TABS.map((t) => {
          const isActive = active === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex min-h-[58px] flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 transition-colors ${
                isActive
                  ? 'bg-primarysoft text-primary'
                  : 'text-inksoft active:bg-mist'
              }`}
            >
              <span className="text-xl leading-none">{t.icon}</span>
              <span className="text-[11px] font-bold">{t.label}</span>
              {t.id === 'review' && dueCount > 0 && (
                <span className="absolute right-2 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-flag px-1 text-[11px] font-bold text-white">
                  {dueCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
