'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm]       = useState({ email: '', username: '', password: '' })
  const [error, setError]     = useState('')
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
    if (!res.ok) {
      const d = await res.json()
      setError(d.error)
      setLoading(false)
      return
    }
    const result = await signIn('credentials', {
      email: form.email, password: form.password, redirect: false,
    })
    if (result?.error) {
      setError('Account created but sign-in failed. Please log in.')
      setLoading(false)
      return
    }
    router.push('/main')
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <p className="mono-label" style={{ color: 'var(--lime)', marginBottom: 8 }}>Join the league</p>
        <h2 className="display" style={{ fontSize: 'clamp(32px,7vw,44px)', color: '#fff' }}>CREATE ACCOUNT</h2>
      </div>

      {error && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--danger)' }}>{error}</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label className="mono-label" style={{ display: 'block', marginBottom: 7 }}>Email</label>
          <input type="email" required value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="pb-input" placeholder="you@example.com" autoComplete="email" />
        </div>
        <div>
          <label className="mono-label" style={{ display: 'block', marginBottom: 7 }}>Username</label>
          <input type="text" required minLength={3} maxLength={20} value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            className="pb-input" placeholder="your_handle" autoComplete="username" />
        </div>
        <div>
          <label className="mono-label" style={{ display: 'block', marginBottom: 7 }}>Password</label>
          <input type="password" required minLength={8} value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            className="pb-input" placeholder="Min 8 characters" autoComplete="new-password" />
        </div>
      </div>

      <button type="submit" disabled={loading} className="pb-btn pb-btn-primary" style={{ width: '100%', opacity: loading ? 0.65 : 1 }}>
        {loading ? 'Creating account…' : 'Create & Play →'}
      </button>

      <div className="pb-divider"><span /></div>

      <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--txt-3)' }}>
        Already drafted?{' '}
        <Link href="/login" style={{ color: 'var(--lime)', fontWeight: 700, textDecoration: 'none', fontSize: 11, letterSpacing: '0.05em' }}>
          Sign in
        </Link>
      </p>
    </form>
  )
}
