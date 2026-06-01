'use client'
import { useState } from 'react'
import { DifficultyKey, DIFFICULTY } from '@/lib/game/difficulty'

const DIFF_CONFIG = {
  easy:   {
    color: '#4ade80', glow: 'rgba(74,222,128,0.18)',
    bg: 'linear-gradient(160deg, #052210 0%, #0a3d1a 100%)',
    stats: [
      { label: 'Keeper Delay', value: '600ms' },
      { label: 'AI Weight',    value: '20%' },
      { label: 'XP Mult',     value: '1×' },
    ],
  },
  medium: {
    color: '#f59e0b', glow: 'rgba(245,158,11,0.18)',
    bg: 'linear-gradient(160deg, #1c1100 0%, #3d2800 100%)',
    stats: [
      { label: 'Keeper Delay', value: '350ms' },
      { label: 'AI Weight',    value: '60%' },
      { label: 'XP Mult',     value: '1.5×' },
    ],
  },
  hard: {
    color: '#f87171', glow: 'rgba(248,113,113,0.18)',
    bg: 'linear-gradient(160deg, #1c0404 0%, #3d0a0a 100%)',
    stats: [
      { label: 'Keeper Delay', value: '120ms' },
      { label: 'AI Weight',    value: '90%' },
      { label: 'XP Mult',     value: '2.5×' },
    ],
  },
}

interface Props {
  onSelect: (key: DifficultyKey) => void
  onBack?: () => void
}

export default function DifficultySelect({ onSelect, onBack }: Props) {
  const [active, setActive] = useState<DifficultyKey | null>(null)

  const handleTap = (key: DifficultyKey) => {
    if (active === key) onSelect(key)
    else setActive(key)
  }

  return (
    <div className="diff-root">
      {/* Header */}
      <div style={{
        padding: 'clamp(16px,3vh,28px) clamp(16px,4vw,28px) 0',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 5,
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)', borderRadius: 8,
                padding: '8px 14px', cursor: 'pointer',
                transition: 'color 0.15s, background 0.15s',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              &larr; Back
            </button>
          )}
          <div>
            <p className="label-mono" style={{ marginBottom: 4 }}>Step 2 of 2</p>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(22px, 5vw, 40px)',
              color: '#fff',
              letterSpacing: '0.04em',
              lineHeight: 1,
            }}>
              SELECT DIFFICULTY
            </h1>
          </div>
        </div>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text-dim)',
          letterSpacing: '0.2em',
          marginTop: 4,
          paddingLeft: onBack ? 0 : 0,
        }}>
          TAP ONCE TO PREVIEW · AGAIN TO CONFIRM
        </p>
      </div>

      {/* Panels */}
      <div className="diff-panels" style={{ padding: 'clamp(12px,2vh,20px) clamp(10px,2vw,20px) clamp(16px,3vh,28px)' }}>
        {(['easy', 'medium', 'hard'] as DifficultyKey[]).map((key, i) => {
          const d   = DIFFICULTY[key]
          const cfg = DIFF_CONFIG[key]
          const isActive = active === key

          return (
            <button
              key={key}
              id={`diff-${key}`}
              onClick={() => handleTap(key)}
              style={{
                background: isActive ? cfg.bg : 'rgba(255,255,255,0.02)',
                border: 'none',
                borderTop: `3px solid ${isActive ? cfg.color : 'rgba(255,255,255,0.08)'}`,
                /* On mobile (stacked), use left border instead */
                borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'clamp(10px,1.8vh,18px)',
                padding: 'clamp(18px,2.5vw,28px) clamp(12px,2vw,20px)',
                cursor: 'pointer',
                outline: 'none',
                transition: 'background 0.28s, border-top-color 0.28s, box-shadow 0.28s',
                boxShadow: isActive ? `inset 0 0 60px ${cfg.glow}` : 'none',
                WebkitTapHighlightColor: 'transparent',
                minHeight: 'clamp(140px, 22vh, 260px)',
              }}
            >
              {/* Name */}
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(26px, 4.5vw, 52px)',
                color: isActive ? cfg.color : 'rgba(255,255,255,0.45)',
                letterSpacing: '0.04em',
                lineHeight: 1,
                transition: 'color 0.25s',
                textAlign: 'center',
              }}>
                {d.label.toUpperCase()}
              </div>

              {/* Description — hide on very small mobile */}
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(9px, 1.1vw, 11px)',
                color: isActive ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)',
                textAlign: 'center',
                letterSpacing: '0.05em',
                lineHeight: 1.6,
                maxWidth: 200,
                transition: 'color 0.25s',
              }}>
                {d.description}
              </p>

              {/* Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100%', maxWidth: 170 }}>
                {cfg.stats.map(({ label, value }) => (
                  <div key={label} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '5px 9px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 6,
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                      {label}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: isActive ? cfg.color : 'var(--text-secondary)' }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div style={{
                width: '100%', maxWidth: 170,
                padding: '10px 0',
                border: `1px solid ${isActive ? cfg.color : 'rgba(255,255,255,0.10)'}`,
                borderRadius: 8,
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: isActive ? cfg.color : 'var(--text-muted)',
                textAlign: 'center',
                transition: 'border-color 0.25s, color 0.25s',
              }}>
                {isActive ? 'TAP TO PLAY' : 'SELECT'}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
