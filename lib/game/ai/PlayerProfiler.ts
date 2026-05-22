type ShotType = string

export type TendencyType = 'repeater' | 'alternator' | 'rotator' | 'unknown'

export class PlayerProfiler {
  private history: Array<{ zone: ShotType; scored: boolean }> = []

  record(zone: ShotType, scored: boolean): void {
    this.history.push({ zone, scored })
  }

  classify(): TendencyType {
    if (this.history.length < 4) return 'unknown'

    let repeatAfterGoal = 0
    let switchAfterGoal = 0

    for (let i = 1; i < this.history.length; i++) {
      const prev = this.history[i - 1]
      const curr = this.history[i]
      if (prev.scored) {
        if (curr.zone === prev.zone) repeatAfterGoal++
        else switchAfterGoal++
      }
    }

    const total = repeatAfterGoal + switchAfterGoal
    if (total < 2) return 'unknown'

    const repeatRatio = repeatAfterGoal / total
    if (repeatRatio >= 0.65) return 'repeater'
    if (repeatRatio <= 0.35) return 'alternator'
    return 'rotator'
  }

  getDominantZone(): ShotType | null {
    if (this.history.length < 6) return null
    const counts: Record<string, number> = {}
    for (const { zone } of this.history) counts[zone] = (counts[zone] ?? 0) + 1
    const [top] = Object.entries(counts).sort((a, b) => b[1] - a[1])
    if (!top) return null
    return top[1] / this.history.length > 0.50 ? top[0] : null
  }

  getZoneBoost(zone: ShotType, lastZone: ShotType | null, lastScored: boolean): number {
    const tendency = this.classify()
    const dominant = this.getDominantZone()

    let boost = 1.0

    if (dominant === zone) boost *= 1.3

    if (lastZone && lastScored) {
      if (tendency === 'repeater' && zone === lastZone) boost *= 1.4
      if (tendency === 'alternator' && zone !== lastZone) boost *= 1.3
    }

    return boost
  }
}
