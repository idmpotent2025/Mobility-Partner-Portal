import { auth0A } from '@/lib/auth-variants'
import { NextRequest, NextResponse } from 'next/server'

// AUTH0_MANAGEMENT_DOMAIN must match AUTH0_ISSUER_BASE_URL — use the same domain
// (custom or native) consistently across issuer, audience, and API calls.
const apiBase = () =>
  `https://${process.env.AUTH0_MANAGEMENT_DOMAIN}/me/v1`

function jwtAud(token: string): string {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
    return Array.isArray(payload.aud) ? payload.aud.join(', ') : String(payload.aud ?? 'none')
  } catch {
    return 'decode-error'
  }
}

export async function POST(req: NextRequest) {
  console.log('[passkey/verify] POST - verifying passkey attestation (enrollment)')
  console.log('[passkey/verify] ENV AUTH0_MANAGEMENT_DOMAIN:', process.env.AUTH0_MANAGEMENT_DOMAIN)

  const session = await auth0A.getSession()
  if (!session?.accessToken) {
    console.warn('[passkey/verify] No access token in session — unauthenticated')
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  console.log('[passkey/verify] Session found, user sub:', session.user?.sub)
  console.log('[passkey/verify] Access token aud:', jwtAud(session.accessToken))

  const body = await req.json()
  const { auth_session, authn_response } = body as {
    auth_session?: string
    authn_response?: unknown
  }

  if (!auth_session || !authn_response) {
    console.warn('[passkey/verify] Missing auth_session or authn_response in request body')
    return NextResponse.json({ error: 'auth_session and authn_response are required' }, { status: 400 })
  }

  console.log('[passkey/verify] auth_session length:', auth_session.length)
  console.log('[passkey/verify] authn_response type:', (authn_response as { type?: string })?.type)
  console.log('[passkey/verify] authn_response id (truncated):', String((authn_response as { id?: string })?.id ?? '').slice(0, 40))

  // The literal path segment "passkey|new" is what Auth0 expects
  const url = `${apiBase()}/authentication-methods/passkey%7Cnew/verify`
  console.log('[passkey/verify] POST', url)
  console.log('[passkey/verify] Using My Account domain:', process.env.AUTH0_MANAGEMENT_DOMAIN)

  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ auth_session, authn_response }),
    })
  } catch (fetchErr) {
    const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr)
    console.error('[passkey/verify] Network error reaching My Account API:', msg,
      '— check that AUTH0_MANAGEMENT_DOMAIN is the native Auth0 tenant domain, not a custom domain.')
    return NextResponse.json(
      { error: `Network error contacting Auth0 My Account API: ${msg}` },
      { status: 502 },
    )
  }

  console.log('[passkey/verify] Auth0 response status:', res.status)

  if (res.status === 201 || res.status === 200) {
    const data = await res.json().catch(() => ({}))
    console.log('[passkey/verify] Attestation verified successfully, method id:', (data as { id?: string }).id)
    return NextResponse.json(data, { status: 201 })
  }

  const data = await res.json().catch(() => ({}))
  console.error('[passkey/verify] Verification failed:', JSON.stringify(data))
  return NextResponse.json(
    { error: (data as { message?: string }).message ?? 'Verification failed' },
    { status: res.status },
  )
}
