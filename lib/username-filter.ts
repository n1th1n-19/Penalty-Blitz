import { Filter } from 'bad-words'

const filter = new Filter()

const RESERVED = new Set([
  'admin', 'moderator', 'mod', 'support', 'official',
  'penalty_blitz', 'penaltyblitz', 'staff', 'system', 'bot',
])

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/

export enum UsernameError {
  TOO_SHORT     = 'TOO_SHORT',
  TOO_LONG      = 'TOO_LONG',
  INVALID_CHARS = 'INVALID_CHARS',
  RESERVED      = 'RESERVED',
  PROFANITY     = 'PROFANITY',
}

export type UsernameResult =
  | { ok: true }
  | { ok: false; error: UsernameError }

export function validateUsername(username: string): UsernameResult {
  if (username.length < 3)  return { ok: false, error: UsernameError.TOO_SHORT }
  if (username.length > 20) return { ok: false, error: UsernameError.TOO_LONG }
  if (!USERNAME_REGEX.test(username)) return { ok: false, error: UsernameError.INVALID_CHARS }
  if (RESERVED.has(username.toLowerCase())) return { ok: false, error: UsernameError.RESERVED }
  if (filter.isProfane(username)) return { ok: false, error: UsernameError.PROFANITY }
  return { ok: true }
}

export const USERNAME_ERROR_MESSAGES: Record<UsernameError, string> = {
  [UsernameError.TOO_SHORT]:     'Username must be at least 3 characters',
  [UsernameError.TOO_LONG]:      'Username must be 20 characters or fewer',
  [UsernameError.INVALID_CHARS]: 'Only letters, numbers, and underscores allowed',
  [UsernameError.RESERVED]:      'That username is reserved',
  [UsernameError.PROFANITY]:     'That username is not allowed',
}
