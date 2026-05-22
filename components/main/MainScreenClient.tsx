'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CharacterCanvas from './CharacterCanvas'
import KitSelectModal from './KitSelectModal'
import type { Kit } from '@/lib/game/types'

interface Props {
  username: string
  level: number
  xp: number
  initialKit: Kit
}

export default function MainScreenClient({ username, level, xp, initialKit }: Props) {
  const router = useRouter()
  const [currentKit, setCurrentKit] = useState<Kit>(initialKit)
  const [kitModalOpen, setKitModalOpen] = useState(false)

  return (
    <div className="main-hub-root">
      <div className="main-hub-user">
        <span className="main-hub-username">{username}</span>
        <span className="main-hub-level">LV.{level}</span>
        <span className="main-hub-xp">{xp} XP</span>
      </div>

      <div className="main-hub-character">
        <CharacterCanvas kit={currentKit} size={160} />
        <p className="main-hub-kit-name">{currentKit.name}</p>
      </div>

      <div className="main-hub-actions">
        <button onClick={() => router.push('/game')} className="nav-btn nav-btn-play">
          PLAY NOW
        </button>
        <button onClick={() => router.push('/leaderboard')} className="nav-btn">
          LEADERBOARD
        </button>
        <button onClick={() => setKitModalOpen(true)} className="nav-btn">
          CUSTOMIZE CHARACTER
        </button>
        <button onClick={() => router.push(`/profile/${username}`)} className="nav-btn">
          MY PROFILE
        </button>
      </div>

      <KitSelectModal
        open={kitModalOpen}
        currentKit={currentKit}
        onSave={setCurrentKit}
        onClose={() => setKitModalOpen(false)}
      />
    </div>
  )
}
