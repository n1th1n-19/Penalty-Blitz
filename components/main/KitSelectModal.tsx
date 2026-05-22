'use client'
import dynamic from 'next/dynamic'
import type { Kit } from '@/lib/game/types'

const JerseySelect = dynamic(() => import('@/components/game/JerseySelect'), { ssr: false })

interface Props {
  open: boolean
  currentKit: Kit
  onSave: (kit: Kit) => void
  onClose: () => void
}

export default function KitSelectModal({ open, currentKit, onSave, onClose }: Props) {
  if (!open) return null

  const handleSelect = async (kit: Kit) => {
    await fetch('/api/avatar-kit', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kitId: kit.id }),
    })
    onSave(kit)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center overflow-y-auto">
      <div className="relative w-full max-w-3xl" style={{ background: '#0a0f0a', borderRadius: 16 }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 font-mono text-sm"
          style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '4px 12px', borderRadius: 6, cursor: 'pointer' }}
        >
          CLOSE
        </button>
        <JerseySelect
          initialKitId={currentKit.id}
          submitLabel="SAVE KIT"
          onSelect={handleSelect}
        />
      </div>
    </div>
  )
}
