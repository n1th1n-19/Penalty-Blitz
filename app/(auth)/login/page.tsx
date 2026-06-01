'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

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
        SIGN IN
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
        <label className="label-mono">Password</label>
        <input
          type="password"
          required
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          className="input-dark"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary"
        style={{ opacity: loading ? 0.6 : 1, marginTop: 4 }}
      >
        {loading ? 'SIGNING IN...' : 'SIGN IN'}
      </button>

      <p style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 11,
        color: 'var(--text-muted)',
        textAlign: 'center',
        letterSpacing: '0.1em',
      }}>
        No account?{' '}
        <Link href="/register" style={{ color: '#4ade80', fontWeight: 700, textDecoration: 'none' }}>
          Create one
        </Link>
      </p>
    </form>
  )
}
