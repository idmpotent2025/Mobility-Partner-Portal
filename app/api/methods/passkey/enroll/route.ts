import { auth0A } from '@/lib/auth-variants'
import { NextRequest, NextResponse } from 'next/server'

// AUTH0_MANAGEMENT_DOMAIN must match AUTH0_ISSUER_BASE_URL — use the same domain
// (custom or native) consistently across issuer, audience, and API calls.
const apiBase = () =>
  `https://${process.env.AUTH0_MANAGEMENT_DOMAIN}/me/v1`

// Sub prefixes that indicate a social or enterprise identity.
// Passkey enrollment via My Account API requires a database connection (sub: auth0|...).
const SOCIAL_PREFIXES = ['google-oauth2', 'windowslive', 'facebook', 'twitter', 'github',
  'linkedin', 'apple', 'yahoo', 'line', 'salesforce', 'samlp', 'oidc', 'waad', 'adfs']

function jwtAud(token: string): string {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
    return Array.isArray(payload.aud) ? payload.aud.join(', ') : String(payload.aud ?? 'none')
  } catch {
    return 'decode-error'
  }
}

export async function POST(req: NextRequest) {
  console.log('[passkey/enroll] POST - starting passkey enrollment')
  console.log('[passkey/enroll] ENV AUTH0_MANAGEMENT_DOMAIN:', process.env.AUTH0_MANAGEMENT_DOMAIN)
  console.log('[passkey/enroll] ENV A0_MYACCOUNT_API_AUDIENCE:', process.env.A0_MYACCOUNT_API_AUDIENCE)

  const session = await auth0A.getSession()
  if (!session?.accessToken) {
    console.warn('[passkey/enroll] No access token in session — unauthenticated')
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  console.log('[passkey/enroll] Access token aud:', jwtAud(session.accessToken))

  const sub: string = session.user?.sub ?? ''
  const subPrefix = sub.split('|')[0]
  console.log('[passkey/enroll] Session found, user sub prefix:', subPrefix)

  // Detect social / enterprise users — they cannot enroll a passkey directly
  // against a database connection via the My Account API unless their identity
  // is linked to a database connection first.
  if (SOCIAL_PREFIXES.includes(subPrefix)) {
    console.warn('[passkey/enroll] Rejected: social/enterprise user cannot enroll passkey without a linked database identity. sub prefix:', subPrefix)
    return NextResponse.json(
      {
        error: `Passkey enrollment requires a database connection account. ` +
          `This account uses "${subPrefix}" (social / enterprise login). ` +
          `Link a database identity to your account in Auth0 first.`,
      },
      { status: 422 },
    )
  }

  const { connection } = (await req.json().catch(() => ({}))) as { connection?: string }
  const resolvedConnection = connection ?? 'Username-Password-Authentication'
  console.log('[passkey/enroll] Requesting enrollment for connection:', resolvedConnection)

  const myAccountDomain = process.env.AUTH0_MANAGEMENT_DOMAIN
  console.log('[passkey/enroll] Using My Account domain:', myAccountDomain)

  const url = `${apiBase()}/authentication-methods`
  console.log('[passkey/enroll] POST', url)

  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'passkey',
        connection: resolvedConnection,
      }),
    })
  } catch (fetchErr) {
    const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr)
    console.error('[passkey/enroll] Network error reaching My Account API:', msg,
      '— check that AUTH0_MANAGEMENT_DOMAIN is the native Auth0 tenant domain, not a custom domain.')
    return NextResponse.json(
      { error: `Network error contacting Auth0 My Account API: ${msg}` },
      { status: 502 },
    )
  }

  console.log('[passkey/enroll] Auth0 response status:', res.status)
  const data = await res.json().catch(() => ({}))
  console.log('[passkey/enroll] Auth0 response body (truncated):', JSON.stringify(data).slice(0, 400))

  if (!res.ok) {
    console.error('[passkey/enroll] Enrollment start failed:', (data as { message?: string }).message)
    return NextResponse.json(
      { error: (data as { message?: string }).message ?? 'Failed to start enrollment' },
      { status: res.status },
    )
  }

  console.log('[passkey/enroll] Enrollment started successfully, auth_session present:', !!(data as { auth_session?: string }).auth_session)
  return NextResponse.json(data)
}
