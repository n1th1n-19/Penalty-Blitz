'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

function StrengthBar({ password }: { password: string }) {
  const score = (() => {
    if (!password) return 0
    let s = 0
    if (password.length >= 8)          s++
    if (/[A-Z]/.test(password))        s++
    if (/[0-9]/.test(password))        s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    return s
  })()

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', '#ef4444', '#f59e0b', '#60a5fa', '#22c55e']

  if (!password) return null
  return (
    <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1,
            height: 3,
            borderRadius: 99,
            background: i <= score ? colors[score] : 'rgba(255,255,255,0.08)',
            transition: 'background 0.25s',
          }} />
        ))}
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: colors[score], fontWeight: 700, letterSpacing: '0.15em' }}>
        {labels[score]}
      </span>
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm]     = useState({ email: '', username: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) { const d = await res.json(); setError(d.error); setLoading(false); return }
    await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    router.push('/main')
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: '#fff', letterSpacing: '0.05em', marginBottom: 4 }}>
          Create account
        </h1>
        <p className="label-mono">Join thousands of players</p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderLeft: '3px solid #ef4444',
          borderRadius: 8,
          padding: '10px 14px',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: '#fca5a5',
          letterSpacing: '0.04em',
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label className="label-mono">Email</label>
        <input type="email" required value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          className="input-dark" placeholder="you@example.com" autoComplete="email" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label className="label-mono">Username</label>
        <input type="text" required minLength={3} maxLength={20} value={form.username}
          onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
          className="input-dark" placeholder="3–20 characters" autoComplete="username" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label className="label-mono">Password</label>
        <input type="password" required minLength={8} value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          className="input-dark" placeholder="Min 8 characters" autoComplete="new-password" />
        <StrengthBar password={form.password} />
      </div>

      <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 4, opacity: loading ? 0.65 : 1 }}>
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      <div className="section-divider"><div className="section-divider-dot" /></div>

      <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--green-accent)', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
      </p>
    </form>
  )
}
