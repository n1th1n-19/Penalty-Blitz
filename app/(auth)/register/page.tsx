'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordStrength = (p: string) => {
    if (p.length === 0) return 0
    let score = 0
    if (p.length >= 8)          score++
    if (/[A-Z]/.test(p))        score++
    if (/[0-9]/.test(p))        score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score
  }

  const strength = passwordStrength(form.password)
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', '#ef4444', '#fbbf24', '#60a5fa', '#4ade80'][strength]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error)
      setLoading(false)
      return
    }

    await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })
    router.push('/main')
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.25em',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
        textAlign: 'center',
        marginBottom: 4,
      }}>
        CREATE ACCOUNT
      </h2>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.35)',
          borderLeft: '3px solid #ef4444',
          borderRadius: 8,
          padding: '10px 14px',
          fontFamily: "'Space Mono', monospace",
          fontSize: 12,
          color: '#fca5a5',
          letterSpacing: '0.05em',
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label className="label-mono">Email</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          className="input-dark"
          placeholder="you@example.com"
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label className="label-mono">Username</label>
        <input
          type="text"
          required
          minLength={3}
          maxLength={20}
          value={form.username}
          onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
          className="input-dark"
          placeholder="3-20 chars"
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label className="label-mono">Password</label>
        <input
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          className="input-dark"
          placeholder="Min 8 characters"
        />
        {form.password.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <div style={{
              flex: 1,
              height: 4,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 99,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${(strength / 4) * 100}%`,
                background: strengthColor,
                borderRadius: 99,
                transition: 'width 0.3s, background 0.3s',
              }} />
            </div>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              color: strengthColor,
              fontWeight: 700,
              letterSpacing: '0.1em',
              minWidth: 40,
            }}>
              {strengthLabel}
            </span>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary"
        style={{ opacity: loading ? 0.6 : 1, marginTop: 4 }}
      >
        {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
      </button>

      <p style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 11,
        color: 'var(--text-muted)',
        textAlign: 'center',
        letterSpacing: '0.1em',
      }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: '#4ade80', fontWeight: 700, textDecoration: 'none' }}>
          Sign in
        </Link>
      </p>
    </form>
  )
}
