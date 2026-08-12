'use client'

import { useState } from 'react'
import Link from 'next/link'

// ── WebAuthn helpers ──────────────────────────────────────────────────────────

function b64urlToBuffer(b64url: string): ArrayBuffer {
  const bin = atob(b64url.replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}

function bufferToB64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface LoginChallenge {
  auth_session: string
  authn_params_public_key: {
    rpId: string
    challenge: string
    allowCredentials?: Array<{ type: string; id: string; transports?: string[] }>
    userVerification?: string
    timeout?: number
  }
}

interface TokenResult {
  access_token?: string
  id_token?: string
  token_type?: string
  expires_in?: number
}

// ── Token display ─────────────────────────────────────────────────────────────

function TokenDisplay({ tokens }: { tokens: TokenResult }) {
  return (
    <div className="space-y-3 mt-4">
      {tokens.token_type && (
        <p className="text-xs text-gray-400">
          <span className="text-gray-300 font-medium">token_type:</span>{' '}
          <span className="font-mono">{tokens.token_type}</span>
          {tokens.expires_in && (
            <>
              <span className="mx-2 text-cat-steel">·</span>
              <span className="text-gray-300 font-medium">expires_in:</span>{' '}
              <span className="font-mono">{tokens.expires_in}s</span>
            </>
          )}
        </p>
      )}
      {tokens.access_token && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Access Token</p>
          <pre className="bg-cat-black border border-cat-steel rounded-lg p-3 text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap break-all">
            {tokens.access_token}
          </pre>
        </div>
      )}
      {tokens.id_token && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">ID Token</p>
          <pre className="bg-cat-black border border-cat-steel rounded-lg p-3 text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap break-all">
            {tokens.id_token}
          </pre>
        </div>
      )}
      <Link
        href="/dashboard"
        className="inline-block mt-2 bg-cat-yellow text-cat-black font-bold px-4 py-2 rounded text-sm hover:bg-yellow-400 transition-colors"
      >
        Go to Dashboard →
      </Link>
    </div>
  )
}

// ── Passkey Login ─────────────────────────────────────────────────────────────

function PasskeyLogin() {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [tokens, setTokens] = useState<TokenResult | null>(null)
  const [error, setError] = useState('')

  async function handleLogin() {
    setState('loading')
    setError('')
    setTokens(null)

    try {
      // Step 1 — get challenge
      const challengeRes = await fetch('/api/methods/passkey/login')
      const challengeData = await challengeRes.json()
      if (!challengeRes.ok) {
        setError((challengeData as { error?: string }).error ?? 'Failed to get passkey challenge.')
        setState('error')
        return
      }
      const { auth_session, authn_params_public_key } = challengeData as LoginChallenge

      // Step 2 — build assertion options
      const pk = authn_params_public_key
      const assertionOptions: PublicKeyCredentialRequestOptions = {
        rpId: pk.rpId,
        challenge: b64urlToBuffer(pk.challenge),
        allowCredentials: pk.allowCredentials?.map((c) => ({
          type: c.type as PublicKeyCredentialType,
          id: b64urlToBuffer(c.id),
          transports: c.transports as AuthenticatorTransport[],
        })),
        userVerification: (pk.userVerification ?? 'required') as UserVerificationRequirement,
        timeout: pk.timeout,
      }

      // Step 3 — browser WebAuthn assertion
      const credential = (await navigator.credentials.get({
        publicKey: assertionOptions,
      })) as PublicKeyCredential | null
      if (!credential) {
        setError('Passkey authentication was cancelled or failed.')
        setState('error')
        return
      }

      const assertionResponse = credential.response as AuthenticatorAssertionResponse
      const authn_response = {
        id: credential.id,
        rawId: bufferToB64url(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: bufferToB64url(assertionResponse.clientDataJSON),
          authenticatorData: bufferToB64url(assertionResponse.authenticatorData),
          signature: bufferToB64url(assertionResponse.signature),
          userHandle: assertionResponse.userHandle
            ? bufferToB64url(assertionResponse.userHandle)
            : null,
        },
      }

      // Step 4 — exchange assertion for tokens
      const tokenRes = await fetch('/api/methods/passkey/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth_session, authn_response }),
      })
      const tokenData = await tokenRes.json()
      if (!tokenRes.ok) {
        setError((tokenData as { error?: string }).error ?? 'Passkey authentication failed.')
        setState('error')
        return
      }

      setTokens(tokenData as TokenResult)
      setState('success')
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError('Passkey authentication was cancelled.')
        } else {
          setError(`WebAuthn error: ${err.message}`)
        }
      } else {
        setError('Unexpected error during passkey login.')
      }
      setState('error')
    }
  }

  return (
    <div className="bg-cat-charcoal border border-cat-steel rounded-xl p-6 flex flex-col">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🔑</span>
          <h2 className="text-white font-bold text-lg">Passkey</h2>
        </div>
        <p className="text-gray-400 text-sm">
          Authenticate with a biometric or hardware-backed passkey registered to your account.
        </p>
      </div>

      {/* Flow steps */}
      <div className="bg-cat-black border border-cat-steel rounded-lg p-3 mb-5 space-y-1 text-xs text-gray-500">
        <p>
          <span className="text-gray-300 font-semibold">Step 1</span> — GET challenge from{' '}
          <code className="font-mono bg-cat-charcoal px-1 rounded">/api/methods/passkey/login</code>
        </p>
        <p>
          <span className="text-gray-300 font-semibold">Step 2</span> — Browser runs{' '}
          <code className="font-mono bg-cat-charcoal px-1 rounded">navigator.credentials.get()</code>
        </p>
        <p>
          <span className="text-gray-300 font-semibold">Step 3</span> — POST assertion → Auth0 returns tokens
        </p>
      </div>

      {state === 'idle' || state === 'loading' ? (
        <button
          onClick={handleLogin}
          disabled={state === 'loading'}
          className="w-full bg-cat-yellow text-cat-black font-bold px-4 py-3 rounded text-sm hover:bg-yellow-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {state === 'loading' ? 'Authenticating…' : 'Login with Passkey'}
        </button>
      ) : state === 'error' ? (
        <div>
          <div className="bg-red-950 border border-red-800 rounded-lg p-3 text-red-300 text-sm mb-4">
            {error}
          </div>
          <button
            onClick={() => setState('idle')}
            className="w-full border border-cat-steel text-gray-300 hover:text-cat-yellow hover:border-cat-yellow px-4 py-2 rounded text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 text-green-400 text-sm font-semibold mb-2">
            <span>✓</span> Passkey authentication successful
          </div>
          {tokens && <TokenDisplay tokens={tokens} />}
        </div>
      )}
    </div>
  )
}

// ── SMS OTP Login ─────────────────────────────────────────────────────────────

type SmsPhase = 'phone' | 'sending' | 'otp' | 'verifying' | 'success' | 'error'

function SmsLogin() {
  const [phase, setPhase] = useState<SmsPhase>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [tokens, setTokens] = useState<TokenResult | null>(null)
  const [error, setError] = useState('')

  async function sendCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setPhase('sending')

    const res = await fetch('/api/sms/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: phone }),
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      setError((data as { error?: string }).error ?? 'Failed to send SMS code.')
      setPhase('error')
      return
    }
    setPhase('otp')
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setPhase('verifying')

    const res = await fetch('/api/sms/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: phone, otp }),
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      setError((data as { error?: string }).error ?? 'OTP verification failed.')
      setPhase('error')
      return
    }
    setTokens(data as TokenResult)
    setPhase('success')
  }

  function reset() {
    setPhase('phone')
    setPhone('')
    setOtp('')
    setTokens(null)
    setError('')
  }

  return (
    <div className="bg-cat-charcoal border border-cat-steel rounded-xl p-6 flex flex-col">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">📱</span>
          <h2 className="text-white font-bold text-lg">SMS OTP</h2>
        </div>
        <p className="text-gray-400 text-sm">
          Receive a one-time passcode via SMS using Auth0 Passwordless.
        </p>
      </div>

      {/* Flow steps */}
      <div className="bg-cat-black border border-cat-steel rounded-lg p-3 mb-5 space-y-1 text-xs text-gray-500">
        <p>
          <span className="text-gray-300 font-semibold">Step 1</span> — POST phone number to{' '}
          <code className="font-mono bg-cat-charcoal px-1 rounded">/api/sms/start</code>
        </p>
        <p>
          <span className="text-gray-300 font-semibold">Step 2</span> — Auth0 sends a 6-digit OTP via SMS
        </p>
        <p>
          <span className="text-gray-300 font-semibold">Step 3</span> — POST OTP to{' '}
          <code className="font-mono bg-cat-charcoal px-1 rounded">/api/sms/verify</code> → tokens
        </p>
      </div>

      {(phase === 'phone' || phase === 'sending') && (
        <form onSubmit={sendCode} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+15551234567"
              className="w-full bg-cat-black border border-cat-steel rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cat-yellow"
            />
            <p className="text-xs text-gray-600 mt-1">E.164 format: +[country code][number]</p>
          </div>
          <button
            type="submit"
            disabled={phase === 'sending'}
            className="w-full bg-cat-yellow text-cat-black font-bold px-4 py-3 rounded text-sm hover:bg-yellow-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {phase === 'sending' ? 'Sending code…' : 'Send SMS Code'}
          </button>
        </form>
      )}

      {(phase === 'otp' || phase === 'verifying') && (
        <form onSubmit={verifyCode} className="flex flex-col gap-3">
          <p className="text-xs text-gray-400">
            Code sent to <span className="text-cat-yellow font-mono">{phone}</span>.
          </p>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              One-Time Passcode
            </label>
            <input
              type="text"
              required
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="w-full bg-cat-black border border-cat-steel rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cat-yellow tracking-widest text-center font-mono text-lg"
            />
          </div>
          <button
            type="submit"
            disabled={phase === 'verifying'}
            className="w-full bg-cat-yellow text-cat-black font-bold px-4 py-3 rounded text-sm hover:bg-yellow-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {phase === 'verifying' ? 'Verifying…' : 'Verify Code'}
          </button>
          <button
            type="button"
            onClick={reset}
            className="w-full border border-cat-steel text-gray-400 hover:text-gray-200 px-4 py-2 rounded text-sm transition-colors"
          >
            Use a different number
          </button>
        </form>
      )}

      {phase === 'error' && (
        <div>
          <div className="bg-red-950 border border-red-800 rounded-lg p-3 text-red-300 text-sm mb-4">
            {error}
          </div>
          <button
            onClick={reset}
            className="w-full border border-cat-steel text-gray-300 hover:text-cat-yellow hover:border-cat-yellow px-4 py-2 rounded text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {phase === 'success' && (
        <div>
          <div className="flex items-center gap-2 text-green-400 text-sm font-semibold mb-2">
            <span>✓</span> SMS OTP login successful
          </div>
          {tokens && <TokenDisplay tokens={tokens} />}
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NativeLoginPage() {
  return (
    <div className="min-h-screen bg-cat-black flex flex-col px-4 py-10">
      <div className="w-full max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-gray-500 hover:text-cat-yellow text-sm mb-8 transition-colors"
        >
          ← Back
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-block bg-cat-yellow text-cat-black text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase mb-4">
            Variant D
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Native Login</h1>
          <p className="text-gray-400 text-sm">
            Authenticate directly via Auth0 WebAuthn and Passwordless APIs — no Universal Login redirect.
          </p>
        </div>

        {/* Two login panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PasskeyLogin />
          <SmsLogin />
        </div>
      </div>
    </div>
  )
}
