export type Zone = 'left' | 'centre' | 'right'
export type Height = 'top' | 'bottom'

export interface ShotRecord {
  x: number     // normalized 0–1 within goal width (left → right)
  y: number     // normalized 0–1 within goal height (top → bottom)
  power: number
}

export function coordToZone(x: number): Zone {
  if (x < 1 / 3) return 'left'
  if (x < 2 / 3) return 'centre'
  return 'right'
}

export function coordToHeight(y: number): Height {
  return y < 0.5 ? 'top' : 'bottom'
}

export interface Kit {
  id: string
  name: string
  primary: string
  secondary: string
  trim: string
  pattern: 'solid' | 'stripes' | 'hoops' | 'half' | 'diagonal' | 'sash'
  unlocked: boolean
  req?: string
  // legacy fields kept for compatibility
  shortName?: string
  type?: 'club' | 'country'
  badge?: string
  accent?: string
  shorts?: string
  socks?: string
  stripeColor?: string
  collarColor?: string
  numberColor?: string
  playerName?: string
  playerNumber?: number
}

export interface GameState {
  round: number
  maxRounds: number
  playerScore: number
  cpuScore: number
  selectedKit: Kit
  shotHistory: ShotRecord[]
  phase: 'jersey' | 'playing' | 'result'
  suddenDeath: boolean
}
