'use client'
import dynamic from 'next/dynamic'

const PenaltyGame = dynamic(() => import('../components/game/PenaltyGame'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-[#0a0a0f]">
      <p className="text-white text-lg tracking-widest animate-pulse">LOADING...</p>
    </div>
  ),
})

export default function Home() {
  return (
    <main className="w-full h-screen">
      <PenaltyGame />
    </main>
  )
}
