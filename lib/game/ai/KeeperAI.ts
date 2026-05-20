import { Zone, Height, ShotRecord } from '../types'

type ShotType = `${Zone}-${Height}`
const ZONES: Zone[] = ['left', 'centre', 'right']
const HEIGHTS: Height[] = ['top', 'bottom']
const SHOT_TYPES: ShotType[] = ZONES.flatMap(z => HEIGHTS.map(h => `${z}-${h}` as ShotType))

export class KeeperAI {
  private history: ShotRecord[] = []
  private readonly DECAY = 0.85

  recordShot(zone: Zone, height: Height, round: number, power: number): void {
    this.history.push({ zone, height, round, power })
  }

  private getJointWeights(): Record<ShotType, number> {
    const counts = Object.fromEntries(SHOT_TYPES.map(t => [t, 1])) as Record<ShotType, number>
    const n = this.history.length
    for (let i = 0; i < n; i++) {
      const { zone, height } = this.history[i]
      counts[`${zone}-${height}`] += Math.pow(this.DECAY, n - 1 - i)
    }
    const total = SHOT_TYPES.reduce((s, t) => s + counts[t], 0)
    return Object.fromEntries(SHOT_TYPES.map(t => [t, (counts[t] / total) * 100])) as Record<ShotType, number>
  }

  private getMarkovWeights(): Record<ShotType, number> | null {
    const n = this.history.length
    if (n < 2) return null
    const lastType: ShotType = `${this.history[n - 1].zone}-${this.history[n - 1].height}`

    let realTransitions = 0
    const counts = Object.fromEntries(SHOT_TYPES.map(t => [t, 0.5])) as Record<ShotType, number>
    for (let i = 0; i < n - 1; i++) {
      const from: ShotType = `${this.history[i].zone}-${this.history[i].height}`
      if (from === lastType) {
        const to: ShotType = `${this.history[i + 1].zone}-${this.history[i + 1].height}`
        counts[to] += Math.pow(this.DECAY, n - 2 - i)
        realTransitions++
      }
    }
    if (realTransitions === 0) return null

    const total = SHOT_TYPES.reduce((s, t) => s + counts[t], 0)
    return Object.fromEntries(SHOT_TYPES.map(t => [t, (counts[t] / total) * 100])) as Record<ShotType, number>
  }

  predictShot(): { zone: Zone; height: Height } {
    const freq = this.getJointWeights()
    const markov = this.getMarkovWeights()
    const blend = markov ? Math.min(0.45, this.history.length * 0.1) : 0

    const total = SHOT_TYPES.reduce((s, t) => s + freq[t], 0)
    const weights = Object.fromEntries(
      SHOT_TYPES.map(t => [t, (1 - blend) * freq[t] + blend * (markov?.[t] ?? freq[t])])
    ) as Record<ShotType, number>

    const roll = Math.random() * total
    let cumulative = 0
    for (const t of SHOT_TYPES) {
      cumulative += weights[t]
      if (roll < cumulative) {
        const [zone, height] = t.split('-') as [Zone, Height]
        return { zone, height }
      }
    }
    const best = SHOT_TYPES.reduce((a, b) => weights[a] > weights[b] ? a : b)
    const [zone, height] = best.split('-') as [Zone, Height]
    return { zone, height }
  }

  getWeights(): Record<Zone, number> {
    const j = this.getJointWeights()
    return {
      left:   j['left-top']   + j['left-bottom'],
      centre: j['centre-top'] + j['centre-bottom'],
      right:  j['right-top']  + j['right-bottom'],
    }
  }

  reset(): void {
    this.history = []
  }

  getShotCount(): number {
    return this.history.length
  }
}
