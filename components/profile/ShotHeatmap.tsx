interface ShotHeatmapProps {
  heatmap: Record<string, number>
}

const ZONES = [
  ['left-top', 'centre-top', 'right-top'],
  ['left-bottom', 'centre-bottom', 'right-bottom'],
]

const ZONE_LABELS: Record<string, string> = {
  'left-top':    'L',
  'centre-top':  'C',
  'right-top':   'R',
  'left-bottom': 'L',
  'centre-bottom': 'C',
  'right-bottom': 'R',
}

export default function ShotHeatmap({ heatmap }: ShotHeatmapProps) {
  const max = Math.max(...Object.values(heatmap), 0.001)

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 10,
      overflow: 'hidden',
      background: 'rgba(0,0,0,0.2)',
    }}>
      {/* Goal post header */}
      <div style={{
        height: 4,
        background: 'rgba(255,255,255,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <div style={{ width: 3, height: '100%', background: 'rgba(255,255,255,0.15)' }} />
        <div style={{ width: 3, height: '100%', background: 'rgba(255,255,255,0.15)' }} />
      </div>

      {ZONES.map((row, rowIdx) => (
        <div key={rowIdx} style={{ display: 'flex', borderTop: rowIdx > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
          {row.map((zone, colIdx) => {
            const heat = heatmap[zone] ?? 0
            const norm = heat / max
            return (
              <div
                key={zone}
                style={{
                  flex: 1,
                  padding: '14px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  background: `rgba(34,197,94, ${0.04 + norm * 0.35})`,
                  borderLeft: colIdx > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  transition: 'background 0.3s',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 18,
                  color: norm > 0.5 ? 'var(--green-accent)' : 'var(--text-muted)',
                  lineHeight: 1,
                }}>
                  {Math.round(heat * 100)}%
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 8,
                  color: 'var(--text-dim)',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                }}>
                  {rowIdx === 0 ? 'TOP' : 'BOT'} {ZONE_LABELS[zone]}
                </span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
