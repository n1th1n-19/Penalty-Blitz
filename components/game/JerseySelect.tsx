'use client'
import { useEffect, useRef, useState } from 'react'
import { Kit } from '../../lib/game/types'
import { CLUB_KITS, COUNTRY_KITS } from '../../lib/game/kits'
import { drawMiniCharacter } from '../../lib/game/CharacterRenderer'

interface Props {
  onSelect: (kit: Kit) => void
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
        background: selected ? '#1a2a1a' : '#0d150d',
        border: selected ? '2px solid #5dca8a' : '1px solid #2a3a2a',
        borderRadius: 10,
        padding: '8px 6px 4px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        transition: 'all 0.15s',
        minWidth: 80,
      }}
    >
      <canvas ref={canvasRef} width={80} height={110} style={{ display: 'block' }} />
      <span style={{
        fontSize: 10,
        fontFamily: 'monospace',
        color: selected ? '#5dca8a' : '#8aaa8a',
        textAlign: 'center',
        lineHeight: 1.2,
        fontWeight: selected ? 700 : 400,
      }}>
        {kit.shortName}
      </span>
    </button>
  )
}

export default function JerseySelect({ onSelect }: Props) {
  const [tab, setTab] = useState<'club' | 'country'>('club')
  const [selected, setSelected] = useState<Kit>(CLUB_KITS[0])

  const kits = tab === 'club' ? CLUB_KITS : COUNTRY_KITS

  return (
    <div style={{
      width: '100%',
      height: '100dvh',
      background: '#0a0f0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 'clamp(12px, 3vh, 24px)',
      fontFamily: 'monospace',
      color: '#c8e8c8',
      overflowY: 'auto',
    }}>
      <h1 style={{ fontSize: 'clamp(16px, 5vw, 24px)', fontWeight: 700, letterSpacing: 4, marginBottom: 6, color: '#7dba7d' }}>
        PENALTY SHOOTOUT
      </h1>
      <p style={{ fontSize: 13, color: '#4a6a4a', marginBottom: 20 }}>Choose your kit</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 18, border: '1px solid #2a3a2a', borderRadius: 8, overflow: 'hidden' }}>
        {(['club', 'country'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: tab === t ? '#1a4a1a' : '#0d150d',
              border: 'none',
              color: tab === t ? '#7dba7d' : '#4a6a4a',
              padding: '8px 28px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: 13,
              fontWeight: tab === t ? 700 : 400,
              letterSpacing: 1,
            }}
          >
            {t === 'club' ? 'CLUBS' : 'COUNTRIES'}
          </button>
        ))}
      </div>

      {/* Kit grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
        gap: 10,
        width: '100%',
        maxWidth: 'min(560px, 100%)',
        padding: '0 16px',
        marginBottom: 24,
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

      {/* Selected preview */}
      <div style={{
        background: '#0d150d',
        border: '1px solid #2a3a2a',
        borderRadius: 12,
        padding: '12px 24px',
        textAlign: 'center',
        marginBottom: 24,
        minWidth: 'min(200px, 90%)',
      }}>
        <p style={{ fontSize: 11, color: '#4a6a4a', marginBottom: 4 }}>SELECTED</p>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#c8e8c8' }}>{selected.name}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8 }}>
          {[selected.primary, selected.secondary, selected.shorts, selected.socks].map((c, i) => (
            <div key={i} style={{ width: 16, height: 16, borderRadius: 4, background: c, border: '1px solid #2a3a2a' }} />
          ))}
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={() => onSelect(selected)}
        style={{
          background: '#1a6a1a',
          border: '1px solid #3a8a3a',
          borderRadius: 10,
          padding: '14px 56px',
          color: '#c8f8c8',
          fontSize: 16,
          fontFamily: 'monospace',
          fontWeight: 700,
          letterSpacing: 3,
          cursor: 'pointer',
          marginBottom: 32,
        }}
      >
        KICK OFF
      </button>
    </div>
  )
}
