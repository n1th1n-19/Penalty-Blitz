import { describe, it, expect } from 'vitest'
import { createBallState, stepBall, getBallPosition2D } from '../game/physics/BallPhysics'

describe('BallPhysics', () => {
  it('ball moves forward each step', () => {
    const state = createBallState({ vz: 1, vx: 0, vy: -0.5, spinY: 0 })
    const next = stepBall(state, 16)
    expect(next.z).toBeGreaterThan(state.z)
  })

  it('drag slows the ball over time', () => {
    const state = createBallState({ vz: 1, vx: 0, vy: 0, spinY: 0 })
    const after10 = Array.from({ length: 10 }).reduce((s: any) => stepBall(s, 16), state) as any
    expect(after10.vz).toBeLessThan(1)
  })

  it('positive spinY curves ball in x direction', () => {
    const state = createBallState({ vz: 1, vx: 0, vy: 0, spinY: 1 })
    const after20 = Array.from({ length: 20 }).reduce((s: any) => stepBall(s, 16), state) as any
    expect(after20.x).toBeGreaterThan(0)
  })

  it('gravity pulls ball down', () => {
    const state = createBallState({ vz: 1, vx: 0, vy: 0, spinY: 0 })
    const after30 = Array.from({ length: 30 }).reduce((s: any) => stepBall(s, 16), state) as any
    expect(after30.y).toBeGreaterThan(0) // y increases downward
  })

  it('getBallPosition2D returns start position at t=0', () => {
    const state = createBallState({ vz: 0, vx: 0, vy: 0, spinY: 0 })
    const result = getBallPosition2D(state, 400, 600, 400, 200, 10)
    expect(result.x).toBe(400)
    expect(result.y).toBe(600)
  })
})
