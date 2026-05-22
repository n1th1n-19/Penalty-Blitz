import { Howl, Howler } from 'howler'

type SoundKey =
  | 'kick' | 'goalCheer' | 'save' | 'missWhoosh' | 'missGroan'
  | 'powerbarTick' | 'powerbarLock' | 'crowdLoop' | 'crowdHush'
  | 'goalHorn' | 'perfectFanfare' | 'menuMusic'

const SOUND_DEFS: Record<SoundKey, { src: string; loop?: boolean; volume?: number }> = {
  kick:            { src: '/sounds/kick.mp3',              volume: 0.9 },
  goalCheer:       { src: '/sounds/goal_cheer.mp3',        volume: 1.0 },
  save:            { src: '/sounds/save.mp3',              volume: 0.8 },
  missWhoosh:      { src: '/sounds/miss_whoosh.mp3',       volume: 0.7 },
  missGroan:       { src: '/sounds/miss_groan.mp3',        volume: 0.6 },
  powerbarTick:    { src: '/sounds/powerbar_tick.mp3',     volume: 0.4 },
  powerbarLock:    { src: '/sounds/powerbar_lock.mp3',     volume: 0.7 },
  crowdLoop:       { src: '/sounds/crowd_loop.mp3',  loop: true, volume: 0.3 },
  crowdHush:       { src: '/sounds/crowd_hush.mp3',        volume: 0.25 },
  goalHorn:        { src: '/sounds/goal_horn.mp3',         volume: 0.9 },
  perfectFanfare:  { src: '/sounds/perfect_fanfare.mp3',   volume: 1.0 },
  menuMusic:       { src: '/sounds/menu_music.mp3', loop: true, volume: 0.4 },
}

class AudioManager {
  private sounds: Partial<Record<SoundKey, Howl>> = {}
  private muted = false
  private masterVolume = 0.8
  private lastTickTime = 0

  constructor() {
    if (typeof window !== 'undefined') {
      this.muted = localStorage.getItem('pblitz-muted') === 'true'
      const vol = parseFloat(localStorage.getItem('pblitz-volume') ?? '0.8')
      this.masterVolume = isNaN(vol) ? 0.8 : vol
    }
  }

  private get(key: SoundKey): Howl {
    if (!this.sounds[key]) {
      const def = SOUND_DEFS[key]
      this.sounds[key] = new Howl({
        src: [def.src],
        loop:   def.loop   ?? false,
        volume: (def.volume ?? 0.8) * this.masterVolume,
      })
    }
    return this.sounds[key]!
  }

  play(key: SoundKey): void {
    if (this.muted) return
    if (key === 'powerbarTick') {
      const now = Date.now()
      if (now - this.lastTickTime < 100) return
      this.lastTickTime = now
    }
    this.get(key).play()
  }

  stop(key: SoundKey): void {
    this.sounds[key]?.stop()
  }

  mute(): void {
    this.muted = true
    Howler.volume(0)
    if (typeof window !== 'undefined') localStorage.setItem('pblitz-muted', 'true')
  }

  unmute(): void {
    this.muted = false
    Howler.volume(this.masterVolume)
    if (typeof window !== 'undefined') localStorage.setItem('pblitz-muted', 'false')
  }

  isMuted(): boolean { return this.muted }

  setVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol))
    Howler.volume(this.masterVolume)
    if (typeof window !== 'undefined') {
      localStorage.setItem('pblitz-volume', String(this.masterVolume))
    }
  }

  stopAll(): void {
    Object.values(this.sounds).forEach(s => s?.stop())
  }
}

export const audio = new AudioManager()
