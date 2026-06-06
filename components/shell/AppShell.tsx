'use client'
import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useSystemStore, UserCache } from '@/store/systemStore'
import MainScreen from '@/components/screens/MainScreen'
import LeaderboardScreen from '@/components/screens/LeaderboardScreen'
import ProfileScreen from '@/components/screens/ProfileScreen'
import KitSelectScreen from '@/components/screens/KitSelectScreen'

const GameScreen = dynamic(() => import('@/components/screens/GameScreen'), {
  ssr: false,
  loading: () => (
    <div style={{ position: 'fixed', inset: 0, background: '#040d06', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'white', fontFamily: 'monospace', letterSpacing: '0.3em', fontSize: 14 }}>LOADING...</p>
    </div>
  ),
})

export default function AppShell({ initialUser }: { initialUser: UserCache }) {
  const { current, setUser } = useSystemStore()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setUser(initialUser) }, [])

  return (
    <div style={{ width: '100%', height: '100dvh', overflow: 'hidden', position: 'relative' }}>
      {current.screen === 'main'        && <MainScreen />}
      {current.screen === 'leaderboard' && <LeaderboardScreen />}
      {current.screen === 'profile'     && <ProfileScreen username={current.username} />}
      {current.screen === 'kit-select'  && <KitSelectScreen />}
      {current.screen === 'game'        && <GameScreen />}
    </div>
  )
}
