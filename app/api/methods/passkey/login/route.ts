import { NextRequest, NextResponse } from 'next/server'

// GET — request a passkey authentication challenge from Auth0 (/passkey/challenge)
// No session required — this is the start of a fresh login flow.
export async function GET() {
  console.log('[passkey/login] GET - requesting authentication challenge')
  console.log('[passkey/login] ENV AUTH0_MANAGEMENT_DOMAIN:', process.env.AUTH0_MANAGEMENT_DOMAIN)
  console.log('[passkey/login] ENV AUTH0_CLIENT_ID_A (first 8):', process.env.AUTH0_CLIENT_ID_A?.slice(0, 8))

  const clientId = process.env.AUTH0_CLIENT_ID_A
  const clientSecret = process.env.AUTH0_CLIENT_SECRET_A
  const domain = process.env.AUTH0_MANAGEMENT_DOMAIN

  if (!clientId || !clientSecret || !domain) {
    console.error('[passkey/login] Missing AUTH0_CLIENT_ID_A, AUTH0_CLIENT_SECRET_A, or AUTH0_MANAGEMENT_DOMAIN')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const challengeBody = {
    client_id: clientId,
    client_secret: clientSecret,
    realm: 'Username-Password-Authentication',
  }
  console.log('[passkey/login] POST /passkey/challenge — client_id:', clientId)

  const res = await fetch(`https://${domain}/passkey/challenge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(challengeBody),
  })

  console.log('[passkey/login] Challenge response status:', res.status)
  const data = await res.json().catch(() => ({}))
  console.log('[passkey/login] Challenge data (truncated):', JSON.stringify(data).slice(0, 400))

  if (!res.ok) {
    console.error('[passkey/login] Failed to get challenge:', JSON.stringify(data))
    return NextResponse.json(
      { error: (data as { message?: string; error_description?: string }).error_description
          ?? (data as { message?: string }).message
          ?? 'Failed to get passkey challenge' },
      { status: res.status },
    )
  }

  const rpId = (data as { authn_params_public_key?: { rpId?: string } }).authn_params_public_key?.rpId
  console.log('[passkey/login] Challenge issued, auth_session present:', !!(data as { auth_session?: string }).auth_session)
  console.log('[passkey/login] Challenge rpId (must match app domain):', rpId ?? 'not present')
  return NextResponse.json(data)
}

// POST — submit the WebAuthn assertion to Auth0 and exchange for tokens (/oauth/token)
// No session required — this completes the fresh login flow.
export async function POST(req: NextRequest) {
  console.log('[passkey/login] POST - submitting passkey assertion for token exchange')
  console.log('[passkey/login] ENV AUTH0_MANAGEMENT_DOMAIN:', process.env.AUTH0_MANAGEMENT_DOMAIN)

  const clientId = process.env.AUTH0_CLIENT_ID_A
  const clientSecret = process.env.AUTH0_CLIENT_SECRET_A
  const domain = process.env.AUTH0_MANAGEMENT_DOMAIN

  if (!clientId || !clientSecret || !domain) {
    console.error('[passkey/login] Missing AUTH0_CLIENT_ID_A, AUTH0_CLIENT_SECRET_A, or AUTH0_MANAGEMENT_DOMAIN')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const body = await req.json().catch(() => ({})) as {
    auth_session?: string
    authn_response?: unknown
  }
  const { auth_session, authn_response } = body

  if (!auth_session || !authn_response) {
    console.warn('[passkey/login] Missing auth_session or authn_response')
    return NextResponse.json({ error: 'auth_session and authn_response are required' }, { status: 400 })
  }

  console.log('[passkey/login] auth_session length:', auth_session.length)
  console.log('[passkey/login] authn_response credential id (truncated):', String((authn_response as { id?: string })?.id ?? '').slice(0, 40))

  // /oauth/token accepts both form-encoded and JSON; use JSON for consistency
  const tokenBody = {
    grant_type: 'urn:okta:params:oauth:grant-type:webauthn',
    client_id: clientId,
    client_secret: clientSecret,
    realm: 'Username-Password-Authentication',
    auth_session,
    authn_response,
  }

  console.log('[passkey/login] POST /oauth/token with grant_type=webauthn')

  const res = await fetch(`https://${domain}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tokenBody),
  })

  console.log('[passkey/login] Token response status:', res.status)
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    console.error('[passkey/login] Token exchange failed:', JSON.stringify(data))
    return NextResponse.json(
      { error: (data as { error_description?: string; message?: string }).error_description
          ?? (data as { message?: string }).message
          ?? 'Passkey login failed' },
      { status: res.status },
    )
  }

  console.log('[passkey/login] Token exchange successful, token_type:', (data as { token_type?: string }).token_type)
  console.log('[passkey/login] access_token present:', !!(data as { access_token?: string }).access_token)
  console.log('[passkey/login] id_token present:', !!(data as { id_token?: string }).id_token)
  // Return tokens without client_secret — already server-side only, safe to forward
  return NextResponse.json(data)
}
