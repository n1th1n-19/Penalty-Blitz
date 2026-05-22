import { Zone, Height, ShotRecord, coordToZone, coordToHeight } from '../types'
import { NeuralNetwork } from './NeuralNetwork'
import { PlayerProfiler } from './PlayerProfiler'

type ShotType = `${Zone}-${Height}`
const ZONES: Zone[] = ['left', 'centre', 'right']
const HEIGHTS: Height[] = ['top', 'bottom']
const SHOT_TYPES: ShotType[] = ZONES.flatMap(z => HEIGHTS.map(h => `${z}-${h}` as ShotType))

// Canonical center of each zone in normalized goal coordinates
const ZONE_X: Record<Zone, number>   = { left: 1 / 6, centre: 1 / 2, right: 5 / 6 }
const HEIGHT_Y: Record<Height, number> = { top: 1 / 4, bottom: 3 / 4 }

// Gaussian kernel: how strongly does a shot at (sx, sy) activate a given zone?
function shotKernel(sx: number, sy: number, type: ShotType, bwX: number, bwY: number): number {
  const [zone, height] = type.split('-') as [Zone, Height]
  const dx = (sx - ZONE_X[zone])    / bwX
  const dy = (sy - HEIGHT_Y[height]) / bwY
  return Math.exp(-(dx * dx + dy * dy) / 2)
}

export class KeeperAI {
  private history: ShotRecord[] = []
  private readonly DECAY = 0.85
  private readonly STORAGE_KEY = 'pblitz-keeper-history'
  private readonly MAX_PERSISTENT = 25
  private resultBoosts: Partial<Record<ShotType, number>> = {}
  private populationClusters: { x: number; y: number; weight: number }[] = []
  private populationTransitions: Partial<Record<ShotType, Partial<Record<ShotType, number>>>> = {}
  private populationTotal = 0
  private nn = new NeuralNetwork()
  private nnTrained = false
  private profiler = new PlayerProfiler()
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
      this.trainNN()
    } catch {}
  }

  private trainNN(): void {
    const pairs: { x: number; y: number; targetIdx: number; weight: number }[] = []
    let totalWeight = 0

    for (const [fromType, toMap] of Object.entries(this.populationTransitions)) {
      if (!toMap) continue
      const [fz, fh] = fromType.split('-') as [Zone, Height]
      const fromX = ZONE_X[fz]
      const fromY = HEIGHT_Y[fh]
      for (const [toType, count] of Object.entries(toMap)) {
        const toIdx = SHOT_TYPES.indexOf(toType as ShotType)
        if (toIdx === -1 || !count) continue
        pairs.push({ x: fromX, y: fromY, targetIdx: toIdx, weight: count })
        totalWeight += count
      }
    }

    if (pairs.length === 0) { this.nnTrained = true; return }
    for (const p of pairs) p.weight /= totalWeight

    for (let epoch = 0; epoch < 300; epoch++) {
      for (let i = pairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[pairs[i], pairs[j]] = [pairs[j], pairs[i]]
      }
      for (const { x, y, targetIdx, weight } of pairs) {
        const jx = Math.max(0, Math.min(1, x + (Math.random() - 0.5) * 0.10))
        const jy = Math.max(0, Math.min(1, y + (Math.random() - 0.5) * 0.10))
        this.nn.train(jx, jy, targetIdx, 0.05 * weight * pairs.length)
      }
    }
    this.nnTrained = true
  }

  recordShot(x: number, y: number, power: number): void {
    if (this.history.length >= 1) {
      const prev = this.history[this.history.length - 1]
      const toIdx = SHOT_TYPES.indexOf(this.dominantType(x, y))
      if (toIdx !== -1) this.nn.train(prev.x, prev.y, toIdx, 0.005)
    }
    this.history.push({ x, y, power })
    const zone = this.dominantType(x, y)
    this.profiler.record(zone, false)
    this.savePersistent()
  }

  private getNNWeights(): Record<ShotType, number> | null {
    if (!this.nnTrained && this.history.length < 3) return null
    const n = this.history.length
    const px = n > 0 ? this.history[n - 1].x : 0.5
    const py = n > 0 ? this.history[n - 1].y : 0.75
    const probs = this.nn.predict(px, py)
    return Object.fromEntries(SHOT_TYPES.map((t, i) => [t, probs[i] * 100])) as Record<ShotType, number>
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

  private getBandwidths(): { bwX: number; bwY: number } {
    const n = Math.max(this.history.length, 1)
    const xs = this.history.map(s => s.x)
    const ys = this.history.map(s => s.y)
    const meanX = xs.reduce((a, b) => a + b, 0) / n
    const meanY = ys.reduce((a, b) => a + b, 0) / n
    const stdX = n > 1
      ? Math.sqrt(xs.reduce((a, x) => a + (x - meanX) ** 2, 0) / (n - 1))
      : 0.20
    const stdY = n > 1
      ? Math.sqrt(ys.reduce((a, y) => a + (y - meanY) ** 2, 0) / (n - 1))
      : 0.25
    const scale = 1.06 * Math.pow(n, -0.2)
    return {
      bwX: Math.max(0.08, Math.min(0.30, (stdX || 0.20) * scale)),
      bwY: Math.max(0.10, Math.min(0.35, (stdY || 0.25) * scale)),
    }
  }

  // Which zone does this coordinate most strongly belong to?
  private dominantType(x: number, y: number): ShotType {
    const { bwX, bwY } = this.getBandwidths()
    return SHOT_TYPES.reduce((best, t) =>
      shotKernel(x, y, t, bwX, bwY) > shotKernel(x, y, best, bwX, bwY) ? t : best
    , SHOT_TYPES[0])
  }

  private getJointWeights(): Record<ShotType, number> {
    const { bwX, bwY } = this.getBandwidths()

    // Laplace prior (uniform baseline)
    const counts = Object.fromEntries(SHOT_TYPES.map(t => [t, 1])) as Record<ShotType, number>

    // Population KDE: each coordinate cluster contributes kernel-weighted mass
    // Scale: population counts as ~8 virtual shots so player history can override quickly
    const popScale = this.populationTotal > 0 ? 8 / this.populationTotal : 0
    for (const { x, y, weight } of this.populationClusters) {
      for (const t of SHOT_TYPES) {
        counts[t] += weight * popScale * shotKernel(x, y, t, bwX, bwY)
      }
    }

    // Player's own history with exponential recency decay
    const n = this.history.length
    for (let i = 0; i < n; i++) {
      const { x, y } = this.history[i]
      const recency = Math.pow(this.DECAY, n - 1 - i)
      for (const t of SHOT_TYPES) {
        const boost = 1 + 0.5 * (this.resultBoosts[t] ?? 0)
        counts[t] += recency * shotKernel(x, y, t, bwX, bwY) * boost
      }
    }

    // Power-aware zone weights
    const lastPower = this.history.at(-1)?.power ?? 50
    if (lastPower > 75) {
      counts['centre-bottom'] *= 0.6
      counts['centre-top']    *= 0.7
      counts['left-top']      *= 1.3
      counts['right-top']     *= 1.3
    }
    if (lastPower < 35) {
      counts['left-top']      *= 0.7
      counts['right-top']     *= 0.7
      counts['centre-bottom'] *= 1.3
    }

    // Profiler boosts
    const lastZone = this.history.length > 1
      ? this.dominantType(this.history.at(-2)!.x, this.history.at(-2)!.y)
      : null
    for (const t of SHOT_TYPES) {
      counts[t] *= this.profiler.getZoneBoost(t, lastZone, false)
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

    // 2nd-order Markov
    if (n >= 4) {
      const prev2Type = this.dominantType(this.history[n - 2].x, this.history[n - 2].y)
      const sig = `${prev2Type}|${lastType}`
      for (let i = 0; i < n - 2; i++) {
        const s = `${this.dominantType(this.history[i].x, this.history[i].y)}|${this.dominantType(this.history[i + 1].x, this.history[i + 1].y)}`
        if (s === sig) {
          const to = this.dominantType(this.history[i + 2].x, this.history[i + 2].y)
          counts[to] += Math.pow(this.DECAY, n - 3 - i) * 0.5
        }
      }
    }

    const total = SHOT_TYPES.reduce((s, t) => s + counts[t], 0)
    return Object.fromEntries(SHOT_TYPES.map(t => [t, (counts[t] / total) * 100])) as Record<ShotType, number>
  }

  private predictCoordinate(chosenType: ShotType): { x: number; y: number } {
    const { bwX, bwY } = this.getBandwidths()
    let wx = 0, wy = 0, w = 0
    const popScale = this.populationTotal > 0 ? 30 / this.populationTotal : 0
    for (const cluster of this.populationClusters) {
      const kw = shotKernel(cluster.x, cluster.y, chosenType, bwX, bwY) * cluster.weight * popScale
      wx += cluster.x * kw
      wy += cluster.y * kw
      w += kw
    }
    const n = this.history.length
    for (let i = 0; i < n; i++) {
      const { x, y } = this.history[i]
      const recency = Math.pow(this.DECAY, n - 1 - i)
      const kw = recency * shotKernel(x, y, chosenType, bwX, bwY)
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

  predictShot(aiWeight = 0.60): { zone: Zone; height: Height; x: number; y: number } {
    const freq   = this.getJointWeights()
    const markov = this.getMarkovWeights()
    const nn     = this.getNNWeights()

    const n = this.history.length
    const markovBlend = markov ? Math.min(0.25, n * 0.06) : 0
    const nnBlend     = nn ? (this.nnTrained ? 0.15 : 0) + Math.min(0.25, n * 0.05) : 0
    const freqBlend   = Math.max(0, 1 - markovBlend - nnBlend)

    const uniform = 100 / SHOT_TYPES.length
    const weights = Object.fromEntries(
      SHOT_TYPES.map(t => [
        t,
        aiWeight * (
          freqBlend   * freq[t] +
          markovBlend * (markov?.[t] ?? freq[t]) +
          nnBlend     * (nn?.[t]     ?? freq[t])
        ) + (1 - aiWeight) * uniform,
      ])
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
