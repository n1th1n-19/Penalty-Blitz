import { describe, it, expect } from 'vitest'
import { validateUsername, UsernameError } from '../username-filter'

describe('validateUsername', () => {
  it('accepts a valid username', () => {
    expect(validateUsername('nithin_19')).toEqual({ ok: true })
  })

  it('rejects usernames shorter than 3 chars', () => {
    expect(validateUsername('ab')).toEqual({ ok: false, error: UsernameError.TOO_SHORT })
  })

  it('rejects usernames longer than 20 chars', () => {
    expect(validateUsername('a'.repeat(21))).toEqual({ ok: false, error: UsernameError.TOO_LONG })
  })

  it('rejects usernames with invalid characters', () => {
    expect(validateUsername('hello world')).toEqual({ ok: false, error: UsernameError.INVALID_CHARS })
    expect(validateUsername('hello!')).toEqual({ ok: false, error: UsernameError.INVALID_CHARS })
  })

  it('rejects reserved words', () => {
    expect(validateUsername('admin')).toEqual({ ok: false, error: UsernameError.RESERVED })
    expect(validateUsername('Admin')).toEqual({ ok: false, error: UsernameError.RESERVED })
  })

  it('rejects profanity', () => {
    const result = validateUsername('fuck')
    expect(result.ok).toBe(false)
    expect(result.error).toBe(UsernameError.PROFANITY)
  })

  it('accepts username at minimum length (3 chars)', () => {
    expect(validateUsername('abc')).toEqual({ ok: true })
  })

  it('accepts username at maximum length (20 chars)', () => {
    expect(validateUsername('a'.repeat(20))).toEqual({ ok: true })
  })
})
