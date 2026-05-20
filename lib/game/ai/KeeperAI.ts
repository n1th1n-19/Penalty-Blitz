import { Zone, Height, ShotRecord, coordToZone, coordToHeight } from '../types'

type ShotType = `${Zone}-${Height}`
const ZONES: Zone[] = ['left', 'centre', 'right']
const HEIGHTS: Height[] = ['top', 'bottom']
const SHOT_TYPES: ShotType[] = ZONES.flatMap(z => HEIGHTS.map(h => `${z}-${h}` as ShotType))

// Canonical center of each zone in normalized goal coordinates
const ZONE_X: Record<Zone, number>   = { left: 1 / 6, centre: 1 / 2, right: 5 / 6 }
const HEIGHT_Y: Record<Height, number> = { top: 1 / 4, bottom: 3 / 4 }
const BW_X = 0.20   // horizontal kernel bandwidth (20% of goal width)
const BW_Y = 0.25   // vertical kernel bandwidth   (25% of goal height)

// Gaussian kernel: how strongly does a shot at (sx, sy) activate a given zone?
function shotKernel(sx: number, sy: number, type: ShotType): number {
  const [zone, height] = type.split('-') as [Zone, Height]
  const dx = (sx - ZONE_X[zone])   / BW_X
  const dy = (sy - HEIGHT_Y[height]) / BW_Y
  return Math.exp(-(dx * dx + dy * dy) / 2)
}

export class KeeperAI {
  private history: ShotRecord[] = []
  private readonly DECAY = 0.85
  private readonly STORAGE_KEY = 'pblitz-keeper-history'
  private readonly MAX_PERSISTENT = 8
  private resultBoosts: Partial<Record<ShotType, number>> = {}
  private populationClusters: { x: number; y: number; weight: number }[] = []
  private populationTransitions: Partial<Record<ShotType, Partial<Record<ShotType, number>>>> = {}
  private populationTotal = 0
  readonly playerId: string

  constructor() {
    this.playerId = this.getOrCreatePlayerId()
    this.loadPersistent()
    this.fetchPopulationPrior()
  }

  private getOrCreatePlayerId(): string {
    try {
      let id = localStorage.getItem('pblitz-player-id')
      if (!id) {
        id = crypto.randomUUID()
        localStorage.setItem('pblitz-player-id', id)
      }
      return id
    } catch {
      return 'anonymous'
    }
  }

  private loadPersistent(): void {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY)
      if (raw) this.history = (JSON.parse(raw) as ShotRecord[]).slice(-this.MAX_PERSISTENT)
    } catch {}
  }

  private savePersistent(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.history.slice(-this.MAX_PERSISTENT)))
    } catch {}
  }

  async fetchPopulationPrior(): Promise<void> {
    try {
      const res = await fetch('/api/patterns')
      if (!res.ok) return
      const data = await res.json()
      this.populationClusters = (data.clusters ?? []).filter(
        (c: { x: unknown; y: unknown; weight: unknown }) =>
          isFinite(c.x as number) && isFinite(c.y as number) && isFinite(c.weight as number)
      )
      this.populationTransitions = data.transitions ?? {}
      this.populationTotal = data.totalShots ?? 0
    } catch {}
  }

  recordShot(x: number, y: number, power: number): void {
    this.history.push({ x, y, power })
    this.savePersistent()
  }

  syncShot(scored: boolean, x: number, y: number, power: number, prevX?: number, prevY?: number): void {
    fetch('/api/shots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        player_id: this.playerId,
        x, y, power, scored,
        prev_x: prevX ?? null,
        prev_y: prevY ?? null,
      }),
    }).catch(() => {})
  }

  // Which zone does this coordinate most strongly belong to?
  private dominantType(x: number, y: number): ShotType {
    return SHOT_TYPES.reduce((best, t) =>
      shotKernel(x, y, t) > shotKernel(x, y, best) ? t : best
    , SHOT_TYPES[0])
  }

  private getJointWeights(): Record<ShotType, number> {
    // Laplace prior (uniform baseline)
    const counts = Object.fromEntries(SHOT_TYPES.map(t => [t, 1])) as Record<ShotType, number>

    // Population KDE: each coordinate cluster contributes kernel-weighted mass
    // Scale: population counts as ~8 virtual shots so player history can override quickly
    const popScale = this.populationTotal > 0 ? 8 / this.populationTotal : 0
    for (const { x, y, weight } of this.populationClusters) {
      for (const t of SHOT_TYPES) {
        counts[t] += weight * popScale * shotKernel(x, y, t)
      }
    }

    // Player's own history with exponential recency decay
    const n = this.history.length
    for (let i = 0; i < n; i++) {
      const { x, y } = this.history[i]
      const recency = Math.pow(this.DECAY, n - 1 - i)
      for (const t of SHOT_TYPES) {
        const boost = 1 + 0.5 * (this.resultBoosts[t] ?? 0)
        counts[t] += recency * shotKernel(x, y, t) * boost
      }
    }

    const total = SHOT_TYPES.reduce((s, t) => s + counts[t], 0)
    return Object.fromEntries(SHOT_TYPES.map(t => [t, (counts[t] / total) * 100])) as Record<ShotType, number>
  }

  private getMarkovWeights(): Record<ShotType, number> | null {
    const n = this.history.length
    if (n < 2) return null
    const last = this.history[n - 1]
    const lastType = this.dominantType(last.x, last.y)

    let realTransitions = 0
    const counts = Object.fromEntries(SHOT_TYPES.map(t => [t, 0.5])) as Record<ShotType, number>

    for (let i = 0; i < n - 1; i++) {
      const from = this.dominantType(this.history[i].x, this.history[i].y)
      if (from === lastType) {
        const to = this.dominantType(this.history[i + 1].x, this.history[i + 1].y)
        counts[to] += Math.pow(this.DECAY, n - 2 - i)
        realTransitions++
      }
    }

    const globalFrom = this.populationTransitions[lastType]
    if (globalFrom) {
      for (const t of SHOT_TYPES) counts[t] += (globalFrom[t] ?? 0) * 0.005
    }

    if (realTransitions === 0 && !globalFrom) return null

    const total = SHOT_TYPES.reduce((s, t) => s + counts[t], 0)
    return Object.fromEntries(SHOT_TYPES.map(t => [t, (counts[t] / total) * 100])) as Record<ShotType, number>
  }

  private predictCoordinate(chosenType: ShotType): { x: number; y: number } {
    let wx = 0, wy = 0, w = 0
    const popScale = this.populationTotal > 0 ? 30 / this.populationTotal : 0
    for (const cluster of this.populationClusters) {
      const kw = shotKernel(cluster.x, cluster.y, chosenType) * cluster.weight * popScale
      wx += cluster.x * kw
      wy += cluster.y * kw
      w += kw
    }
    const n = this.history.length
    for (let i = 0; i < n; i++) {
      const { x, y } = this.history[i]
      const recency = Math.pow(this.DECAY, n - 1 - i)
      const kw = recency * shotKernel(x, y, chosenType)
      wx += x * kw
      wy += y * kw
      w += kw
    }
    const [zone, height] = chosenType.split('-') as [Zone, Height]
    const fallback = { x: ZONE_X[zone], y: HEIGHT_Y[height] }
    if (!(w > 0)) return fallback
    const rx = wx / w, ry = wy / w
    if (!isFinite(rx) || !isFinite(ry)) return fallback
    return { x: Math.max(0, Math.min(1, rx)), y: Math.max(0, Math.min(1, ry)) }
  }

  predictShot(): { zone: Zone; height: Height; x: number; y: number } {
    const freq = this.getJointWeights()
    const markov = this.getMarkovWeights()
    const blend = markov ? Math.min(0.45, this.history.length * 0.1) : 0

    const weights = Object.fromEntries(
      SHOT_TYPES.map(t => [t, (1 - blend) * freq[t] + blend * (markov?.[t] ?? freq[t])])
    ) as Record<ShotType, number>

    const total = SHOT_TYPES.reduce((s, t) => s + weights[t], 0)
    const roll = Math.random() * total
    let cumulative = 0
    for (const t of SHOT_TYPES) {
      cumulative += weights[t]
      if (roll < cumulative) {
        const [zone, height] = t.split('-') as [Zone, Height]
        const { x, y } = this.predictCoordinate(t)
        return { zone, height, x, y }
      }
    }
    const best = SHOT_TYPES.reduce((a, b) => weights[a] > weights[b] ? a : b)
    const [zone, height] = best.split('-') as [Zone, Height]
    const { x, y } = this.predictCoordinate(best)
    return { zone, height, x, y }
  }

  getConfidence(): number {
    const weights = this.getJointWeights()
    const maxEntropy = Math.log(SHOT_TYPES.length)
    let entropy = 0
    for (const t of SHOT_TYPES) {
      const p = weights[t] / 100
      if (p > 0) entropy -= p * Math.log(p)
    }
    return 1 - entropy / maxEntropy
  }

  updateResult(scored: boolean, keeperZone: Zone, keeperHeight: Height, x: number, y: number): void {
    if (!scored) return
    const shotZone = coordToZone(x)
    const shotHeight = coordToHeight(y)
    if (keeperZone === shotZone && keeperHeight === shotHeight) {
      const type: ShotType = `${shotZone}-${shotHeight}`
      this.resultBoosts[type] = (this.resultBoosts[type] ?? 0) + 1
    }
  }

  getPrevShot(): ShotRecord | undefined {
    return this.history[this.history.length - 2]
  }

  getWeights(): Record<Zone, number> {
    const j = this.getJointWeights()
    return {
      left:   j['left-top']   + j['left-bottom'],
      centre: j['centre-top'] + j['centre-bottom'],
      right:  j['right-top']  + j['right-bottom'],
    }
  }

  reset(): void { this.history = [] }
  getShotCount(): number { return this.history.length }
}
