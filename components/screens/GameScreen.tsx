'use client'
import { useSystemStore } from '@/store/systemStore'
import PenaltyGame from '@/components/game/PenaltyGame'

export default function GameScreen() {
  const { user } = useSystemStore()

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 20 }}>
      <PenaltyGame initialKit={user?.kit} />
    </div>
  )
}
