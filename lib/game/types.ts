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
  shortName: string
  type: 'club' | 'country'
  badge: string
  primary: string
  secondary: string
  accent: string
  shorts: string
  socks: string
  pattern: 'solid' | 'stripes' | 'hoops' | 'half' | 'diagonal' | 'sash'
  stripeColor?: string
  collarColor?: string
  numberColor: string
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
