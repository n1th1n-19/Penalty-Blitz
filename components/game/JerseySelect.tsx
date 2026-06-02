'use client'
import { useEffect, useRef, useState } from 'react'
import { Kit } from '../../lib/game/types'
import { CLUB_KITS, COUNTRY_KITS } from '../../lib/game/kits'
import { drawMiniCharacter } from '../../lib/game/CharacterRenderer'

interface Props {
  onSelect: (kit: Kit) => void
  initialKitId?: string
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
    ctx.clearRect(0, 0, 80, 110)
    drawMiniCharacter(ctx, 40, 100, kit)
  }, [kit])

  return (
    <button
      onClick={onSelect}
      style={{
        background: selected ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)',
        border: selected ? '2px solid var(--green-accent)' : '1px solid var(--border)',
        borderRadius: 12,
        padding: '8px 6px 6px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        transition: 'all 0.15s ease',
        transform: selected ? 'scale(1.04)' : 'scale(1)',
        boxShadow: selected ? '0 0 18px rgba(34,197,94,0.22)' : 'none',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <canvas ref={canvasRef} width={80} height={110} style={{ display: 'block' }} />
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
    ctx.clearRect(0, 0, 140, 200)
    drawMiniCharacter(ctx, 70, 180, kit)
  }, [kit])
  return <canvas ref={ref} width={140} height={200} style={{ display: 'block' }} />
}

export default function JerseySelect({ onSelect, initialKitId, submitLabel = 'KICK OFF', onBack }: Props) {
  const resolved = initialKitId
    ? ([...CLUB_KITS, ...COUNTRY_KITS].find(k => k.id === initialKitId) ?? CLUB_KITS[0])
    : CLUB_KITS[0]

  const [tab, setTab] = useState<'club' | 'country'>(resolved.type === 'country' ? 'country' : 'club')
  const [selected, setSelected] = useState<Kit>(resolved)
  const kits = tab === 'club' ? CLUB_KITS : COUNTRY_KITS

  return (
    <div className="jersey-root">
      <div className="jersey-split">
        {/* ── Left / top: live preview ── */}
        <div className="jersey-preview">
          {/* Desktop: full vertical preview */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <p className="label-mono" style={{ color: 'var(--green-accent)' }}>Selected Kit</p>

            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                position: 'absolute', bottom: 10, width: 100, height: 24,
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(34,197,94,0.22) 0%, transparent 70%)',
                filter: 'blur(6px)',
                pointerEvents: 'none',
              }} />
              <PreviewCanvas kit={selected} />
            </div>

          </div>

          {/* CTA — hidden on mobile (sticky bottom used instead) */}
          <button
            onClick={() => onSelect(selected)}
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
              {(['club', 'country'] as const).map(t => (
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))',
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
        background: 'linear-gradient(to top, #050e07 55%, transparent)',
        zIndex: 20,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <button
          onClick={() => onSelect(selected)}
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
      `}</style>
    </div>
  )
}
