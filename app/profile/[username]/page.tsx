import { notFound } from 'next/navigation'
import XpBar from '@/components/profile/XpBar'
import ShotHeatmap from '@/components/profile/ShotHeatmap'

interface ProfileData {
  username: string
  level: number
  xp: number
  avatarKitId: string | null
  totalGoals: number
  totalShots: number
  bestGame: number
  winRate: number
  gamesPlayed: number
  heatmap: Record<string, number>
  recentGames: {
    goalsScored: number
    totalShots: number
    difficulty: string
    xpEarned: number
    createdAt: string
  }[]
}

interface PageProps {
  params: { username: string }
}

export default async function ProfilePage({ params }: PageProps) {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const res = await fetch(
    `${baseUrl}/api/profile/${encodeURIComponent(params.username)}`,
    { cache: 'no-store' }
  )

  if (!res.ok) {
    notFound()
  }

  const data: ProfileData = await res.json()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        {/* Header card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-gray-900">{data.username}</h1>
            <span className="bg-green-100 text-green-800 text-xs font-black px-2 py-1 rounded">
              Lv.{data.level}
            </span>
          </div>
          <XpBar xp={data.xp} level={data.level} />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-black text-green-700">{data.totalGoals}</p>
            <p className="text-xs text-gray-500 font-semibold mt-1">Total Goals</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-black text-green-700">{data.gamesPlayed}</p>
            <p className="text-xs text-gray-500 font-semibold mt-1">Games Played</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-black text-green-700">{data.bestGame} / 5</p>
            <p className="text-xs text-gray-500 font-semibold mt-1">Best Game</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-black text-green-700">{data.winRate}%</p>
            <p className="text-xs text-gray-500 font-semibold mt-1">Win Rate</p>
          </div>
        </div>

        {/* Heatmap card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <ShotHeatmap heatmap={data.heatmap} />
        </div>

        {/* Recent games card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
            Recent Games
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs font-semibold border-b pb-2">
                <th className="pb-2">Date</th>
                <th className="pb-2">Score</th>
                <th className="pb-2">Difficulty</th>
                <th className="pb-2 text-right">XP</th>
              </tr>
            </thead>
            <tbody>
              {data.recentGames.map((g, i) => (
                <tr key={g.createdAt ?? i} className="border-b last:border-0">
                  <td className="py-2 text-gray-600">
                    {new Date(g.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 text-gray-600">
                    {g.goalsScored} / {g.totalShots}
                  </td>
                  <td className="py-2 text-gray-600 capitalize">{g.difficulty}</td>
                  <td className="py-2 text-right text-green-700 font-bold">+{g.xpEarned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
