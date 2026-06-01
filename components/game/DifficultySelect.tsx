'use client'
import { useState } from 'react'
import { DifficultyKey, DIFFICULTY } from '@/lib/game/difficulty'

const DIFF_META: Record<DifficultyKey, { icon: string; borderColor: string; glowColor: string; xpColor: string }> = {
  easy:   { icon: '🟢', borderColor: '#4ade80', glowColor: 'rgba(74,222,128,0.20)',  xpColor: '#4ade80' },
  medium: { icon: '🟡', borderColor: '#fbbf24', glowColor: 'rgba(251,191,36,0.20)',  xpColor: '#fbbf24' },
  hard:   { icon: '🔴', borderColor: '#f87171', glowColor: 'rgba(248,113,113,0.20)', xpColor: '#f87171' },
}

interface Props {
  onSelect: (key: DifficultyKey) => void
}

export default function DifficultySelect({ onSelect }: Props) {
  const [selected, setSelected] = useState<DifficultyKey | null>(null)

  const handleTap = (key: DifficultyKey) => {
    if (selected === key) {
      onSelect(key)
    } else {
      setSelected(key)
    }
  }

  return (
    <div className="screen-root" style={{ padding: '24px 20px', gap: 0 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <p className="label-mono" style={{ marginBottom: 10 }}>Step 2 of 2</p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 8vw, 48px)',
          color: '#fff',
          letterSpacing: '0.04em',
          lineHeight: 1,
        }}>
          SELECT DIFFICULTY
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 10, letterSpacing: '0.2em' }}>
          TAP ONCE TO PREVIEW · TAP AGAIN TO CONFIRM
        </p>
      </div>

      {/* Cards */}
      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(['easy', 'medium', 'hard'] as DifficultyKey[]).map(key => {
          const d = DIFFICULTY[key]
          const meta = DIFF_META[key]
          const isSelected = selected === key
          return (
            <button
              key={key}
              id={`diff-${key}`}
              onClick={() => handleTap(key)}
              style={{
                background: isSelected ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                border: isSelected ? `1px solid ${meta.borderColor}` : '1px solid rgba(255,255,255,0.1)',
                borderLeft: `4px solid ${meta.borderColor}`,
                borderRadius: 12,
                padding: '18px 20px',
                minHeight: 80,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                boxShadow: isSelected ? `0 0 22px ${meta.glowColor}` : 'none',
                transform: isSelected ? 'scale(1.015)' : 'scale(1)',
                transition: 'all 0.18s ease',
                outline: 'none',
              }}
            >
              {/* Icon */}
              <span style={{ fontSize: 28, flexShrink: 0 }}>{meta.icon}</span>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  color: isSelected ? meta.borderColor : '#fff',
                  letterSpacing: '0.04em',
                  transition: 'color 0.18s',
                }}>
                  {d.label.toUpperCase()}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  marginTop: 4,
                  letterSpacing: '0.05em',
                }}>
                  {d.description}
                </div>
              </div>

              {/* XP badge */}
              <div style={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 20,
                  color: meta.xpColor,
                  letterSpacing: '0.02em',
                }}>
                  {d.xpMult}×
                </span>
                <span className="label-mono" style={{ fontSize: 9 }}>XP</span>
              </div>

              {/* Confirm chevron when selected */}
              {isSelected && (
                <div style={{
                  flexShrink: 0,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: meta.borderColor,
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                }}>
                  TAP TO<br />PLAY ›
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* CTA for large screens or selected state */}
      {selected && (
        <div style={{ width: '100%', maxWidth: 480, marginTop: 20 }}>
          <button
            className="btn-primary"
            onClick={() => onSelect(selected)}
          >
            KICK OFF — {DIFFICULTY[selected].label.toUpperCase()}
          </button>
        </div>
      )}

      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text-dim)',
        marginTop: 28,
        letterSpacing: '0.2em',
        textAlign: 'center',
      }}>
        YOU CAN CHANGE DIFFICULTY ANY TIME IN SETTINGS
      </p>
    </div>
  )
}
