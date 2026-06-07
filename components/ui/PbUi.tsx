'use client'
import React from 'react'

// ── Neon kit type used by UI atoms ─────────────────────────
export interface NeonKit {
  id: string
  name: string
  primary: string
  secondary: string
  trim: string
  pattern: 'solid' | 'hoops' | 'sash'
  unlocked?: boolean
  req?: string
}

// ── Icon set ───────────────────────────────────────────────
const ICON_PATHS: Record<string, React.ReactNode> = {
  play:      <path d="M6 4l14 8-14 8V4z" fill="currentColor" stroke="none"/>,
  trophy:    <g><path d="M7 4h10v4a5 5 0 01-10 0V4z"/><path d="M7 6H4v1a3 3 0 003 3M17 6h3v1a3 3 0 01-3 3"/><path d="M10 13v3h4v-3M8 20h8M9 20l.5-4M15 20l-.5-4"/></g>,
  target:    <g><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></g>,
  shirt:     <path d="M8 3l4 2 4-2 4 3-2.5 3.5L16 9v11H8V9l-1.5.5L4 6l4-3z"/>,
  user:      <g><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></g>,
  gear:      <g><circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></g>,
  arrowR:    <path d="M5 12h14M13 6l6 6-6 6"/>,
  arrowL:    <path d="M19 12H5M11 6l-6 6 6 6"/>,
  lock:      <g><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></g>,
  sound:     <g><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11"/></g>,
  mute:      <g><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M22 9l-6 6M16 9l6 6"/></g>,
  check:     <path d="M4 12l5 5L20 6"/>,
  x:         <path d="M6 6l12 12M18 6L6 18"/>,
  fire:      <path d="M12 3c1 3-1 4-1 6a3 3 0 003 3c1-1 1-2 1-3 2 2 3 4 3 6a6 6 0 11-12 0c0-3 3-5 3-8 0-2 1-3 3-4z"/>,
  bolt:      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" strokeLinejoin="round"/>,
  medal:     <g><circle cx="12" cy="14" r="6"/><path d="M9 3l3 5 3-5M12 11.5l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L9.5 13.8l2-.3 1-2z" strokeWidth="1.2"/></g>,
  back:      <path d="M19 12H5M11 6l-6 6 6 6"/>,
  signout:   <g><path d="M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4"/><path d="M3 12h12M10 7l-5 5 5 5"/></g>,
  chevR:     <path d="M9 6l6 6-6 6"/>,
  globe:     <g><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18"/></g>,
  crosshair: <g><circle cx="12" cy="12" r="9"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/></g>,
}

export function Icon({
  name,
  size = 20,
  stroke = 2,
  style,
  className,
}: {
  name: string
  size?: number
  stroke?: number
  style?: React.CSSProperties
  className?: string
}) {
  const p = ICON_PATHS[name]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0, ...style }}
      className={className}
    >
      {p}
    </svg>
  )
}

// ── Jersey SVG renderer ────────────────────────────────────
export function Jersey({
  kit,
  size = 120,
  num,
  glow = true,
}: {
  kit: NeonKit | string
  size?: number
  num?: number
  glow?: boolean
}) {
  const k = typeof kit === 'object' ? kit : null
  if (!k) return null
  const id = 'jc-' + k.id
  const w = size
  const h = size * 1.08
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 100 108"
      style={{
        display: 'block',
        filter: glow ? `drop-shadow(0 8px 24px ${k.primary}33)` : 'none',
      }}
    >
      <defs>
        <clipPath id={id}>
          <path d="M32 8 L42 14 Q50 17 58 14 L68 8 L88 20 L80 36 L72 32 L72 100 Q72 104 68 104 L32 104 Q28 104 28 100 L28 32 L20 36 L12 20 Z" />
        </clipPath>
        <linearGradient id={id + 'g'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={k.primary} stopOpacity="1" />
          <stop offset="1" stopColor={k.primary} stopOpacity="0.82" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x="0" y="0" width="100" height="108" fill={`url(#${id}g)`} />
        {k.pattern === 'hoops' &&
          [0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x="0"
              y={20 + i * 22}
              width="100"
              height="11"
              fill={k.secondary}
              opacity="0.9"
            />
          ))}
        {k.pattern === 'sash' && (
          <polygon
            points="12,108 0,96 88,8 100,20"
            fill={k.secondary}
            opacity="0.92"
          />
        )}
        <path
          d="M42 14 Q50 24 58 14"
          fill="none"
          stroke={k.trim}
          strokeWidth="3"
        />
        <path
          d="M20 36 L12 20"
          stroke={k.trim}
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M80 36 L88 20"
          stroke={k.trim}
          strokeWidth="3"
          fill="none"
        />
      </g>
      <path
        d="M32 8 L42 14 Q50 17 58 14 L68 8 L88 20 L80 36 L72 32 L72 100 Q72 104 68 104 L32 104 Q28 104 28 100 L28 32 L20 36 L12 20 Z"
        fill="none"
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="1.5"
      />
      {num != null && (
        <text
          x="50"
          y="74"
          textAnchor="middle"
          fontFamily="Anton, sans-serif"
          fontSize="40"
          fill={
            k.id === 'midnight' || k.id === 'aurora' ? k.trim : k.secondary
          }
          opacity="0.92"
        >
          {num}
        </text>
      )}
    </svg>
  )
}

// ── XP bar ─────────────────────────────────────────────────
function xpForLevel(lvl: number) {
  return Math.round(120 * Math.pow(lvl, 1.45))
}
function levelFromXp(xp: number) {
  let lvl = 1
  while (xp >= xpForLevel(lvl + 1)) lvl++
  return lvl
}
function levelProgress(xp: number) {
  const lvl = levelFromXp(xp)
  const cur = xpForLevel(lvl)
  const next = xpForLevel(lvl + 1)
  return { lvl, cur, next, pct: Math.max(0, Math.min(1, (xp - cur) / (next - cur))) }
}
export { levelFromXp, levelProgress }

export function XpBar({ xp }: { xp: number }) {
  const { lvl, pct, cur, next } = levelProgress(xp)
  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 7,
        }}
      >
        <span className="mono-label" style={{ color: 'var(--lime)' }}>
          LVL {lvl}
        </span>
        <span className="mono-label">
          {xp - cur} / {next - cur} XP
        </span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 99,
          background: 'rgba(255,255,255,0.07)',
          overflow: 'hidden',
          border: '1px solid var(--bd)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct * 100}%`,
            borderRadius: 99,
            background: 'linear-gradient(90deg, var(--cyan), var(--lime))',
            boxShadow: '0 0 12px var(--lime-glow)',
            transition: 'width .8s cubic-bezier(.22,1,.36,1)',
          }}
        />
      </div>
    </div>
  )
}

// ── Stat card ──────────────────────────────────────────────
export function StatCard({
  value,
  label,
  color = 'var(--lime)',
  glow = true,
}: {
  value: string | number
  label: string
  color?: string
  glow?: boolean
}) {
  return (
    <div
      className="pb-card"
      style={{
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5,
        textAlign: 'center',
      }}
    >
      <span
        className="display"
        style={{
          fontSize: 'clamp(26px,5vw,38px)',
          color,
          lineHeight: 0.9,
          textShadow: glow ? `0 0 22px ${color}44` : 'none',
        }}
      >
        {value}
      </span>
      <span className="mono-label" style={{ fontSize: 9 }}>
        {label}
      </span>
    </div>
  )
}

// ── Top bar ────────────────────────────────────────────────
export function TopBar({
  title,
  onBack,
  right,
}: {
  title: string
  onBack?: () => void
  right?: React.ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px clamp(16px,4vw,32px)',
        borderBottom: '1px solid var(--bd)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 5,
      }}
    >
      {onBack && (
        <button
          onClick={onBack}
          className="pb-btn pb-btn-ghost"
          style={{ padding: '10px', width: 42, height: 42, borderRadius: 11 }}
          aria-label="Back"
        >
          <Icon name="back" size={18} />
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          className="display"
          style={{
            fontSize: 'clamp(20px,4vw,28px)',
            color: '#fff',
            letterSpacing: '0.04em',
          }}
        >
          {title}
        </p>
      </div>
      {right}
    </div>
  )
}

// ── Screen body ────────────────────────────────────────────
export function ScreenBody({
  children,
  style,
  maxWidth = 1080,
  center,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
  maxWidth?: number
  center?: boolean
}) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        ...style,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth,
          padding:
            'clamp(18px,3.5vw,34px) clamp(16px,4vw,32px) 48px',
          ...(center ? { margin: 'auto 0' } : {}),
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ── Player character — front-facing SVG ────────────────────
export function PlayerCharacter({
  kit,
  size = 200,
}: {
  kit: NeonKit | string | null | undefined
  size?: number
}) {
  const KITS_FALLBACK: NeonKit = {
    id: 'lime', name: 'Lime Strike', primary: '#C8FF00',
    secondary: '#030303', trim: '#63FF47', pattern: 'solid',
  }
  const k: NeonKit =
    (typeof kit === 'object' && kit !== null ? kit : KITS_FALLBACK)

  const skin  = '#F2D5A8'
  const skinD = '#D9A96E'
  const skinS = '#C4894E'
  const hair  = '#1c0e06'
  const white = '#FFFFFF'
  const gid   = 'pcf' + k.id
  const shortsCol =
    k.secondary.toLowerCase() === '#ffffff' ? '#1a1a1a' : k.secondary
  const numCol =
    k.id === 'midnight' || k.id === 'aurora'
      ? k.trim
      : k.secondary === '#030303'
      ? k.trim
      : k.secondary

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <div
        style={{
          position: 'absolute', bottom: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: size * 0.75, height: size * 0.09,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${k.primary}55 0%, transparent 70%)`,
          filter: 'blur(7px)', pointerEvents: 'none',
        }}
      />
      <svg
        viewBox="0 0 80 154"
        width={size}
        style={{
          display: 'block',
          overflow: 'visible',
          animation: 'pb-player-bob 2.4s ease-in-out infinite',
          filter: `drop-shadow(0 ${Math.round(size * 0.055)}px ${Math.round(size * 0.085)}px rgba(0,0,0,0.52))`,
        }}
      >
        <style>{`@keyframes pb-player-bob{0%,100%{transform:translateY(0);}50%{transform:translateY(-${Math.round(size * 0.02)}px);}}`}</style>
        <defs>
          <linearGradient id={gid + 'j'} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(0,0,0,0.26)" />
            <stop offset="42%"  stopColor="rgba(255,255,255,0.10)" />
            <stop offset="58%"  stopColor="rgba(255,255,255,0.10)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.24)" />
          </linearGradient>
          <linearGradient id={gid + 'l'} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(0,0,0,0.20)" />
            <stop offset="50%"  stopColor="rgba(255,255,255,0.14)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.16)" />
          </linearGradient>
          <radialGradient id={gid + 'face'} cx="42%" cy="38%" r="58%">
            <stop offset="0%"   stopColor={skin} />
            <stop offset="70%"  stopColor={skin} />
            <stop offset="100%" stopColor={skinD} />
          </radialGradient>
        </defs>

        {/* LEFT LEG */}
        <path d={`M18 95 L32 95 L30 118 L16 118 Z`} fill={skin} />
        <path d={`M18 95 L32 95 L30 118 L16 118 Z`} fill={`url(#${gid}l)`} />
        <path d="M16 118 L30 118 L28 133 L14 133 Z" fill={k.trim} />
        <path d="M16 118 L30 118 L29 124 L15 124 Z" fill="rgba(0,0,0,0.14)" />
        <path d="M10 129 L30 131 L29 141 L9 140 Z" fill="#111" />
        <path d="M10 130 L29 132" stroke="rgba(255,255,255,0.3)" strokeWidth="1.3" strokeDasharray="2.5 2" />
        <path d="M8 139 L30 141 L31 145 L7 144 Z" fill={k.trim} />
        <ellipse cx="13" cy="141" rx="6" ry="2.6" fill="#1c1c1c" />

        {/* RIGHT LEG */}
        <path d="M48 95 L62 95 L64 118 L50 118 Z" fill={skin} />
        <path d="M48 95 L62 95 L64 118 L50 118 Z" fill={`url(#${gid}l)`} />
        <path d="M50 118 L64 118 L66 133 L52 133 Z" fill={k.trim} />
        <path d="M50 118 L64 118 L65 124 L51 124 Z" fill="rgba(0,0,0,0.14)" />
        <path d="M50 129 L70 127 L72 137 L50 139 Z" fill="#111" />
        <path d="M51 131 L69 129" stroke="rgba(255,255,255,0.3)" strokeWidth="1.3" strokeDasharray="2.5 2" />
        <path d="M49 137 L72 136 L73 140 L48 141 Z" fill={k.trim} />
        <ellipse cx="68" cy="137" rx="6" ry="2.6" fill="#1c1c1c" />

        {/* SHORTS */}
        <path d="M16 76 L64 76 L66 98 L14 98 Z" fill={shortsCol} />
        <line x1="40" y1="76" x2="40" y2="98" stroke="rgba(0,0,0,0.2)" strokeWidth="1.2" />
        <path d="M14 91 L66 91 L66 98 L14 98 Z" fill={k.trim} opacity="0.45" />

        {/* LEFT SLEEVE */}
        <path d="M10 36 L20 32 L16 58 L4 62 Z" fill={k.primary} />
        <path d="M10 36 L20 32 L16 58 L4 62 Z" fill={`url(#${gid}j)`} />
        <path d="M4 60 L16 57 L16 63 L4 64 Z" fill={k.trim} opacity="0.82" />

        {/* RIGHT SLEEVE */}
        <path d="M60 32 L70 36 L76 62 L64 58 Z" fill={k.primary} />
        <path d="M60 32 L70 36 L76 62 L64 58 Z" fill={`url(#${gid}j)`} />
        <path d="M64 57 L76 60 L76 64 L64 63 Z" fill={k.trim} opacity="0.82" />

        {/* JERSEY FRONT */}
        <path d="M20 32 L60 32 Q66 44 64 76 L16 76 Q14 44 20 32 Z" fill={k.primary} />
        <path d="M20 32 L60 32 Q66 44 64 76 L16 76 Q14 44 20 32 Z" fill={`url(#${gid}j)`} />
        {k.pattern === 'hoops' && (
          <>
            <path d="M16 44 Q40 42 64 44 L64 52 Q40 54 16 52 Z" fill={k.secondary} opacity="0.88" />
            <path d="M15 60 Q40 58 65 60 L65 68 Q40 70 15 68 Z" fill={k.secondary} opacity="0.88" />
          </>
        )}
        {k.pattern === 'sash' && (
          <polygon points="20,76 20,60 60,32 60,48" fill={k.secondary} opacity="0.88" />
        )}
        <path d="M33 32 L40 42 L47 32" fill="none" stroke={k.trim} strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" />
        <text x="40" y="68" textAnchor="middle" fontFamily="Anton,sans-serif" fontSize="20" fill={numCol} opacity="0.90">9</text>

        {/* FOREARMS */}
        <path d="M4 60 L12 58 L10 80 L2 78 Z" fill={skin} />
        <path d="M4 60 L12 58 L10 80 L2 78 Z" fill={`url(#${gid}l)`} />
        <ellipse cx="6" cy="81" rx="5" ry="3.4" fill={skin} transform="rotate(-6 6 81)" />
        <path d="M68 58 L76 60 L78 80 L70 78 Z" fill={skin} />
        <path d="M68 58 L76 60 L78 80 L70 78 Z" fill={`url(#${gid}l)`} />
        <ellipse cx="74" cy="81" rx="5" ry="3.4" fill={skin} transform="rotate(6 74 81)" />

        {/* NECK */}
        <path d="M35 28 L45 28 L44 34 L36 34 Z" fill={skin} />
        <path d="M35 28 L45 28 L44 31 L36 31 Z" fill={skinD} />

        {/* HEAD */}
        <ellipse cx="40" cy="16" rx="14" ry="15" fill={`url(#${gid}face)`} />
        <ellipse cx="26.5" cy="17" rx="5.5" ry="11" fill="rgba(0,0,0,0.07)" />
        <ellipse cx="53.5" cy="17" rx="5.5" ry="11" fill="rgba(0,0,0,0.07)" />
        <ellipse cx="26" cy="18" rx="3.2" ry="4.8" fill={skinD} />
        <ellipse cx="26" cy="18" rx="1.8" ry="2.8" fill={skinS} opacity="0.5" />
        <ellipse cx="54" cy="18" rx="3.2" ry="4.8" fill={skinD} />
        <ellipse cx="54" cy="18" rx="1.8" ry="2.8" fill={skinS} opacity="0.5" />

        {/* HAIR */}
        <path d="M26 14 A14 15 0 0 1 54 14 Q52 0 40 1 Q28 1 26 14 Z" fill={hair} />
        <path d="M27 14 Q27 20 29 22" fill="none" stroke={hair} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M53 14 Q53 20 51 22" fill="none" stroke={hair} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M31 8 Q34 5 37 7 Q38 3 42 4 Q46 2 49 7" fill="none" stroke={hair} strokeWidth="2" strokeLinecap="round" />

        {/* EYEBROWS */}
        <path d="M30 18 Q34 15.5 38 17" fill="none" stroke="#5C3010" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M42 17 Q46 15.5 50 18" fill="none" stroke="#5C3010" strokeWidth="2.2" strokeLinecap="round" />

        {/* EYES */}
        <ellipse cx="34.5" cy="20.5" rx="4.5" ry="3.2" fill={white} />
        <ellipse cx="45.5" cy="20.5" rx="4.5" ry="3.2" fill={white} />
        <circle cx="34.8" cy="21" r="2.4" fill="#3B1F08" />
        <circle cx="45.8" cy="21" r="2.4" fill="#3B1F08" />
        <circle cx="35" cy="21.2" r="1.3" fill="#0a0604" />
        <circle cx="46" cy="21.2" r="1.3" fill="#0a0604" />
        <circle cx="35.8" cy="20.3" r="0.75" fill={white} />
        <circle cx="46.8" cy="20.3" r="0.75" fill={white} />
        <path d="M30 23 Q34.5 24.5 39 23" fill="none" stroke={skinD} strokeWidth="0.9" />
        <path d="M41 23 Q45.5 24.5 50 23" fill="none" stroke={skinD} strokeWidth="0.9" />

        {/* NOSE */}
        <path d="M38.5 22 Q37 26.5 36.5 27.5 Q38.5 29 40 28.8 Q41.5 29 43.5 27.5 Q43 26.5 41.5 22" fill="none" stroke={skinD} strokeWidth="1.3" strokeLinecap="round" />
        <ellipse cx="40" cy="28.2" rx="2.8" ry="1.2" fill={skinD} opacity="0.7" />

        {/* MOUTH */}
        <path d="M35 31.5 Q40 34.5 45 31.5" fill="none" stroke={skinS} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M36.5 32.8 Q40 34 43.5 32.8" fill={skinD} opacity="0.45" />
        <path d="M40 28.8 L40 31.2" stroke={skinD} strokeWidth="0.8" opacity="0.6" />
        <ellipse cx="40" cy="29.5" rx="8" ry="2" fill="rgba(0,0,0,0.06)" opacity="0.7" />
        <ellipse cx="40" cy="29" rx="5.5" ry="2" fill="rgba(0,0,0,0.14)" />
      </svg>
    </div>
  )
}
