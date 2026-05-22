import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable'

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            LEADERBOARD
          </h1>
          <Link
            href="/game"
            className="text-sm text-green-700 font-bold hover:underline"
          >
            Play
          </Link>
        </div>

        <LeaderboardTable myUserId={session?.user?.id} />
      </div>
    </main>
  )
}
