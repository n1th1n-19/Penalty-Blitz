'use client'
import { useEffect, useState } from 'react'
import { Kit } from '../../lib/game/types'
import XpBar from '@/components/profile/XpBar'

interface XpResultData {
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
  playerScore: number
  cpuScore: number
  playerKit: Kit
  xpResult?: XpResultData | null
  onRestart: () => void
}

export default function ResultScreen({ playerScore, cpuScore: totalRounds, playerKit, xpResult, onRestart }: Props) {
  const ratio = playerScore / totalRounds
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  const rating =
    ratio === 1   ? 'PERFECT!' :
    ratio >= 0.8  ? 'EXCELLENT' :
    ratio >= 0.6  ? 'GOOD' :
    ratio >= 0.4  ? 'DECENT' :
                    'ROUGH DAY'

  const ratingColor =
    ratio === 1   ? '#fbbf24' :
    ratio >= 0.8  ? '#4ade80' :
    ratio >= 0.6  ? '#60a5fa' :
    ratio >= 0.4  ? '#fde68a' :
                    '#f87171'

  const ratingGlow =
    ratio === 1   ? 'rgba(251,191,36,0.25)' :
    ratio >= 0.8  ? 'rgba(74,222,128,0.2)' :
    ratio >= 0.6  ? 'rgba(96,165,250,0.2)' :
    ratio >= 0.4  ? 'rgba(253,230,138,0.2)' :
                    'rgba(248,113,113,0.2)'

  const comment =
    ratio === 1   ? 'The keeper had no chance. Flawless.' :
    ratio >= 0.8  ? 'Excellent shooting. You kept the keeper guessing.' :
    ratio >= 0.6  ? 'Solid technique. A couple slipped away.' :
    ratio >= 0.4  ? 'Mixed bag. Aim for the corners next time.' :
                    'The keeper read your shots. Mix it up next time.'

  const scoreGoals = Array.from({ length: totalRounds }, (_, i) => i < playerScore)

  return (
    <div style={{
      width: '100%',
      minHeight: '100dvh',
      background: '#040d06',
      backgroundImage: 'radial-gradient(ellipse 110% 55% at 50% -8%, #0d3320 0%, transparent 68%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-mono)',
      gap: 20,
      padding: '24px 20px max(32px, env(safe-area-inset-bottom))',
    }}>

      {/* FULL TIME label */}
      <p className="label-mono" style={{ letterSpacing: '0.4em' }}>FULL TIME</p>

      {/* Rating — pops in */}
      {visible && (
        <h1
          className="pop-in"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 10vw, 64px)',
            color: ratingColor,
            letterSpacing: '0.05em',
            textShadow: `0 0 32px ${ratingGlow}`,
            textAlign: 'center',
          }}
        >
          {rating}
        </h1>
      )}

      {/* Shot dots */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {scoreGoals.map((scored, i) => (
          <div
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: scored ? '#4ade80' : 'rgba(255,255,255,0.12)',
              border: scored ? '1px solid rgba(74,222,128,0.5)' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: scored ? '0 0 8px rgba(74,222,128,0.4)' : 'none',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>

      {/* Score card */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 'clamp(16px,4vw,24px) clamp(28px,6vw,52px)',
        display: 'flex',
        gap: 24,
        alignItems: 'center',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p className="label-mono" style={{ marginBottom: 6 }}>{playerKit.shortName}</p>
          <p style={{
            fontSize: 'clamp(40px,12vw,64px)',
            fontFamily: 'var(--font-display)',
            color: ratingColor,
            lineHeight: 1,
            textShadow: `0 0 20px ${ratingGlow}`,
          }}>
            {playerScore}
          </p>
        </div>

        <div style={{
          width: 1,
          height: 60,
          background: 'rgba(255,255,255,0.1)',
          flexShrink: 0,
        }} />

        <div style={{ textAlign: 'center' }}>
          <p className="label-mono" style={{ marginBottom: 6 }}>SHOTS</p>
          <p style={{
            fontSize: 'clamp(40px,12vw,64px)',
            fontFamily: 'var(--font-display)',
            color: 'rgba(255,255,255,0.35)',
            lineHeight: 1,
          }}>
            {totalRounds}
          </p>
        </div>
      </div>

      {/* Comment */}
      <p style={{
        fontSize: 12,
        color: 'var(--text-muted)',
        maxWidth: 300,
        textAlign: 'center',
        letterSpacing: '0.05em',
        lineHeight: 1.6,
      }}>
        {comment}
      </p>

      {/* XP panel */}
      {xpResult && (
        <div style={{
          width: '100%',
          maxWidth: 380,
          background: ratio === 1
            ? 'rgba(251,191,36,0.08)'
            : 'rgba(74,222,128,0.06)',
          border: ratio === 1
            ? '1px solid rgba(251,191,36,0.3)'
            : '1px solid rgba(74,222,128,0.2)',
          borderRadius: 14,
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}>
          <p className="label-mono" style={{ color: '#4ade80', textAlign: 'center' }}>XP EARNED</p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              {playerScore} goals × {xpResult.multiplier}
            </span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 13 }}>
              +{xpResult.goalXp} XP
            </span>
          </div>

          {xpResult.bonusXp > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(251,191,36,0.1)',
              border: '1px solid rgba(251,191,36,0.25)',
              borderRadius: 8,
              padding: '6px 10px',
            }}>
              <span style={{ color: '#fbbf24', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>
                ⭐ PERFECT BONUS
              </span>
              <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: 13 }}>
                +{xpResult.bonusXp} XP
              </span>
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: 8,
            marginTop: 2,
          }}>
            <span className="label-mono">TOTAL</span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              color: '#4ade80',
              letterSpacing: '0.03em',
              textShadow: '0 0 16px rgba(74,222,128,0.3)',
            }}>
              +{xpResult.totalXp} XP
            </span>
          </div>

          {xpResult.leveledUp && (
            <div
              className="level-up-anim"
              style={{
                textAlign: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: 24,
                color: '#fbbf24',
                letterSpacing: '0.05em',
                textShadow: '0 0 24px rgba(251,191,36,0.4)',
                marginTop: 4,
              }}
            >
              ⭐ LEVEL UP — LV.{xpResult.newLevel}
            </div>
          )}

          <div style={{ marginTop: 4 }}>
            <XpBar xp={xpResult.newTotalXp} level={xpResult.newLevel} />
          </div>
        </div>
      )}

      {/* Play again */}
      <button
        onClick={onRestart}
        className="btn-primary"
        style={{ maxWidth: 360 }}
      >
        PLAY AGAIN
      </button>
    </div>
  )
}
