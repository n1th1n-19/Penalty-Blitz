'use client'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { Kit } from '@/lib/game/types'

const JerseySelect = dynamic(() => import('@/components/game/JerseySelect'), { ssr: false })

export default function KitSelectClient({ initialKitId }: { initialKitId: string }) {
  const router = useRouter()

  const handleSelect = async (kit: Kit) => {
    await fetch('/api/avatar-kit', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kitId: kit.id }),
    })
    router.push('/main')
  }

  return (
    <JerseySelect
      initialKitId={initialKitId}
      submitLabel="SAVE KIT"
      onSelect={handleSelect}
      onBack={() => router.push('/main')}
    />
  )
}
