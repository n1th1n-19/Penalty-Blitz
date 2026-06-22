'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'

function MeWeCallback() {
  const searchParams = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    const loginRequestToken = searchParams.get('loginRequestToken')
    const state = searchParams.get('state')

    if (!loginRequestToken) {
      setError('Missing token from MeWe. Try logging in again.')
      return
    }

    signIn('credentials', { loginRequestToken, state: state ?? '', redirect: false })
      .then(result => {
        if (result?.error) {
          setError('MeWe login failed. Please try again.')
        } else {
          window.location.replace('/main')
        }
      })
  }, [searchParams])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, textAlign: 'center' }}>
      <div>
        <p className="mono-label" style={{ color: 'var(--lime)', marginBottom: 8 }}>MeWe</p>
        <h2 className="display" style={{ fontSize: 'clamp(28px,6vw,40px)', color: '#fff' }}>
          {error ? 'LOGIN FAILED' : 'SIGNING IN…'}
        </h2>
      </div>

      {error ? (
        <>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--danger)' }}>{error}</p>
          <a href="/" className="pb-btn pb-btn-primary" style={{ textAlign: 'center' }}>
            Back to Home →
          </a>
        </>
      ) : (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--txt-3)' }}>
          Completing sign-in with MeWe…
        </p>
      )}
    </div>
  )
}

export default function MeWeCallbackPage() {
  return (
    <Suspense>
      <MeWeCallback />
    </Suspense>
  )
}
