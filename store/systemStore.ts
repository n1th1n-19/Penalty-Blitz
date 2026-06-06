import { create } from 'zustand'
import { Kit } from '@/lib/game/types'

export type ScreenName = 'main' | 'game' | 'kit-select' | 'leaderboard' | 'profile'

export type ScreenParams =
  | { screen: 'main' }
  | { screen: 'game' }
  | { screen: 'kit-select' }
  | { screen: 'leaderboard' }
  | { screen: 'profile'; username: string }

export interface UserCache {
  id: string
  username: string
  level: number
  xp: number
  kit: Kit
}

interface SystemState {
  current: ScreenParams
  stack: ScreenParams[]
  user: UserCache | null
  navigate: (to: ScreenParams) => void
  back: () => void
  replace: (to: ScreenParams) => void
  setUser: (user: UserCache) => void
  updateUser: (patch: Partial<UserCache>) => void
}

export const useSystemStore = create<SystemState>((set, get) => ({
  current: { screen: 'main' },
  stack: [],
  user: null,

  navigate: (to) => set(s => ({ stack: [...s.stack, s.current], current: to })),

  back: () => {
    const { stack } = get()
    if (!stack.length) return
    set(s => ({ current: s.stack[s.stack.length - 1], stack: s.stack.slice(0, -1) }))
  },

  replace: (to) => set({ current: to }),

  setUser: (user) => set({ user }),

  updateUser: (patch) => set(s => ({ user: s.user ? { ...s.user, ...patch } : s.user })),
}))
