'use client'
import { useState } from 'react'
import { useSystemStore } from '@/store/systemStore'
import { KITS } from '@/lib/game/kits'
import { PlayerCharacter, Jersey, Icon } from '@/components/ui/PbUi'
import type { NeonKit } from '@/components/ui/PbUi'

export default function KitSelectScreen() {
  const { user, back, updateUser } = useSystemStore()
  const currentKitId = user?.kit ? (typeof user.kit === 'string' ? user.kit : user.kit.id) : 'lime'
  const [sel, setSel] = useState(currentKitId)
  const selKit = KITS.find(k => k.id === sel) ?? KITS[0]

  const confirm = async () => {
    await fetch('/api/avatar-kit', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kitId: sel }),
    })
    updateUser({ kit: selKit as any })
    back()
  }

  return (
    <div className="pb-stadium" style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '16px clamp(16px,4vw,32px)',
        borderBottom: '1px solid var(--bd)', flexShrink: 0,
      }}>
        <button onClick={back} className="pb-btn pb-btn-ghost" style={{ padding: '10px', width: 42, height: 42, borderRadius: 11 }}>
          <Icon name="back" size={18} />
        </button>
        <p className="display" style={{ fontSize: 'clamp(20px,4vw,28px)', color: '#fff', letterSpacing: '0.04em', flex: 1 }}>
          Customize Kit
        </p>
      </div>

      <div className="pb-kit-split" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <style>{`
          @media(min-width:680px){
            .pb-kit-split{flex-direction:row!important;}
            .pb-kit-preview{width:clamp(220px,30%,320px)!important;flex-shrink:0;border-right:1px solid var(--bd);border-bottom:none!important;flex-direction:column!important;}
          }
        `}</style>

        {/* Preview panel */}
        <div
          className="pb-kit-preview a-slide"
          style={{
            display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            gap: 18, padding: 'clamp(18px,3vw,32px)',
            background: 'rgba(0,0,0,0.22)', borderBottom: '1px solid var(--bd)',
          }}
        >
          <PlayerCharacter kit={selKit as NeonKit} size={150} />
          <div style={{ textAlign: 'left' }}>
            <p className="mono-label" style={{ marginBottom: 6 }}>Selected</p>
            <h3 className="display" style={{ fontSize: 'clamp(22px,5vw,30px)', color: '#fff', marginBottom: 10 }}>{selKit.name}</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {[selKit.primary, selKit.secondary, selKit.trim].map((c, i) => (
                <div key={i} style={{ width: 22, height: 22, borderRadius: 6, background: c, border: '1px solid rgba(255,255,255,0.2)' }} />
              ))}
            </div>
          </div>
        </div>

        {/* Grid + footer */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(16px,3vw,24px)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px,1fr))', gap: 12 }}>
              {KITS.map((k, i) => {
                const active = sel === k.id
                const locked = !k.unlocked
                return (
                  <button
                    key={k.id}
                    disabled={locked}
                    onClick={() => setSel(k.id)}
                    className="a-slide"
                    style={{
                      animationDelay: `${i * 0.04}s`,
                      position: 'relative',
                      cursor: locked ? 'not-allowed' : 'pointer',
                      background: active ? 'var(--surface-2)' : 'rgba(255,255,255,0.025)',
                      border: `1px solid ${active ? 'var(--bd-lime)' : 'var(--bd)'}`,
                      borderRadius: 'var(--r-card)',
                      padding: '16px 12px 14px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      opacity: locked ? 0.5 : 1,
                      transition: 'border-color .15s, background .15s',
                      boxShadow: active ? '0 0 22px rgba(200,255,0,0.12)' : 'none',
                    }}
                  >
                    <Jersey kit={k as NeonKit} size={72} glow={false} />
                    <span className="mono-label" style={{ fontSize: 9.5, color: active ? 'var(--lime)' : 'var(--txt-2)' }}>{k.name}</span>
                    {locked && (
                      <div style={{
                        position: 'absolute', inset: 0, borderRadius: 'var(--r-card)',
                        background: 'rgba(3,3,3,0.6)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: 8, padding: 10, textAlign: 'center',
                      }}>
                        <Icon name="lock" size={20} style={{ color: 'var(--txt-3)' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, letterSpacing: '0.12em', color: 'var(--txt-3)', lineHeight: 1.4 }}>{k.req}</span>
                      </div>
                    )}
                    {active && (
                      <div style={{
                        position: 'absolute', top: 8, right: 8, width: 20, height: 20,
                        borderRadius: '50%', background: 'var(--lime)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#020402',
                      }}>
                        <Icon name="check" size={13} stroke={3} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ padding: '14px clamp(16px,3vw,24px)', borderTop: '1px solid var(--bd)', display: 'flex', gap: 10, flexShrink: 0 }}>
            <button onClick={back} className="pb-btn pb-btn-ghost" style={{ flex: 1 }}>Cancel</button>
            <button onClick={confirm} className="pb-btn pb-btn-primary" style={{ flex: 2 }}>
              <Icon name="check" size={15} /> Equip Kit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
