'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn('credentials', {
      email: form.email, password: form.password, redirect: false,
    })
    if (result?.error) { setError('Invalid email or password'); setLoading(false); return }
    router.push('/main')
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <p className="mono-label" style={{ color: 'var(--lime)', marginBottom: 8 }}>Welcome back</p>
        <h2 className="display" style={{ fontSize: 'clamp(32px,7vw,44px)', color: '#fff' }}>SIGN IN</h2>
      </div>

      {error && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--danger)' }}>{error}</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label className="mono-label" style={{ display: 'block', marginBottom: 7 }}>Email</label>
          <input
            type="email" required
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="pb-input"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="mono-label" style={{ display: 'block', marginBottom: 7 }}>Password</label>
          <input
            type="password" required
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            className="pb-input"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="pb-btn pb-btn-primary" style={{ width: '100%', opacity: loading ? 0.65 : 1 }}>
        {loading ? 'Signing in…' : 'Sign In →'}
      </button>

      <div className="pb-divider"><span /></div>

      <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--txt-3)' }}>
        New to the spot?{' '}
        <Link href="/register" style={{ color: 'var(--lime)', fontWeight: 700, textDecoration: 'none', fontSize: 11, letterSpacing: '0.05em' }}>
          Create account
        </Link>
      </p>
    </form>
  )
}
