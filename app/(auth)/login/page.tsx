'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    if (result?.error) { setError('Invalid email or password'); setLoading(false); return }
    router.push('/main')
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Heading */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: '#fff', letterSpacing: '0.05em', marginBottom: 4 }}>
          Welcome back
        </h1>
        <p className="label-mono">Sign in to your account</p>
      </div>

      {/* Error */}
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
        <input
          type="email" required
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          className="input-dark"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="label-mono">Password</label>
          <button type="button" className="btn-text" style={{ fontSize: 9 }}>Forgot?</button>
        </div>
        <input
          type="password" required
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          className="input-dark"
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 4, opacity: loading ? 0.65 : 1 }}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <div className="section-divider">
        <div className="section-divider-dot" />
      </div>

      <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
        No account?{' '}
        <Link href="/register" style={{ color: 'var(--green-accent)', fontWeight: 700, textDecoration: 'none' }}>
          Register
        </Link>
      </p>
    </form>
  )
}
