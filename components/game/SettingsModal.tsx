'use client'
import { useState } from 'react'
import { audio } from '@/lib/game/audio'
import { getControlScheme, setControlScheme, type ControlScheme } from '@/lib/game/mobile-controls'
import { Icon } from '@/components/ui/PbUi'

interface Props {
  open: boolean
  onClose: () => void
  onControlsChange?: (s: ControlScheme) => void
  onReplayTutorial?: () => void
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      type="button"
      aria-pressed={on}
      style={{
        width: 46, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
        background: on ? 'var(--lime)' : 'rgba(255,255,255,0.1)',
        position: 'relative', flexShrink: 0, transition: 'background 0.2s',
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: on ? 23 : 3, width: 20, height: 20,
        borderRadius: '50%', background: on ? '#020402' : 'rgba(255,255,255,0.5)',
        transition: 'left 0.2s, background 0.2s',
      }} />
    </button>
  )
}

const CONTROLS: { key: ControlScheme; icon: string; label: string }[] = [
  { key: 'drag',     icon: '⤢', label: 'Drag' },
  { key: 'joystick', icon: '◎', label: 'Pad' },
  { key: 'tap',      icon: '◉', label: 'Tap' },
]

export default function SettingsModal({ open, onClose, onControlsChange, onReplayTutorial }: Props) {
  const [muted, setMuted]   = useState(() => audio.isMuted())
  const [scheme, setScheme] = useState<ControlScheme>(() => getControlScheme())

  if (!open) return null

  const handleMute = () => {
    if (muted) audio.unmute(); else audio.mute()
    setMuted(!muted)
  }

  const handleScheme = (s: ControlScheme) => {
    setControlScheme(s); setScheme(s); onControlsChange?.(s)
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 500,
          background: 'var(--surface)', border: '1px solid var(--bd)', borderBottom: 'none',
          borderRadius: '20px 20px 0 0',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 6px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 22px 16px', borderBottom: '1px solid var(--bd)' }}>
          <h2 className="display" style={{ fontSize: 24, color: '#fff', letterSpacing: '0.06em' }}>SETTINGS</h2>
          <button
            onClick={onClose}
            style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--bd)', color: 'var(--txt-3)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Sound */}
          <section>
            <p className="mono-label" style={{ marginBottom: 10 }}>Sound</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--bd)', borderRadius: 12 }}>
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#fff', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 3 }}>Game Sound</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--txt-3)' }}>{muted ? 'All sounds disabled' : 'Crowd, power bar, goals'}</p>
              </div>
              <Toggle on={!muted} onToggle={handleMute} />
            </div>
          </section>

          {/* Controls */}
          <section>
            <p className="mono-label" style={{ marginBottom: 10 }}>Control Style</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {CONTROLS.map(({ key, icon, label }) => (
                <button
                  key={key}
                  onClick={() => handleScheme(key)}
                  style={{
                    padding: '12px 8px', borderRadius: 12, cursor: 'pointer',
                    background: scheme === key ? 'rgba(200,255,0,0.08)' : 'rgba(255,255,255,0.03)',
                    border: scheme === key ? '1px solid var(--bd-lime)' : '1px solid var(--bd)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    transition: 'border-color .15s, background .15s',
                  }}
                >
                  <span style={{ fontSize: 20, color: scheme === key ? 'var(--lime)' : 'var(--txt-2)' }}>{icon}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: scheme === key ? 'var(--lime)' : 'var(--txt-3)' }}>{label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* How to play */}
          {onReplayTutorial && (
            <button onClick={onReplayTutorial} className="pb-btn pb-btn-ghost" style={{ width: '100%' }}>
              How to Play
            </button>
          )}

          <button onClick={onClose} className="pb-btn pb-btn-primary" style={{ width: '100%' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
