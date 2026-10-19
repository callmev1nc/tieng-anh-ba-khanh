/* "Ông Ba" — the app's barber mascot. Pure inline SVG, no image dependency,
 * works offline in the PWA. States: idle · wave · happy · celebrate · sad. */

export type MascotState = 'idle' | 'wave' | 'happy' | 'celebrate' | 'sad'

interface Props {
  state?: MascotState
  size?: number
  className?: string
}

const SKIN = '#FBC99A'
const SKIN_SHADE = '#F0B37E'
const NAVY = '#14213D'
const BLUE = '#2E5BE8'
const BLUE_DARK = '#1E3FB8'
const HAIR = '#14213D'
const MUSTACHE = '#5D4032'
const MOUTH_LINE = '#8A4A3A'
const MOUTH_FILL = '#A03B32'

export function Mascot({ state = 'idle', size = 120, className = '' }: Props) {
  const celebrate = state === 'celebrate'
  const waving = state === 'wave'
  const sad = state === 'sad'
  const happyEyes = state === 'happy' || celebrate

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 130"
      className={`animate-bob ${className}`}
      aria-hidden="true"
    >
      {/* Celebrate sparkles */}
      {celebrate && (
        <g stroke="#FBBF24" strokeWidth={3} strokeLinecap="round">
          <path d="M18 30v8M14 34h8" />
          <path d="M100 22v7M96.5 25.5h7" />
          <path d="M14 66v6M11 69h6" />
          <circle cx="106" cy="52" r="2.4" fill="#EF4444" stroke="none" />
          <circle cx="24" cy="14" r="2.2" fill="#2563EB" stroke="none" />
        </g>
      )}

      {/* Arms */}
      {celebrate ? (
        <>
          <path d="M34 100 18 80" stroke={BLUE} strokeWidth={11} strokeLinecap="round" />
          <circle cx="17" cy="78" r="5.5" fill={SKIN} />
          <path d="M86 100 102 80" stroke={BLUE_DARK} strokeWidth={11} strokeLinecap="round" />
          <circle cx="103" cy="78" r="5.5" fill={SKIN} />
        </>
      ) : (
        <>
          <path d="M34 102 20 112" stroke={BLUE} strokeWidth={11} strokeLinecap="round" />
          <circle cx="19" cy="113" r="5.5" fill={SKIN} />
          {waving ? (
            <g className="animate-wave" style={{ transformOrigin: '86px 102px' }}>
              <path d="M86 102 104 82" stroke={BLUE_DARK} strokeWidth={11} strokeLinecap="round" />
              <circle cx="105" cy="80" r="5.5" fill={SKIN} />
            </g>
          ) : (
            <path d="M86 102 100 112" stroke={BLUE_DARK} strokeWidth={11} strokeLinecap="round" />
          )}
          {!waving && <circle cx="101" cy="113" r="5.5" fill={SKIN} />}
        </>
      )}

      {/* Body (barber smock) */}
      <rect x="30" y="88" width="60" height="40" rx="15" fill={BLUE} />
      <rect x="30" y="88" width="60" height="40" rx="15" fill="none" stroke={BLUE_DARK} strokeWidth={2} />
      {/* collar */}
      <path d="M48 88h24l-6 9h-12Z" fill="#F6F7FA" />
      {/* pocket */}
      <rect x="51" y="106" width="18" height="13" rx="3.5" fill={BLUE_DARK} />
      <g stroke="#F6F7FA" strokeWidth={1.6} strokeLinecap="round">
        <circle cx="55.6" cy="112" r="1.7" fill="none" />
        <circle cx="59.4" cy="114.6" r="1.7" fill="none" />
        <path d="M56.9 110.6 61 116.6M59.4 110.2 55.9 114.4" fill="none" />
      </g>

      {/* Ears */}
      <circle cx="31" cy="48" r="5" fill={SKIN} />
      <circle cx="89" cy="48" r="5" fill={SKIN} />
      <path d="M31 46.5a3.2 3.2 0 0 1 3 2.2" stroke={SKIN_SHADE} strokeWidth={1.4} fill="none" />
      <path d="M89 46.5a3.2 3.2 0 0 0-3 2.2" stroke={SKIN_SHADE} strokeWidth={1.4} fill="none" />

      {/* Head */}
      <circle cx="60" cy="46" r="28" fill={SKIN} />
      {/* sideburns */}
      <path d="M32 44c0 6 1.5 9 4 11v-9zM88 44c0 6-1.5 9-4 11v-9z" fill={HAIR} />

      {/* Hair: pompadour with barber-pole side stripe */}
      <path
        d="M31 42c2-16 12-24 29-24s27 8 29 24c-6-10-16-13-29-13s-23 3-29 13Z"
        fill={HAIR}
      />
      <circle cx="68" cy="15.5" r="6.5" fill={HAIR} />
      {/* stripe: red/white/blue nod to the pole */}
      <path d="M48 20.5 60 18c2 2.5 4 4 6.5 5l-13 3c-1.5-1.8-3.5-3.5-5.5-5.5Z" fill="#EF4444" />
      <path d="M40 27.5c-2.5 3-4.5 6.5-5.5 10.5 3-6.5 6-9.5 9-11.5Z" fill="#F6F7FA" opacity="0.9" />

      {/* Eyebrows */}
      {sad ? (
        <g stroke={NAVY} strokeWidth={2.6} strokeLinecap="round">
          <path d="M45 35.5 55 40M75 35.5 65 40" fill="none" />
        </g>
      ) : (
        <g stroke={NAVY} strokeWidth={2.6} strokeLinecap="round">
          <path d="M45 33.5 55 34.5M75 33.5 65 34.5" fill="none" />
        </g>
      )}

      {/* Eyes */}
      {happyEyes ? (
        <g stroke={NAVY} strokeWidth={2.8} strokeLinecap="round" fill="none">
          <path d="M45.5 45.5Q49.5 40 53.5 45.5" />
          <path d="M66.5 45.5Q70.5 40 74.5 45.5" />
        </g>
      ) : (
        <g fill={NAVY}>
          <circle cx="50" cy="44.5" r="2.9" />
          <circle cx="70" cy="44.5" r="2.9" />
          <circle cx="50.9" cy="43.6" r="0.9" fill="#fff" />
          <circle cx="70.9" cy="43.6" r="0.9" fill="#fff" />
        </g>
      )}

      {/* Nose */}
      <path d="M60 47.5q-2.5 4.5 0 7" stroke={SKIN_SHADE} strokeWidth={2.2} fill="none" strokeLinecap="round" />

      {/* Mustache */}
      <path
        d="M46 56.5c3.5 5.5 9.5 5 14-1 4.5 6 10.5 6.5 14 1-1.5 7.5-9 10-14 5.5-5 4.5-12.5 2-14-5.5Z"
        fill={MUSTACHE}
      />

      {/* Mouth */}
      {celebrate ? (
        <>
          <path d="M49 62.5Q60 80 71 62.5 60 68.5 49 62.5Z" fill={MOUTH_FILL} />
          <path d="M51.5 62.2h17v2.6q-8.5 2.8-17 0Z" fill="#fff" />
        </>
      ) : sad ? (
        <path d="M52 69.5q8-6 16 0" stroke={MOUTH_LINE} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      ) : (
        <path d="M52 63.5q8 6.5 16 0" stroke={MOUTH_LINE} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      )}

      {/* Sweat drop when sad */}
      {sad && (
        <g fill="#60A5FA">
          <path d="M86 27c2.4 3.4 3.6 5.4 3.6 7a3.6 3.6 0 1 1-7.2 0c0-1.6 1.2-3.6 3.6-7Z" />
        </g>
      )}

      {/* Cheeks */}
      {(happyEyes || waving) && (
        <g fill="#F4A28C" opacity="0.65">
          <circle cx="40" cy="53" r="3.2" />
          <circle cx="80" cy="53" r="3.2" />
        </g>
      )}
    </svg>
  )
}
