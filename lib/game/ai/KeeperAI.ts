import { Zone, Height, ShotRecord } from '../types'

export class KeeperAI {
  private history: ShotRecord[] = []
  private readonly DECAY = 0.8

  recordShot(zone: Zone, height: Height, round: number): void {
    this.history.push({ zone, height, round })
  }

  getWeights(): Record<Zone, number> {
    // Laplace prior: one phantom shot per zone so no zone starts at 0%
    const counts: Record<Zone, number> = { left: 1, centre: 1, right: 1 }
    const n = this.history.length

    this.history.forEach((shot, idx) => {
      // Exponential decay: recent shots count more, old shots fade but still matter
      const recency = Math.pow(this.DECAY, n - 1 - idx)
      counts[shot.zone] += recency
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
    const roll = Math.random() * 100
    if (roll < weights.left) return 'left'
    if (roll < weights.left + weights.centre) return 'centre'
    return 'right'
  }

  getHeightBias(): Height {
    let topCount = 1
    let bottomCount = 1
    const n = this.history.length

    this.history.forEach((shot, idx) => {
      const recency = Math.pow(this.DECAY, n - 1 - idx)
      if (shot.height === 'top') topCount += recency
      else bottomCount += recency
    })

    const topRatio = topCount / (topCount + bottomCount)
    return Math.random() < topRatio ? 'top' : 'bottom'
  }

  reset(): void {
    this.history = []
  }

  getShotCount(): number {
    return this.history.length
  }
}
