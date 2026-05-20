import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function randn(mean: number, std: number): number {
  const u = 1 - Math.random()
  const v = Math.random()
  return mean + Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * std
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

// ── Player archetypes ──────────────────────────────────────────────────────────
// Each archetype has a set of shot clusters [cx, cy, stdX, stdY, weight, scoredRate]
// and a Markov tendency (repeat | alternate | rotate)

type Cluster = [number, number, number, number, number, number]
type Tendency = 'repeat' | 'alternate' | 'rotate'

interface Archetype {
  name: string
  share: number       // fraction of simulated players with this style
  clusters: Cluster[]
  tendency: Tendency
}

const ARCHETYPES: Archetype[] = [
  {
    name: 'corner-hunter',
    share: 0.28,
    tendency: 'alternate',
    clusters: [
      [0.10, 0.82, 0.04, 0.04, 0.40, 0.78],  // bottom-left corner
      [0.90, 0.82, 0.04, 0.04, 0.40, 0.78],  // bottom-right corner
      [0.10, 0.16, 0.04, 0.04, 0.10, 0.82],  // top-left corner
      [0.90, 0.16, 0.04, 0.04, 0.10, 0.82],  // top-right corner
    ],
  },
  {
    name: 'one-sided',
    share: 0.18,
    tendency: 'repeat',
    clusters: [
      [0.12, 0.80, 0.05, 0.05, 0.70, 0.72],  // heavily favour bottom-left
      [0.88, 0.80, 0.05, 0.05, 0.10, 0.72],  // occasionally bottom-right
      [0.50, 0.78, 0.07, 0.05, 0.20, 0.52],  // centre fallback
    ],
  },
  {
    name: 'safe-centre',
    share: 0.15,
    tendency: 'repeat',
    clusters: [
      [0.50, 0.80, 0.07, 0.05, 0.55, 0.50],  // centre-bottom
      [0.50, 0.22, 0.07, 0.05, 0.20, 0.55],  // centre-top
      [0.20, 0.80, 0.06, 0.05, 0.15, 0.66],  // slight left lean
      [0.80, 0.80, 0.06, 0.05, 0.10, 0.66],  // slight right lean
    ],
  },
  {
    name: 'top-corner-specialist',
    share: 0.12,
    tendency: 'alternate',
    clusters: [
      [0.10, 0.15, 0.04, 0.04, 0.42, 0.86],  // top-left
      [0.90, 0.15, 0.04, 0.04, 0.42, 0.86],  // top-right
      [0.10, 0.82, 0.04, 0.04, 0.08, 0.74],  // bottom-left fallback
      [0.90, 0.82, 0.04, 0.04, 0.08, 0.74],  // bottom-right fallback
    ],
  },
  {
    name: 'rotator',
    share: 0.14,
    tendency: 'rotate',
    clusters: [
      [0.12, 0.82, 0.05, 0.05, 0.33, 0.74],  // left-bottom
      [0.50, 0.78, 0.06, 0.05, 0.33, 0.54],  // centre-bottom
      [0.88, 0.82, 0.05, 0.05, 0.34, 0.74],  // right-bottom
    ],
  },
  {
    name: 'high-power',
    share: 0.13,
    tendency: 'alternate',
    clusters: [
      [0.15, 0.18, 0.05, 0.05, 0.35, 0.80],  // top-left
      [0.85, 0.18, 0.05, 0.05, 0.35, 0.80],  // top-right
      [0.15, 0.80, 0.05, 0.05, 0.15, 0.72],  // bottom-left
      [0.85, 0.80, 0.05, 0.05, 0.15, 0.72],  // bottom-right
    ],
  },
]

function pickArchetype(): Archetype {
  const total = ARCHETYPES.reduce((s, a) => s + a.share, 0)
  let r = Math.random() * total
  for (const a of ARCHETYPES) {
    r -= a.share
    if (r <= 0) return a
  }
  return ARCHETYPES[0]
}

function sampleFromClusters(clusters: Cluster[]): { x: number; y: number; scored: boolean; power: number } {
  const total = clusters.reduce((s, c) => s + c[4], 0)
  let r = Math.random() * total
  let cluster = clusters[0]
  for (const c of clusters) {
    r -= c[4]
    if (r <= 0) { cluster = c; break }
  }
  const [cx, cy, sx, sy, , scoredRate] = cluster
  return {
    x: clamp(randn(cx, sx), 0.02, 0.98),
    y: clamp(randn(cy, sy), 0.02, 0.98),
    power: clamp(Math.round(randn(64, 17)), 8, 93),
    scored: Math.random() < scoredRate,
  }
}

// Markov tendency: given last shot (lx, ly), bias next shot choice
function biasedClusters(archetype: Archetype, prevX: number | null, prevY: number | null): Cluster[] {
  if (prevX === null || prevY === null) return archetype.clusters

  const clusters = archetype.clusters
  if (clusters.length < 2) return clusters

  // Find which cluster the previous shot was closest to
  const prevIdx = clusters.reduce((best, c, i) => {
    const d = (c[0] - prevX) ** 2 + (c[1] - (prevY ?? 0)) ** 2
    const bd = (clusters[best][0] - prevX) ** 2 + (clusters[best][1] - (prevY ?? 0)) ** 2
    return d < bd ? i : best
  }, 0)

  if (archetype.tendency === 'repeat') {
    // Up-weight the same cluster
    return clusters.map((c, i) => [c[0], c[1], c[2], c[3], i === prevIdx ? c[4] * 2.5 : c[4] * 0.6, c[5]] as Cluster)
  }
  if (archetype.tendency === 'alternate') {
    // Down-weight the same cluster, up-weight others
    return clusters.map((c, i) => [c[0], c[1], c[2], c[3], i === prevIdx ? c[4] * 0.2 : c[4] * 1.5, c[5]] as Cluster)
  }
  if (archetype.tendency === 'rotate') {
    // Up-weight the next cluster in sequence
    const nextIdx = (prevIdx + 1) % clusters.length
    return clusters.map((c, i) => [c[0], c[1], c[2], c[3], i === nextIdx ? c[4] * 3 : c[4] * 0.4, c[5]] as Cluster)
  }
  return clusters
}

async function main() {
  const TOTAL_SHOTS = 2000  // ← edit to add more
  const SHOTS_PER_GAME = 5

  console.log(`Seeding ${TOTAL_SHOTS} shots across ${Math.ceil(TOTAL_SHOTS / SHOTS_PER_GAME)} simulated games...`)

  const batch: {
    playerId: string
    x: number; y: number
    power: number; scored: boolean
    prevX: number | null; prevY: number | null
  }[] = []

  let playerIdx = 0
  let i = 0

  while (i < TOTAL_SHOTS) {
    const archetype = pickArchetype()
    const gameShots = Math.min(SHOTS_PER_GAME, TOTAL_SHOTS - i)
    const playerId = `seed-${archetype.name}-${playerIdx++}`
    let prevX: number | null = null
    let prevY: number | null = null

    for (let s = 0; s < gameShots; s++) {
      const biased = biasedClusters(archetype, prevX, prevY)
      const { x, y, power, scored } = sampleFromClusters(biased)
      batch.push({ playerId, x, y, power, scored, prevX, prevY })
      prevX = x
      prevY = y
      i++
    }
  }

  // Insert in chunks of 500
  for (let start = 0; start < batch.length; start += 500) {
    await prisma.shot.createMany({ data: batch.slice(start, start + 500) })
    console.log(`  Inserted ${Math.min(start + 500, batch.length)} / ${batch.length}`)
  }

  console.log('Done.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
