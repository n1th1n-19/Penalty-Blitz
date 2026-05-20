import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    const [clusterRows, transitionRows, total] = await Promise.all([
      // 10×10 coordinate heatmap — cell center + shot count
      prisma.$queryRaw<Array<{ cx: number; cy: number; weight: number }>>`
        SELECT
          (FLOOR(x * 10) / 10 + 0.05)::float AS cx,
          (FLOOR(y * 10) / 10 + 0.05)::float AS cy,
          COUNT(*)::int                        AS weight
        FROM shots
        GROUP BY FLOOR(x * 10), FLOOR(y * 10)
      `,
      // Zone-level Markov transitions (derived from coordinates)
      prisma.$queryRaw<Array<{ from_type: string; to_type: string; count: number }>>`
        SELECT
          CASE WHEN prev_x < 0.333 THEN 'left' WHEN prev_x < 0.667 THEN 'centre' ELSE 'right' END
          || '-' ||
          CASE WHEN prev_y < 0.5 THEN 'top' ELSE 'bottom' END AS from_type,
          CASE WHEN x < 0.333 THEN 'left' WHEN x < 0.667 THEN 'centre' ELSE 'right' END
          || '-' ||
          CASE WHEN y < 0.5 THEN 'top' ELSE 'bottom' END AS to_type,
          COUNT(*)::int AS count
        FROM shots
        WHERE prev_x IS NOT NULL
        GROUP BY from_type, to_type
      `,
      prisma.shot.count(),
    ])

    const clusters = clusterRows.map(r => ({
      x: Number(r.cx),
      y: Number(r.cy),
      weight: Number(r.weight),
    }))

    const transitions: Record<string, Record<string, number>> = {}
    for (const row of transitionRows) {
      if (!transitions[row.from_type]) transitions[row.from_type] = {}
      transitions[row.from_type][row.to_type] = row.count
    }

    return NextResponse.json({ clusters, transitions, totalShots: total })
  } catch {
    return NextResponse.json({ clusters: [], transitions: {}, totalShots: 0 })
  }
}
