import { describe, it, expect } from 'vitest'
import { calculateXp, calculateLevel, xpForNextLevel } from '../xp'

describe('calculateXp', () => {
  it('awards 10 XP per goal on easy', () => {
    expect(calculateXp(3, 'easy')).toBe(30)
  })
  it('awards 15 XP per goal on medium', () => {
    expect(calculateXp(3, 'medium')).toBe(45)
  })
  it('awards 25 XP per goal on hard', () => {
    expect(calculateXp(3, 'hard')).toBe(75)
  })
  it('adds 50 XP bonus for perfect game (5/5)', () => {
    expect(calculateXp(5, 'medium')).toBe(75 + 50)
  })
  it('no bonus for non-perfect game', () => {
    expect(calculateXp(4, 'medium')).toBe(60)
  })
})

describe('calculateLevel', () => {
  it('level 1 at 0 XP', () => expect(calculateLevel(0)).toBe(1))
  it('level 2 at 100 XP', () => expect(calculateLevel(100)).toBe(2))
  it('level 3 at 350 XP', () => expect(calculateLevel(350)).toBe(3))
})

describe('xpForNextLevel', () => {
  it('needs 100 XP to reach level 2 from level 1', () => {
    expect(xpForNextLevel(1)).toBe(100)
  })
  it('needs 250 XP total to reach level 3', () => {
    expect(xpForNextLevel(2)).toBe(250)
  })
})
