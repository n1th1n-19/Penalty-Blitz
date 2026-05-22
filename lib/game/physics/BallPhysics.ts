export interface BallState {
  x: number;  y: number;  z: number
  vx: number; vy: number; vz: number
  spinY: number
  spinSpeed: number
  rotation: number
}

interface LaunchParams {
  vz: number; vx: number; vy: number
  spinY: number
}

export function createBallState(params: LaunchParams): BallState {
  return {
    x: 0, y: 0, z: 0,
    vx: params.vx,
    vy: params.vy,
    vz: params.vz,
    spinY: params.spinY,
    spinSpeed: Math.abs(params.vx) * 2 + Math.abs(params.spinY) * 3,
    rotation: 0,
  }
}

const DRAG    = 0.985
const GRAVITY = 0.003
const MAGNUS  = 0.0008

export function stepBall(state: BallState, dt: number): BallState {
  const vx = state.vx * DRAG + state.spinY * state.vz * MAGNUS
  const vy = state.vy * DRAG + GRAVITY * dt
  const vz = state.vz * DRAG

  return {
    x: state.x + vx * dt,
    y: state.y + vy * dt,
    z: state.z + vz * dt,
    vx, vy, vz,
    spinY:     state.spinY,
    spinSpeed: state.spinSpeed,
    rotation:  state.rotation + state.spinSpeed * dt * 0.01,
  }
}

export function getBallPosition2D(
  state: BallState,
  startX: number,
  startY: number,
  goalX: number,
  goalY: number,
  maxZ: number,
): { x: number; y: number; scale: number } {
  const t = Math.min(1, state.z / maxZ)
  const x = startX + (goalX - startX + state.x * 200) * t
  const y = startY + (goalY - startY + state.y * 200) * t
  const scale = 0.4 + t * 0.6
  return { x, y, scale }
}
