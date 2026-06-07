'use client'

export type KeeperDive = 'left' | 'right' | 'center' | null

interface KeeperProps {
  size?: number
  dive?: KeeperDive
}

export default function Keeper({ size = 110, dive = null }: KeeperProps) {
  const tx = dive === 'left' ? -105 : dive === 'right' ? 105 : dive === 'center' ? 0 : 0
  const ty = dive === 'center' ? -60 : 0
  const rot = dive === 'left' ? -42 : dive === 'right' ? 42 : 0

  return (
    <div
      style={{
        width: size,
        transform: dive
          ? `translate(${tx}%, ${ty}%) rotate(${rot}deg)`
          : undefined,
        transition: dive ? 'transform 0.32s cubic-bezier(0.1,0,0.35,1)' : 'none',
      }}
    >
      <style>{`
        @keyframes pb-keeper-sway {
          0%,100%{transform:translateX(0)}50%{transform:translateX(9px)}
        }
      `}</style>
      <div style={{ animation: dive ? 'none' : 'pb-keeper-sway 1.9s ease-in-out infinite' }}>
        <svg viewBox="0 0 66 92" width={size} height={size * (92 / 66)} style={{ overflow: 'visible', display: 'block' }}>
          {/* Head */}
          <ellipse cx="33" cy="11" rx="11" ry="11" fill="#f0c8a0" />
          {/* Hair */}
          <path d="M22 9 Q33 1 44 9 Q43 4 33 2 Q23 4 22 9Z" fill="#3a2418" />
          {/* Eyes */}
          <ellipse cx="28" cy="12" rx="1.5" ry="1.5" fill="#2a1a10" />
          <ellipse cx="38" cy="12" rx="1.5" ry="1.5" fill="#2a1a10" />
          {/* Chin / jaw */}
          <ellipse cx="33" cy="20" rx="8" ry="4.5" fill="#f0c8a0" />

          {/* Jersey body — cyan */}
          <path d="M17 24 Q11 22 11 36 L11 60 Q11 61 14 61 L52 61 Q55 61 55 60 L55 36 Q55 22 49 24 L44 21 Q39 29 33 29 Q27 29 22 21Z" fill="#00D9C7" />
          {/* Jersey collar */}
          <path d="M27 21 Q33 26 33 26 Q33 26 39 21 Q36 19 33 19 Q30 19 27 21Z" fill="#028f87" />
          {/* Number */}
          <text x="33" y="49" textAnchor="middle" fontFamily="var(--font-display,sans-serif)" fontSize="14" fontWeight="bold" fill="#030303">1</text>

          {/* Shorts */}
          <rect x="18" y="60" width="13" height="16" rx="3" fill="#041412" />
          <rect x="32" y="60" width="13" height="16" rx="3" fill="#041412" />

          {/* Socks */}
          <rect x="19" y="75" width="11" height="10" rx="2" fill="#00D9C7" />
          <rect x="33" y="75" width="11" height="10" rx="2" fill="#00D9C7" />

          {/* Boots */}
          <ellipse cx="24" cy="87" rx="9" ry="4.5" fill="#1a1a1a" />
          <ellipse cx="38" cy="87" rx="9" ry="4.5" fill="#1a1a1a" />

          {/* Left arm outstretched */}
          <path d="M17 27 Q7 30 3 43 Q2 49 5 50 L15 38Z" fill="#00D9C7" />
          {/* Left glove */}
          <circle cx="4" cy="50" r="6.5" fill="#C8FF00" />
          <circle cx="4" cy="50" r="3.5" fill="#a8d900" />

          {/* Right arm outstretched */}
          <path d="M49 27 Q59 30 63 43 Q64 49 61 50 L51 38Z" fill="#00D9C7" />
          {/* Right glove */}
          <circle cx="62" cy="50" r="6.5" fill="#C8FF00" />
          <circle cx="62" cy="50" r="3.5" fill="#a8d900" />
        </svg>
      </div>
    </div>
  )
}
