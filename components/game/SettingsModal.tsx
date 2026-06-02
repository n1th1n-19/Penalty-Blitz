'use client'
import { useState } from 'react'
import { audio } from '@/lib/game/audio'
import { getControlScheme, setControlScheme, ControlScheme } from '@/lib/game/mobile-controls'
interface Props {
  open: boolean
  onClose: () => void
  onControlsChange?: (s: ControlScheme) => void
  onReplayTutorial: () => void
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`toggle-track${on ? ' on' : ''}`}
      type="button"
      aria-pressed={on}
    >
      <div className="toggle-thumb" />
    </button>
  )
}

export default function SettingsModal({
  open, onClose, onControlsChange, onReplayTutorial,
}: Props) {
  const [muted, setMuted]   = useState(() => audio.isMuted())
  const [scheme, setScheme] = useState<ControlScheme>(() => getControlScheme())

  if (!open) return null

  const handleMute = () => { if (muted) audio.unmute(); else audio.mute(); setMuted(!muted) }
  const handleScheme = (s: ControlScheme) => { setControlScheme(s); setScheme(s); onControlsChange?.(s) }

  const CONTROLS: { key: ControlScheme; icon: string; label: string }[] = [
    { key: 'drag',     icon: '⤢',  label: 'Drag' },
    { key: 'joystick', icon: '◎',  label: 'Pad' },
    { key: 'tap',      icon: '◉',  label: 'Tap' },
  ]

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480,
          background: '#0b1a0d',
          border: '1px solid var(--border)',
          borderBottom: 'none',
          borderRadius: '20px 20px 0 0',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 6px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 20px 16px',
          borderBottom: '1px solid var(--border)',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: '#fff', letterSpacing: '0.05em' }}>
            SETTINGS
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(255,255,255,0.07)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* Sound */}
          <section>
            <p className="settings-section-label">Sound</p>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              borderRadius: 10,
            }}>
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)', fontWeight: 700, letterSpacing: '0.1em' }}>
                  Game Sound
                </p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                  {muted ? 'All sounds disabled' : 'Crowd, power bar, goals'}
                </p>
              </div>
              <Toggle on={!muted} onToggle={handleMute} />
            </div>
          </section>

          {/* Controls */}
          <section>
            <p className="settings-section-label">Controls</p>
            <div className="controls-icon-row">
              {CONTROLS.map(({ key, icon, label }) => (
                <button
                  key={key}
                  onClick={() => handleScheme(key)}
                  className={`control-icon-btn${scheme === key ? ' active' : ''}`}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Tutorial */}
          <button onClick={onReplayTutorial} className="btn-ghost" style={{ marginTop: -4 }}>
            How to Play
          </button>
        </div>
      </div>
    </div>
  )
}
