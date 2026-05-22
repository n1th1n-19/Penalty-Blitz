export type DifficultyKey = 'easy' | 'medium' | 'hard'

export interface DifficultyConfig {
  key:          DifficultyKey
  label:        string
  keeperDelay:  number   // ms after kick before keeper commits
  aiWeight:     number   // 0-1: how much learned model matters vs random
  powerSpeed:   number   // multiplier on power bar oscillation speed
  zoneBonus:    number   // multiplier on corner zone size (>1 = larger = easier)
  xpMult:       number   // XP multiplier
  description:  string
}

export const DIFFICULTY: Record<DifficultyKey, DifficultyConfig> = {
  easy: {
    key: 'easy', label: 'Easy',
    keeperDelay: 600, aiWeight: 0.20, powerSpeed: 0.6, zoneBonus: 1.20, xpMult: 1.0,
    description: 'Keeper reacts slowly. Good for learning.',
  },
  medium: {
    key: 'medium', label: 'Medium',
    keeperDelay: 350, aiWeight: 0.60, powerSpeed: 1.0, zoneBonus: 1.00, xpMult: 1.5,
    description: 'Keeper learns your patterns. Balanced challenge.',
  },
  hard: {
    key: 'hard', label: 'Hard',
    keeperDelay: 120, aiWeight: 0.90, powerSpeed: 1.6, zoneBonus: 0.85, xpMult: 2.5,
    description: 'Keeper predicts before you kick. Mix up every shot.',
  },
}
