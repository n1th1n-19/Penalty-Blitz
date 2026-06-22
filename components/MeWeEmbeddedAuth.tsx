'use client'
import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'

export default function MeWeEmbeddedAuth() {
  const [status, setStatus] = useState<'handshaking' | 'signing-in' | 'error'>('handshaking')
  const [error, setError] = useState('')

  useEffect(() => {
    let nonceState: string

    async function start() {
      // 1. Get server-issued nonce — sets HttpOnly cookie server-side
      const res = await fetch('/api/auth/mewe/nonce')
      if (!res.ok) { setError('Failed to initialise. Please reload.'); setStatus('error'); return }
      const { state } = await res.json()
      nonceState = state

      // 2. Listen for MeWe host response
      function onMessage(event: MessageEvent) {
        if (event.origin !== 'https://mewe.com') return
        const { type, loginRequestToken } = event.data ?? {}
        if (type !== 'HOST_HANDSHAKE_RESPONSE' || !loginRequestToken) return

        window.removeEventListener('message', onMessage)
        setStatus('signing-in')

        signIn('credentials', { loginRequestToken, state: nonceState, redirect: false })
          .then(result => {
            if (result?.error) {
              setStatus('error')
              setError('Sign-in failed. Please reload and try again.')
            } else {
              window.location.replace('/main')
            }
          })
      }

      window.addEventListener('message', onMessage)

      // 3. Initiate handshake
      window.parent.postMessage({ type: 'CLIENT_HANDSHAKE_REQUEST' }, 'https://mewe.com')
    }

    start()
  }, [])

  if (status === 'error') {
    return (
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--danger)', textAlign: 'center' }}>
        {error}
      </p>
    )
  }

  return (
    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--txt-3)', textAlign: 'center' }}>
      {status === 'handshaking' ? 'Connecting to MeWe…' : 'Signing in…'}
    </p>
  )
}
