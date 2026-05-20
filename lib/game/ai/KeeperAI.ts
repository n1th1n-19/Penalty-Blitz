import { Zone, Height, ShotRecord } from '../types'

export class KeeperAI {
  private history: ShotRecord[] = []
  private readonly RECENCY_WEIGHT = 2

  recordShot(zone: Zone, height: Height, round: number): void {
    this.history.push({ zone, height, round })
  }

  getWeights(): Record<Zone, number> {
    if (this.history.length === 0) {
      return { left: 33.3, centre: 33.3, right: 33.3 }
    }

    const counts: Record<Zone, number> = { left: 0, centre: 0, right: 0 }
    const n = this.history.length

    this.history.forEach((shot, idx) => {
      // Recency bias: last shot counts double
      const weight = idx === n - 1 ? this.RECENCY_WEIGHT : 1
      counts[shot.zone] += weight
    })

    const total = counts.left + counts.centre + counts.right
    return {
      left: (counts.left / total) * 100,
      centre: (counts.centre / total) * 100,
      right: (counts.right / total) * 100,
    }
  }

  predictDive(): Zone {
    const weights = this.getWeights()

    // In sudden death (5+ shots), double the weight sensitivity
    const isSuddenDeath = this.history.length >= 5
    if (isSuddenDeath) {
      // Amplify the dominant tendency
      const max = Math.max(weights.left, weights.centre, weights.right)
      if (weights.left === max) weights.left = Math.min(90, weights.left * 1.5)
      else if (weights.right === max) weights.right = Math.min(90, weights.right * 1.5)
      else weights.centre = Math.min(70, weights.centre * 1.3)
      const t = weights.left + weights.centre + weights.right
      weights.left = (weights.left / t) * 100
      weights.centre = (weights.centre / t) * 100
      weights.right = (weights.right / t) * 100
    }

    // Weighted probability roll
    const roll = Math.random() * 100
    if (roll < weights.left) return 'left'
    if (roll < weights.left + weights.centre) return 'centre'
    return 'right'
  }

  getHeightBias(): Height {
    if (this.history.length < 2) return Math.random() > 0.5 ? 'top' : 'bottom'
    const topCount = this.history.filter(s => s.height === 'top').length
    const topRatio = topCount / this.history.length
    return Math.random() < topRatio ? 'top' : 'bottom'
  }

  reset(): void {
    this.history = []
  }

  getShotCount(): number {
    return this.history.length
  }
}
