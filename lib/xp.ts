export type Difficulty = 'easy' | 'medium' | 'hard'

const XP_PER_GOAL: Record<Difficulty, number> = {
  easy:   10,
  medium: 15,
  hard:   25,
}

const PERFECT_BONUS = 50

// Cumulative XP thresholds to reach each level
// Level 1→2: 100, 2→3: 250, 3→4: 500, N→N+1: 500 + (N-3)*300
function thresholdForLevel(level: number): number {
  if (level <= 1) return 0
  if (level === 2) return 100
  if (level === 3) return 250
  if (level === 4) return 500
  return 500 + (level - 4) * 300
}

export function calculateXp(goals: number, difficulty: Difficulty): number {
  const base = goals * XP_PER_GOAL[difficulty]
  const bonus = goals === 5 ? PERFECT_BONUS : 0
  return base + bonus
}

export function calculateLevel(totalXp: number): number {
  let level = 1
  while (thresholdForLevel(level + 1) <= totalXp) level++
  return level
}

export function xpForNextLevel(currentLevel: number): number {
  return thresholdForLevel(currentLevel + 1)
}

export function xpBreakdown(goals: number, difficulty: Difficulty): {
  goalXp: number
  bonusXp: number
  totalXp: number
  multiplier: number
} {
  const multiplier = XP_PER_GOAL[difficulty] / 10
  const goalXp = goals * XP_PER_GOAL[difficulty]
  const bonusXp = goals === 5 ? PERFECT_BONUS : 0
  return { goalXp, bonusXp, totalXp: goalXp + bonusXp, multiplier }
}
