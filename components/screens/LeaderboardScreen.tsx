'use client'
import { useSystemStore } from '@/store/systemStore'
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable'
import { Icon } from '@/components/ui/PbUi'

export default function LeaderboardScreen() {
  const { user, back } = useSystemStore()

  return (
    <div className="pb-stadium" style={{ height: '100dvh', overflowY: 'auto' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 'clamp(20px,4vw,48px) 20px 60px' }}>

        <button
          onClick={back}
          className="pb-btn pb-btn-ghost"
          style={{ padding: '10px 16px', marginBottom: 28, alignSelf: 'flex-start' }}
        >
          <Icon name="back" size={14} /> Back
        </button>

        <div className="a-slide" style={{ marginBottom: 30 }}>
          <p className="mono-label" style={{ color: 'var(--lime)', letterSpacing: '0.4em', marginBottom: 10 }}>Global Rankings</p>
          <h1 className="display" style={{ fontSize: 'clamp(36px,9vw,60px)', color: '#fff', lineHeight: 0.95, marginBottom: 18 }}>
            LEADERBOARD
          </h1>
          <div className="pb-divider" style={{ marginBottom: 0 }}><span /></div>
        </div>

        <LeaderboardTable myUserId={user?.id} />
      </div>
    </div>
  )
}
