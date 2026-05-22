'use client'
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

  const rating =
    ratio === 1   ? 'PERFECT!' :
    ratio >= 0.8  ? 'EXCELLENT' :
    ratio >= 0.6  ? 'GOOD' :
    ratio >= 0.4  ? 'DECENT' :
                    'ROUGH DAY'

  const ratingColor =
    ratio === 1   ? '#FFD700' :
    ratio >= 0.8  ? '#5dca8a' :
    ratio >= 0.6  ? '#88ccff' :
    ratio >= 0.4  ? '#FFDD55' :
                    '#e24b4a'

  const comment =
    ratio === 1   ? 'The keeper had no chance. Flawless.' :
    ratio >= 0.8  ? 'Excellent shooting. You kept the keeper guessing.' :
    ratio >= 0.6  ? 'Solid technique. A couple slipped away.' :
    ratio >= 0.4  ? 'Mixed bag. Aim for the corners next time.' :
                    'The keeper read your shots. Mix it up next time.'

  return (
    <div style={{
      width: '100%',
      height: '100dvh',
      background: '#0a0f0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
      gap: 16,
    }}>
      <p style={{ fontSize: 13, color: '#4a6a4a', letterSpacing: 4 }}>FULL TIME</p>

      <h1 style={{
        fontSize: 'clamp(22px, 7vw, 36px)',
        fontWeight: 700,
        color: ratingColor,
        letterSpacing: 3,
      }}>
        {rating}
      </h1>

      <div style={{
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        background: '#0d150d',
        border: '1px solid #2a3a2a',
        borderRadius: 12,
        padding: 'clamp(12px, 3vw, 20px) clamp(20px, 5vw, 40px)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#4a6a4a', marginBottom: 4 }}>{playerKit.shortName}</p>
          <p style={{ fontSize: 'clamp(32px, 10vw, 52px)', fontWeight: 700, color: '#c8e8c8' }}>{playerScore}</p>
        </div>
        <p style={{ fontSize: 20, color: '#4a6a4a' }}>out of</p>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#4a6a4a', marginBottom: 4 }}>SHOTS</p>
          <p style={{ fontSize: 'clamp(32px, 10vw, 52px)', fontWeight: 700, color: '#c8e8c8' }}>{totalRounds}</p>
        </div>
      </div>

      <p style={{ fontSize: 13, color: '#4a6a4a', maxWidth: 300, textAlign: 'center' }}>
        {comment}
      </p>

      {xpResult && (
        <div className="mt-6 border-t border-white border-opacity-20 pt-5 space-y-2 text-center">
          <p className="text-green-200 text-sm font-bold tracking-widest">XP EARNED</p>
          <p className="text-white text-sm">
            {playerScore} goals x {xpResult.multiplier} = +{xpResult.goalXp} XP
          </p>
          {xpResult.bonusXp > 0 && (
            <p className="text-yellow-300 text-sm font-bold">PERFECT GAME BONUS +{xpResult.bonusXp} XP</p>
          )}
          <p className="text-white font-black text-xl mt-1">+{xpResult.totalXp} XP TOTAL</p>
          {xpResult.leveledUp && (
            <p className="text-yellow-300 font-black text-2xl animate-pulse">
              LEVEL UP - LEVEL {xpResult.newLevel}
            </p>
          )}
          <div className="mt-3">
            <XpBar xp={xpResult.newTotalXp} level={xpResult.newLevel} />
          </div>
        </div>
      )}

      <button
        onClick={onRestart}
        style={{
          background: '#1a6a1a',
          border: '1px solid #3a8a3a',
          borderRadius: 10,
          padding: '12px 48px',
          color: '#c8f8c8',
          fontSize: 15,
          fontFamily: 'monospace',
          fontWeight: 700,
          letterSpacing: 2,
          cursor: 'pointer',
          marginTop: 8,
        }}
      >
        PLAY AGAIN
      </button>
    </div>
  )
}
