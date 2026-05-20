'use client'
import { Kit } from '../../lib/game/types'

interface Props {
  playerScore: number
  cpuScore: number
  playerKit: Kit
  onRestart: () => void
}

export default function ResultScreen({ playerScore, cpuScore, playerKit, onRestart }: Props) {
  const won = playerScore > cpuScore
  const draw = playerScore === cpuScore

  return (
    <div style={{
      width: '100%',
      height: '100%',
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
        fontSize: 36,
        fontWeight: 700,
        color: won ? '#5dca8a' : draw ? '#FFDD55' : '#e24b4a',
        letterSpacing: 3,
      }}>
        {won ? 'YOU WIN!' : draw ? 'DRAW' : 'DEFEAT'}
      </h1>

      <div style={{
        display: 'flex',
        gap: 24,
        alignItems: 'center',
        background: '#0d150d',
        border: '1px solid #2a3a2a',
        borderRadius: 12,
        padding: '20px 40px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#4a6a4a', marginBottom: 4 }}>{playerKit.shortName}</p>
          <p style={{ fontSize: 52, fontWeight: 700, color: '#c8e8c8' }}>{playerScore}</p>
        </div>
        <p style={{ fontSize: 28, color: '#4a6a4a' }}>–</p>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#4a6a4a', marginBottom: 4 }}>CPU</p>
          <p style={{ fontSize: 52, fontWeight: 700, color: '#c8e8c8' }}>{cpuScore}</p>
        </div>
      </div>

      <p style={{ fontSize: 13, color: '#4a6a4a', maxWidth: 300, textAlign: 'center' }}>
        {won
          ? 'Excellent shooting. You kept the keeper guessing.'
          : draw
          ? 'So close. Penalties decided.'
          : 'The keeper read your shots. Mix it up next time.'}
      </p>

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
