export type ControlScheme = 'drag' | 'joystick' | 'tap'

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export function isFirstVisitMobile(): boolean {
  if (typeof window === 'undefined') return false
  return isTouchDevice() && !localStorage.getItem('pblitz-controls')
}

export function getControlScheme(): ControlScheme {
  if (typeof window === 'undefined') return 'drag'
  const stored = localStorage.getItem('pblitz-controls') as ControlScheme | null
  if (stored) return stored
  // Auto-select drag for first-time touch users
  return isTouchDevice() ? 'drag' : 'drag'
}

export function setControlScheme(scheme: ControlScheme): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pblitz-controls', scheme)
  }
}
