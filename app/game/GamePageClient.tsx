'use client'
import dynamic from 'next/dynamic'
import type { Kit } from '@/lib/game/types'

const PenaltyGame = dynamic(() => import('../../components/game/PenaltyGame'), {
  ssr: false,
  loading: () => (
    <div style={{ position: 'fixed', inset: 0, background: '#040d06', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'white', fontFamily: 'monospace', letterSpacing: '0.3em', fontSize: '14px' }}>LOADING...</p>
    </div>
  ),
})

interface Props {
  initialKit?: Kit
}

export default function GamePageClient({ initialKit }: Props) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 20 }}>
      <PenaltyGame initialKit={initialKit} />
    </div>
  )
}
