'use client'
import type { NeonKit } from '@/components/ui/PbUi'

interface ShooterProps {
  kit: NeonKit
  size?: number
  kicking?: boolean
}

export default function Shooter({ kit, size = 148, kicking = false }: ShooterProps) {
  return (
    <div style={{ width: size, flexShrink: 0 }}>
      <svg
        viewBox="0 0 72 100"
        width={size}
        height={size * (100 / 72)}
        style={{ overflow: 'visible', display: 'block' }}
      >
        {/* Back of head */}
        <ellipse cx="36" cy="11" rx="11.5" ry="11" fill="#2a1a0e" />
        {/* Neck */}
        <rect x="31" y="20" width="10" height="7" rx="3" fill="#2a1a0e" />

        {/* Jersey back body */}
        <path d="M19 28 Q12 26 12 42 L12 66 Q12 67 15 67 L57 67 Q60 67 60 66 L60 42 Q60 26 53 28 L48 25 Q43 33 36 33 Q29 33 24 25Z" fill={kit.primary} />

        {/* Pattern overlays */}
        {kit.pattern === 'sash' && (
          <path d="M24 25 L48 67 L42 67 L18 25Z" fill={kit.secondary} opacity="0.55" clipPath="url(#jersey-clip)" />
        )}
        {kit.pattern === 'hoops' && (
          <>
            <rect x="12" y="40" width="48" height="8" fill={kit.secondary} opacity="0.7" />
            <rect x="12" y="56" width="48" height="7" fill={kit.secondary} opacity="0.7" />
          </>
        )}

        {/* Back number */}
        <text
          x="36" y="55"
          textAnchor="middle"
          fontFamily="var(--font-display,sans-serif)"
          fontSize="15" fontWeight="bold"
          fill={kit.trim ?? '#fff'}
        >
          9
        </text>

        {/* Shorts */}
        <rect x="20" y="66" width="14" height="18" rx="3" fill={kit.secondary} />
        <rect x="36" y="66" width="14" height="18" rx="3" fill={kit.secondary} />

        {/* Left leg (plant — static) */}
        <rect x="21" y="83" width="12" height="12" rx="2" fill={kit.primary} />
        <ellipse cx="27" cy="96" rx="9.5" ry="4.5" fill="#131313" />

        {/* Right leg (kick) — CSS transform pivot at hip */}
        <g
          style={{
            transformOrigin: '43px 66px',
            transform: kicking ? 'rotate(-58deg) translateY(-6px)' : 'rotate(6deg)',
            transition: kicking
              ? 'transform 0.19s cubic-bezier(0.2,0,0.55,1)'
              : 'transform 0.15s ease',
          }}
        >
          <rect x="37" y="83" width="12" height="12" rx="2" fill={kit.primary} />
          <ellipse cx="43" cy="96" rx="9.5" ry="4.5" fill="#131313" />
        </g>

        {/* Left arm */}
        <path d="M19 30 Q9 37 6 51 Q5 56 8 57 L18 44Z" fill={kit.primary} />
        {/* Right arm */}
        <path d="M53 30 Q63 37 66 51 Q67 56 64 57 L54 44Z" fill={kit.primary} />
      </svg>
    </div>
  )
}
