'use client'
import { useState } from 'react'
import { audio } from '@/lib/game/audio'
import { getControlScheme, setControlScheme, ControlScheme } from '@/lib/game/mobile-controls'
import { DifficultyKey } from '@/lib/game/difficulty'

interface Props {
  open:               boolean
  onClose:            () => void
  defaultDifficulty:  DifficultyKey
  onDifficultyChange: (k: DifficultyKey) => void
  onControlsChange?:  (s: ControlScheme) => void
  onReplayTutorial:   () => void
}

function SegmentedControl<T extends string>({
  options, value, onChange, labelMap,
}: {
  options: T[]
  value: T
  onChange: (v: T) => void
  labelMap?: Record<T, string>
}) {
  return (
    <div style={{
      display: 'flex',
      background: 'rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 8,
      padding: 3,
      gap: 3,
    }}>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            flex: 1,
            padding: '8px 6px',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'background 0.15s, color 0.15s',
            background: value === opt ? 'var(--green-btn)' : 'transparent',
            color: value === opt ? '#fff' : 'rgba(255,255,255,0.4)',
            boxShadow: value === opt ? '0 0 10px rgba(74,222,128,0.15)' : 'none',
          }}
        >
          {labelMap ? labelMap[opt] : opt}
        </button>
      ))}
    </div>
  )
}

export default function SettingsModal({
  open, onClose, defaultDifficulty, onDifficultyChange, onControlsChange, onReplayTutorial,
}: Props) {
  const [muted, setMuted]   = useState(() => audio.isMuted())
  const [scheme, setScheme] = useState<ControlScheme>(() => getControlScheme())
  const [diff, setDiff]     = useState<DifficultyKey>(defaultDifficulty)

  if (!open) return null

  const handleMuteToggle = () => {
    if (muted) audio.unmute(); else audio.mute()
    setMuted(!muted)
  }

  const handleScheme = (s: ControlScheme) => {
    setControlScheme(s)
    setScheme(s)
    onControlsChange?.(s)
  }

  const handleDiff = (k: DifficultyKey) => {
    setDiff(k)
    onDifficultyChange(k)
  }

  const controlLabels: Record<ControlScheme, string> = {
    drag: 'DRAG',
    joystick: 'PAD',
    tap: 'TAP',
  }
  const diffLabels: Record<DifficultyKey, string> = {
    easy: 'EASY',
    medium: 'MED',
    hard: 'HARD',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      {/* Bottom sheet */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#0d1f0d',
          border: '1px solid rgba(255,255,255,0.1)',
          borderBottom: 'none',
          borderRadius: '20px 20px 0 0',
          padding: '0 0 max(24px, env(safe-area-inset-bottom))',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            color: '#fff',
            letterSpacing: '0.05em',
          }}>
            SETTINGS
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Audio */}
          <section>
            <p className="label-mono" style={{ marginBottom: 10 }}>Audio</p>
            <button
              onClick={handleMuteToggle}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: 10,
                border: muted
                  ? '1px solid rgba(239,68,68,0.35)'
                  : '1px solid rgba(74,222,128,0.35)',
                background: muted
                  ? 'rgba(239,68,68,0.12)'
                  : 'rgba(74,222,128,0.10)',
                color: muted ? '#fca5a5' : '#4ade80',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.2em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s',
              }}
            >
              <span>{muted ? '🔇  SOUND OFF' : '🔊  SOUND ON'}</span>
              <span style={{
                fontSize: 10,
                opacity: 0.5,
                letterSpacing: '0.1em',
              }}>
                {muted ? 'TAP TO ENABLE' : 'TAP TO MUTE'}
              </span>
            </button>
          </section>

          {/* Controls */}
          <section>
            <p className="label-mono" style={{ marginBottom: 10 }}>Controls</p>
            <SegmentedControl
              options={['drag', 'joystick', 'tap'] as ControlScheme[]}
              value={scheme}
              onChange={handleScheme}
              labelMap={controlLabels}
            />
          </section>

          {/* Difficulty */}
          <section>
            <p className="label-mono" style={{ marginBottom: 10 }}>Difficulty</p>
            <SegmentedControl
              options={['easy', 'medium', 'hard'] as DifficultyKey[]}
              value={diff}
              onChange={handleDiff}
              labelMap={diffLabels}
            />
          </section>

          {/* How to play */}
          <button
            onClick={onReplayTutorial}
            className="btn-ghost"
            style={{ marginTop: 4 }}
          >
            📖  HOW TO PLAY
          </button>
        </div>
      </div>
    </div>
  )
}
