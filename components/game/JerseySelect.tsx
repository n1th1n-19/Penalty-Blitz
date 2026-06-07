'use client'
import { useEffect, useRef, useState } from 'react'
import { Kit } from '../../lib/game/types'
import { CLUB_KITS, COUNTRY_KITS } from '../../lib/game/kits'
import { drawMiniCharacter } from '../../lib/game/CharacterRenderer'

interface Props {
  onSelect: (kit: Kit) => void
  initialKitId?: string
  initialPlayerName?: string
  initialPlayerNumber?: number
  submitLabel?: string
  onBack?: () => void
}

function KitCard({ kit, selected, onSelect }: { kit: Kit; selected: boolean; onSelect: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, 64, 90)
    drawMiniCharacter(ctx, 32, 82, kit)
  }, [kit])

  return (
    <button
      onClick={onSelect}
      style={{
        background: selected ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)',
        border: selected ? '2px solid var(--green-accent)' : '1px solid var(--border)',
        borderRadius: 10,
        padding: '6px 4px 5px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        transition: 'all 0.15s ease',
        transform: selected ? 'scale(1.04)' : 'scale(1)',
        boxShadow: selected ? '0 0 18px rgba(34,197,94,0.22)' : 'none',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        width: '100%',
      }}
    >
      <canvas ref={canvasRef} width={64} height={90} style={{ display: 'block' }} />
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        fontWeight: 700,
        letterSpacing: '0.05em',
        color: selected ? 'var(--green-accent)' : 'var(--text-muted)',
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
        textAlign: 'center',
      }}>
        {kit.shortName}
      </span>
    </button>
  )
}

function PreviewCanvas({ kit }: { kit: Kit }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, 120, 170)
    drawMiniCharacter(ctx, 60, 155, kit)
  }, [kit])
  return <canvas ref={ref} width={120} height={170} style={{ display: 'block' }} />
}

export default function JerseySelect({
  onSelect,
  initialKitId,
  initialPlayerName,
  initialPlayerNumber,
  submitLabel = 'KICK OFF',
  onBack,
}: Props) {
  const resolved = initialKitId
    ? ([...COUNTRY_KITS, ...CLUB_KITS].find(k => k.id === initialKitId) ?? COUNTRY_KITS[0])
    : COUNTRY_KITS[0]

  const [tab, setTab] = useState<'club' | 'country'>(resolved.type === 'club' ? 'club' : 'country')
  const [selected, setSelected] = useState<Kit>(resolved)
  const [playerName, setPlayerName] = useState(initialPlayerName ?? '')
  const [playerNumber, setPlayerNumber] = useState(initialPlayerNumber ?? 10)

  const kits = tab === 'club' ? CLUB_KITS : COUNTRY_KITS
  const augmentedKit: Kit = { ...selected, playerName: playerName || undefined, playerNumber }

  const handleConfirm = () => onSelect(augmentedKit)

  return (
    <div className="jersey-root">
      <div className="jersey-split">
        {/* ── Left / top: live preview ── */}
        <div className="jersey-preview">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%' }}>
            <p className="label-mono" style={{ color: 'var(--green-accent)' }}>Selected Kit</p>

            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                position: 'absolute', bottom: 10, width: 100, height: 24,
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(34,197,94,0.22) 0%, transparent 70%)',
                filter: 'blur(6px)',
                pointerEvents: 'none',
              }} />
              <PreviewCanvas kit={augmentedKit} />
            </div>

            {/* Name + Number inputs */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <span className="label-mono" style={{ display: 'block', marginBottom: 4 }}>Player Name</span>
                <input
                  className="input-dark"
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value.toUpperCase().slice(0, 10))}
                  placeholder="YOUR NAME"
                  maxLength={10}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div>
                <span className="label-mono" style={{ display: 'block', marginBottom: 4 }}>Squad No.</span>
                <input
                  className="input-dark"
                  type="number"
                  min={1}
                  max={99}
                  value={playerNumber}
                  onChange={e => {
                    const n = parseInt(e.target.value)
                    if (!isNaN(n) && n >= 1 && n <= 99) setPlayerNumber(n)
                  }}
                />
              </div>
            </div>
          </div>

          {/* CTA — hidden on mobile (sticky bottom used instead) */}
          <button
            onClick={handleConfirm}
            className="btn-primary"
            style={{ display: 'none' }}
            id="jersey-desktop-cta"
          >
            {submitLabel}
          </button>

          <style>{`
            @media (min-width: 640px) {
              #jersey-desktop-cta { display: inline-flex !important; max-width: 200px; }
            }
          `}</style>
        </div>

        {/* ── Right / bottom: grid ── */}
        <div className="jersey-grid-panel">
          <div style={{ padding: 'clamp(14px,3vw,22px) clamp(14px,3vw,20px) 0' }}>
            {/* Back + title row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
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
                    padding: '7px 12px', cursor: 'pointer',
                    transition: 'color 0.15s, background 0.15s',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  &larr; Back
                </button>
              )}
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(20px, 5vw, 32px)',
                color: '#fff',
                letterSpacing: '0.04em',
              }}>
                CHOOSE YOUR KIT
              </h1>
            </div>
            <div className="tabs">
              {(['country', 'club'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`tab-btn${tab === t ? ' active' : ''}`}
                >
                  {t === 'club' ? 'Club Kits' : 'International'}
                </button>
              ))}
            </div>
          </div>

          <div className="jersey-grid-scroll">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
              gap: 8,
            }}>
              {kits.map(kit => (
                <KitCard
                  key={kit.id}
                  kit={kit}
                  selected={selected.id === kit.id}
                  onSelect={() => setSelected(kit)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky CTA — mobile only */}
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        padding: 'max(12px, env(safe-area-inset-bottom)) 16px 16px',
        background: 'linear-gradient(to top, #04071a 55%, transparent)',
        zIndex: 20,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <button
          onClick={handleConfirm}
          className="btn-primary"
          style={{ maxWidth: 400, pointerEvents: 'all' }}
          id="jersey-mobile-cta"
        >
          {submitLabel}
        </button>
      </div>

      <style>{`
        @media (min-width: 640px) {
          #jersey-mobile-cta { display: none !important; }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </div>
  )
}
