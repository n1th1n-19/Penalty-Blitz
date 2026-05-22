interface ShotHeatmapProps {
  heatmap: Record<string, number>
}

const ZONES = [
  ['left-top', 'centre-top', 'right-top'],
  ['left-bottom', 'centre-bottom', 'right-bottom'],
]

export default function ShotHeatmap({ heatmap }: ShotHeatmapProps) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
        Shot Heatmap
      </p>
      <div className="border-2 border-gray-300 rounded-xl overflow-hidden">
        {ZONES.map((row, rowIdx) => (
          <div key={rowIdx} className="flex">
            {row.map((zone) => {
              const heat = heatmap[zone] ?? 0
              const bg = `rgba(34, 197, 94, ${0.1 + heat * 0.85})`
              const color = heat > 0.5 ? 'white' : '#374151'
              return (
                <div
                  key={zone}
                  className="flex-1 flex items-center justify-center py-4 text-sm font-semibold"
                  style={{ background: bg, color }}
                >
                  {Math.round(heat * 100)}%
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
