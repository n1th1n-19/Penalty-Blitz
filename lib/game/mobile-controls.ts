export type ControlScheme = 'drag' | 'joystick' | 'tap'

export function getControlScheme(): ControlScheme {
  if (typeof window === 'undefined') return 'drag'
  const stored = localStorage.getItem('pblitz-controls') as ControlScheme | null
  return stored ?? 'drag'
}

export function setControlScheme(scheme: ControlScheme): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pblitz-controls', scheme)
  }
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}
