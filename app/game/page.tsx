'use client'
import dynamic from 'next/dynamic'

const PenaltyGame = dynamic(() => import('../../components/game/PenaltyGame'), {
  ssr: false,
  loading: () => (
    <div style={{ position: 'fixed', inset: 0, background: '#040d06', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'white', fontFamily: 'monospace', letterSpacing: '0.3em', fontSize: '14px' }}>LOADING...</p>
    </div>
  ),
})

export default function GamePage() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 20 }}>
      <PenaltyGame />
    </div>
  )
}
