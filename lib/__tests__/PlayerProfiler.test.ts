import { describe, it, expect } from 'vitest'
import { PlayerProfiler } from '../game/ai/PlayerProfiler'

describe('PlayerProfiler', () => {
  it('classifies repeater who always shoots same zone after goal', () => {
    const p = new PlayerProfiler()
    p.record('left-top', true)
    p.record('left-top', true)
    p.record('left-top', true)
    p.record('left-top', true)
    expect(p.classify()).toBe('repeater')
  })

  it('classifies alternator who switches after every goal', () => {
    const p = new PlayerProfiler()
    p.record('left-top', true)
    p.record('right-top', true)
    p.record('left-top', true)
    p.record('right-top', true)
    expect(p.classify()).toBe('alternator')
  })

  it('returns unknown with fewer than 4 shots', () => {
    const p = new PlayerProfiler()
    p.record('left-top', true)
    p.record('right-top', true)
    expect(p.classify()).toBe('unknown')
  })

  it('detects dominant zone when >50% shots in one zone', () => {
    const p = new PlayerProfiler()
    for (let i = 0; i < 6; i++) p.record('right-bottom', true)
    p.record('left-top', true)
    expect(p.getDominantZone()).toBe('right-bottom')
  })
})
