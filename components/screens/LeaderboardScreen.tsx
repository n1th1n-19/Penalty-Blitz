'use client'
import { useSystemStore } from '@/store/systemStore'
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable'
import { Icon } from '@/components/ui/PbUi'

export default function LeaderboardScreen() {
  const { user, back } = useSystemStore()

  return (
    <div className="pb-stadium" style={{ height: '100dvh', overflowY: 'auto' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 'clamp(20px,4vw,48px) 20px 60px' }}>

        <div className="a-slide" style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 'clamp(16px,3vh,30px)', flexWrap: 'wrap' }}>
          <button
            onClick={back}
            className="pb-btn pb-btn-ghost"
            style={{ padding: '10px 16px', flexShrink: 0 }}
          >
            <Icon name="back" size={14} /> Back
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="mono-label" style={{ color: 'var(--lime)', letterSpacing: '0.4em', marginBottom: 4 }}>Global Rankings</p>
            <h1 className="display" style={{ fontSize: 'clamp(28px,6vw,56px)', color: '#fff', lineHeight: 0.95 }}>
              LEADERBOARD
            </h1>
          </div>
        </div>
        <div className="pb-divider" style={{ marginBottom: 'clamp(14px,2.5vh,24px)' }}><span /></div>

        <LeaderboardTable myUserId={user?.id} />
      </div>
    </div>
  )
}
