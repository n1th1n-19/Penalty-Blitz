export type Zone = 'left' | 'centre' | 'right'
export type Height = 'top' | 'bottom'

export interface ShotRecord {
  zone: Zone
  height: Height
  round: number
  power: number
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
