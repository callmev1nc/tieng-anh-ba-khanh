interface Props {
  onClose: () => void
}

/** "Add to Home Screen" instructions — the App Store-free install path. */
export function InstallHint({ onClose }: Props) {
  const isIOS =
    typeof navigator !== 'undefined' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent)

  const steps = isIOS
    ? [
        { icon: '⬆️', text: 'Bấm nút Chia sẻ ở thanh dưới cùng Safari' },
        { icon: '➕', text: 'Kéo xuống, chọn “Thêm vào Màn hình chính”' },
        { icon: '✅', text: 'Bấm “Thêm” — xong! Sẽ có biểu tượng ✂ ở màn hình' },
      ]
    : [
        { icon: '⋮', text: 'Bấm nút ba chấm ⋮ ở góc trên trình duyệt' },
        { icon: '➕', text: 'Chọn “Cài đặt ứng dụng” hoặc “Thêm vào màn hình chính”' },
        { icon: '✅', text: 'Bấm “Cài đặt” — xong! Sẽ có biểu tượng ✂ ở màn hình' },
      ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Thêm vào màn hình chính"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="card w-full max-w-md p-5">
        <div className="pole mb-4 h-2 rounded-full" />
        <h2 className="font-display text-xl font-extrabold">
          Dùng như app: thêm vào màn hình chính
        </h2>
        <p className="mt-1 text-sm text-inksoft">
          Không cần tải qua App Store. Thêm một lần, dùng mãi — kể cả khi không có
          mạng.
        </p>
        <ol className="mt-4 space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primarysoft text-lg">
                {s.icon}
              </span>
              <span className="pt-1.5 font-medium">
                <span className="mr-1 text-inksoft">{i + 1}.</span>
                {s.text}
              </span>
            </li>
          ))}
        </ol>
        <button type="button" className="btn btn-primary btn-big mt-5 w-full" onClick={onClose}>
          Đã hiểu
        </button>
      </div>
    </div>
  )
}
