import { DifficultyKey, DIFFICULTY } from '@/lib/game/difficulty'

interface Props {
  onSelect: (key: DifficultyKey) => void
}

export default function DifficultySelect({ onSelect }: Props) {
  return (
    <div className="min-h-screen bg-green-900 flex flex-col items-center justify-center gap-6 p-6">
      <h2 className="text-white font-black text-3xl tracking-widest">SELECT DIFFICULTY</h2>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        {(['easy', 'medium', 'hard'] as DifficultyKey[]).map(key => {
          const d = DIFFICULTY[key]
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className="bg-white bg-opacity-10 hover:bg-opacity-20 border border-white border-opacity-30 rounded-2xl p-5 text-left transition-all"
            >
              <div className="text-white font-black text-xl tracking-wider">{d.label.toUpperCase()}</div>
              <div className="text-green-200 text-sm mt-1">{d.description}</div>
              <div className="text-yellow-300 text-xs mt-2 font-bold">{d.xpMult}x XP</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
