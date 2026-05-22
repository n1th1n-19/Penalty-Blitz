'use client'
import { useState } from 'react'
import { audio } from '@/lib/game/audio'
import { getControlScheme, setControlScheme, ControlScheme } from '@/lib/game/mobile-controls'
import { DifficultyKey } from '@/lib/game/difficulty'

interface Props {
  open:               boolean
  onClose:            () => void
  defaultDifficulty:  DifficultyKey
  onDifficultyChange: (k: DifficultyKey) => void
  onReplayTutorial:   () => void
}

export default function SettingsModal({
  open, onClose, defaultDifficulty, onDifficultyChange, onReplayTutorial,
}: Props) {
  const [muted, setMuted]   = useState(() => audio.isMuted())
  const [scheme, setScheme] = useState<ControlScheme>(() => getControlScheme())
  const [diff, setDiff]     = useState<DifficultyKey>(defaultDifficulty)

  if (!open) return null

  const handleMuteToggle = () => {
    if (muted) audio.unmute(); else audio.mute()
    setMuted(!muted)
  }

  const handleScheme = (s: ControlScheme) => {
    setControlScheme(s); setScheme(s)
  }

  const handleDiff = (k: DifficultyKey) => {
    setDiff(k); onDifficultyChange(k)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-xl text-gray-900 tracking-wide">SETTINGS</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 font-bold text-lg leading-none">X</button>
        </div>

        <section>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Audio</h3>
          <button
            onClick={handleMuteToggle}
            className={`w-full py-2 rounded-lg font-bold text-sm ${muted ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
          >
            {muted ? 'SOUND OFF' : 'SOUND ON'}
          </button>
        </section>

        <section>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Controls</h3>
          {(['drag', 'joystick', 'tap'] as ControlScheme[]).map(s => (
            <button
              key={s}
              onClick={() => handleScheme(s)}
              className={`w-full py-2 rounded-lg font-bold text-sm mb-1 ${scheme === s ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {s === 'drag' ? 'DRAG TO AIM' : s === 'joystick' ? 'VIRTUAL JOYSTICK' : 'TAP TO AIM'}
            </button>
          ))}
        </section>

        <section>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Default Difficulty</h3>
          {(['easy', 'medium', 'hard'] as DifficultyKey[]).map(k => (
            <button
              key={k}
              onClick={() => handleDiff(k)}
              className={`w-full py-2 rounded-lg font-bold text-sm mb-1 ${diff === k ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {k.toUpperCase()}
            </button>
          ))}
        </section>

        <section>
          <button
            onClick={onReplayTutorial}
            className="w-full py-2 bg-blue-50 text-blue-700 rounded-lg font-bold text-sm"
          >
            HOW TO PLAY
          </button>
        </section>
      </div>
    </div>
  )
}
