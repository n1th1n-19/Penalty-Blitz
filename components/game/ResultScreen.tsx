'use client'
import { useEffect, useState } from 'react'
import { Icon, XpBar, Jersey } from '@/components/ui/PbUi'
import type { NeonKit } from '@/components/ui/PbUi'
import type { ShotRecord } from '@/components/screens/GameScreen'

interface XpResult {
  goalXp: number
  bonusXp: number
  totalXp: number
  multiplier: number
  xpEarned: number
  newTotalXp: number
  newLevel: number
  leveledUp: boolean
}

interface Props {
  streak: number
  shots: number
  shotHistory: ShotRecord[]
  xpResult?: XpResult | null
  kit: NeonKit
  onRestart: () => void
  onMainMenu: () => void
}

const RATINGS = [
  { min: 12, label: 'LEGENDARY', color: 'var(--gold)' },
  { min: 8,  label: 'CLINICAL',  color: 'var(--lime)' },
  { min: 5,  label: 'SHARP',     color: 'var(--cyan)' },
  { min: 2,  label: 'DECENT',    color: '#60a5fa' },
  { min: 0,  label: 'ROUGH',     color: 'var(--danger)' },
]

const COMMENTS: Record<string, string> = {
  LEGENDARY: 'Unstoppable. The keeper had no answer.',
  CLINICAL:  'Clinical shooting. You mixed it up perfectly.',
  SHARP:     'Solid technique. A few more and you\'re elite.',
  DECENT:    'Mixed bag. Aim for the corners next time.',
  ROUGH:     'The keeper read every shot. Change your pattern.',
}

export default function ResultScreen({ streak, shots, shotHistory, xpResult, kit, onRestart, onMainMenu }: Props) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t) }, [])

  const { label: rating, color: ratingColor } = RATINGS.find(r => streak >= r.min) ?? RATINGS[4]
  const comment = COMMENTS[rating]
  const isLegendary = streak >= 12

  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()

  return (
    <div
      className="pb-stadium"
      style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(20px,4vw,40px) 20px max(32px, calc(env(safe-area-inset-bottom) + 24px))',
        gap: 12, overflowY: 'auto',
      }}
    >
      {/* ── Scoreboard card ── */}
      <div className="pb-card a-slide" style={{ width: '100%', maxWidth: 480, overflow: 'hidden', padding: 0 }}>
        {/* Header band */}
        <div style={{
          background: isLegendary
            ? 'linear-gradient(90deg, #4d2600, #7c3d00, #4d2600)'
            : 'linear-gradient(90deg, #071a09, #0c2a10, #071a09)',
          padding: '10px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.4em', color: isLegendary ? 'var(--gold)' : 'var(--lime)' }}>
            STREAK OVER
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', color: 'var(--txt-3)' }}>
            {dateStr}
          </span>
        </div>

        <div style={{ padding: '24px 22px 20px' }}>
          {/* Rating */}
          {visible && (
            <div
              className="a-pop"
              style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(34px,9vw,54px)',
                color: ratingColor, letterSpacing: '0.04em', lineHeight: 1, marginBottom: 8,
                textShadow: `0 0 32px ${ratingColor}55`,
              }}
            >
              {rating}
            </div>
          )}
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--txt-3)', letterSpacing: '0.05em', marginBottom: 22 }}>
            {comment}
          </p>

          {/* Score row */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--bd)', marginBottom: 20 }}>
            <div style={{ flex: 1, padding: '14px 16px', textAlign: 'center', borderRight: '1px solid var(--bd)' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.3em', color: 'var(--txt-3)', marginBottom: 6 }}>STREAK</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: ratingColor, lineHeight: 1 }}>{streak}</p>
            </div>
            <div style={{ flex: 1, padding: '14px 16px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.3em', color: 'var(--txt-3)', marginBottom: 6 }}>SHOTS</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: 'var(--txt-2)', lineHeight: 1 }}>{shots}</p>
            </div>
          </div>

          {/* Shot dots */}
          {shotHistory.length > 0 && (
            <div style={{ display: 'flex', gap: 7, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
              {shotHistory.slice(0, 12).map((s, i) => (
                <div
                  key={i}
                  style={{
                    width: 14, height: 14, borderRadius: '50%',
                    background: s.result === 'goal' ? 'var(--lime)' : 'var(--danger)',
                    boxShadow: s.result === 'goal' ? '0 0 6px rgba(200,255,0,0.7)' : '0 0 6px rgba(255,77,77,0.7)',
                  }}
                />
              ))}
              {shotHistory.length > 12 && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--txt-3)' }}>
                  +{shotHistory.length - 12}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── XP card ── */}
      {xpResult && (
        <div
          className="pb-card a-slide-1"
          style={{
            width: '100%', maxWidth: 480, padding: '18px 22px',
            borderLeft: `3px solid ${isLegendary ? 'var(--gold)' : 'var(--lime)'}`,
          }}
        >
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.35em', color: 'var(--lime)', marginBottom: 14 }}>XP EARNED</p>

          {[
            { label: `${streak} goals × ${xpResult.multiplier}`, value: `+${xpResult.goalXp}` },
            ...(xpResult.bonusXp > 0 ? [{ label: 'Streak milestone bonus', value: `+${xpResult.bonusXp}`, gold: true }] : []),
          ].map(({ label, value, gold }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: gold ? 'var(--gold)' : 'var(--txt-3)' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: gold ? 'var(--gold)' : 'var(--txt-2)' }}>{value} XP</span>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--bd)', paddingTop: 10, marginTop: 4, marginBottom: 14 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--txt-3)' }}>TOTAL</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--lime)', textShadow: '0 0 16px rgba(200,255,0,0.35)' }}>
              +{xpResult.totalXp} XP
            </span>
          </div>

          {xpResult.leveledUp && (
            <div style={{
              marginBottom: 14, padding: '10px 14px',
              background: 'rgba(255,213,74,0.1)', border: '1px solid rgba(255,213,74,0.3)',
              borderRadius: 10, textAlign: 'center',
              fontFamily: 'var(--font-display)', fontSize: 20,
              color: 'var(--gold)', letterSpacing: '0.05em',
              animation: 'pb-pop 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
              LEVEL {xpResult.newLevel} REACHED
            </div>
          )}

          <XpBar xp={xpResult.newTotalXp} />
        </div>
      )}

      {/* ── Actions ── */}
      <div className="a-slide-2" style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={onRestart} className="pb-btn pb-btn-primary" style={{ width: '100%' }}>
          <Icon name="play" size={15} /> Play Again
        </button>
        <button onClick={onMainMenu} className="pb-btn pb-btn-ghost" style={{ width: '100%' }}>
          Main Menu
        </button>
      </div>
    </div>
  )
}
