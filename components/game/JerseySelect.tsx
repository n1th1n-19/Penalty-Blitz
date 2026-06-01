'use client'
import { useEffect, useRef, useState } from 'react'
import { Kit } from '../../lib/game/types'
import { CLUB_KITS, COUNTRY_KITS } from '../../lib/game/kits'
import { drawMiniCharacter } from '../../lib/game/CharacterRenderer'

interface Props {
  onSelect: (kit: Kit) => void
  initialKitId?: string
  submitLabel?: string
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
        background: selected ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.03)',
        border: selected ? '2px solid rgba(74,222,128,0.7)' : '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: '8px 6px 4px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        transition: 'all 0.15s ease',
        transform: selected ? 'scale(1.05)' : 'scale(1)',
        boxShadow: selected ? '0 0 14px rgba(74,222,128,0.22)' : 'none',
        outline: 'none',
        minWidth: 72,
      }}
    >
      <canvas ref={canvasRef} width={80} height={110} style={{ display: 'block' }} />
      <span style={{
        fontSize: 9,
        fontFamily: 'var(--font-mono)',
        color: selected ? '#4ade80' : 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        lineHeight: 1.2,
        fontWeight: selected ? 700 : 400,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}>
        {kit.shortName}
      </span>
    </button>
  )
}

export default function JerseySelect({ onSelect, initialKitId, submitLabel = 'KICK OFF' }: Props) {
  const resolvedInitial = initialKitId
    ? ([...CLUB_KITS, ...COUNTRY_KITS].find(k => k.id === initialKitId) ?? CLUB_KITS[0])
    : CLUB_KITS[0]
  const [tab, setTab] = useState<'club' | 'country'>(resolvedInitial.type === 'country' ? 'country' : 'club')
  const [selected, setSelected] = useState<Kit>(resolvedInitial)

  const kits = tab === 'club' ? CLUB_KITS : COUNTRY_KITS

  return (
    <div style={{
      width: '100%',
      minHeight: '100dvh',
      background: '#040d06',
      backgroundImage: 'radial-gradient(ellipse 110% 55% at 50% -8%, #0d3320 0%, transparent 68%), linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
      backgroundSize: '100% 100%, 72px 72px, 72px 72px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 'clamp(16px, 3vh, 28px)',
      paddingBottom: 'max(100px, calc(env(safe-area-inset-bottom) + 100px))',
      overflowY: 'auto',
    }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(22px, 6vw, 36px)',
          color: '#fff',
          letterSpacing: '0.05em',
        }}>
          PENALTY BLITZ
        </h1>
        <p className="label-mono" style={{ marginTop: 6 }}>Choose your kit</p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 0,
        marginBottom: 18,
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10,
        overflow: 'hidden',
        background: 'rgba(0,0,0,0.25)',
      }}>
        {(['club', 'country'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: tab === t ? 'var(--green-btn)' : 'transparent',
              border: 'none',
              color: tab === t ? '#fff' : 'rgba(255,255,255,0.4)',
              padding: '9px 28px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              transition: 'background 0.15s, color 0.15s',
              boxShadow: tab === t ? '0 0 12px rgba(74,222,128,0.15)' : 'none',
            }}
          >
            {t === 'club' ? 'CLUBS' : 'COUNTRIES'}
          </button>
        ))}
      </div>

      {/* Kit grid */}
      <div
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3"
        style={{
          width: '100%',
          maxWidth: 'min(560px, 100%)',
          padding: '0 16px',
          marginBottom: 20,
        }}
      >
        {kits.map(kit => (
          <KitCard
            key={kit.id}
            kit={kit}
            selected={selected.id === kit.id}
            onSelect={() => setSelected(kit)}
          />
        ))}
      </div>

      {/* Selected preview */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: '12px 24px',
        textAlign: 'center',
        marginBottom: 20,
        minWidth: 'min(240px, 90%)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}>
        <p className="label-mono" style={{ marginBottom: 6 }}>SELECTED</p>
        <p style={{
          fontSize: 15,
          fontWeight: 700,
          color: '#fff',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.05em',
        }}>
          {selected.name}
        </p>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10 }}>
          {[selected.primary, selected.secondary, selected.shorts, selected.socks].map((c, i) => (
            <div key={i} style={{
              width: 18,
              height: 18,
              borderRadius: 5,
              background: c,
              border: '1px solid rgba(255,255,255,0.15)',
            }} />
          ))}
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 'max(16px, env(safe-area-inset-bottom)) 20px 20px',
        background: 'linear-gradient(to top, #040d06 60%, transparent)',
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 10,
      }}>
        <button
          onClick={() => onSelect(selected)}
          className="btn-primary"
          style={{ maxWidth: 360, pointerEvents: 'all' }}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  )
}
