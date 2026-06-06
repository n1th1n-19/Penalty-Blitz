'use client'
import dynamic from 'next/dynamic'
import { useSystemStore } from '@/store/systemStore'
import type { Kit } from '@/lib/game/types'

const JerseySelect = dynamic(() => import('@/components/game/JerseySelect'), { ssr: false })

export default function KitSelectScreen() {
  const { user, back, updateUser } = useSystemStore()

  const handleSelect = async (kit: Kit) => {
    await fetch('/api/avatar-kit', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kitId: kit.id,
        playerName: kit.playerName,
        playerNumber: kit.playerNumber,
      }),
    })
    updateUser({ kit })
    back()
  }

  return (
    <JerseySelect
      initialKitId={user?.kit.id}
      initialPlayerName={user?.kit.playerName}
      initialPlayerNumber={user?.kit.playerNumber}
      submitLabel="SAVE KIT"
      onSelect={handleSelect}
      onBack={back}
    />
  )
}
