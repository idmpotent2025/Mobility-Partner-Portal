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

export async function GET() {
  console.log('[methods] GET - listing authentication methods')
  console.log('[methods] AUTH0_MANAGEMENT_DOMAIN:', process.env.AUTH0_MANAGEMENT_DOMAIN)

  const session = await auth0A.getSession()
  if (!session?.accessToken) {
    console.warn('[methods] GET - no access token in session, unauthenticated')
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  console.log('[methods] GET - user sub:', session.user?.sub)
  console.log('[methods] GET - access token aud:', jwtAud(session.accessToken))

  const url = `${apiBase()}/authentication-methods`
  console.log('[methods] GET', url)

  let res: Response
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
  } catch (fetchErr) {
    const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr)
    console.error('[methods] GET network error:', msg, '— check AUTH0_MANAGEMENT_DOMAIN is native *.auth0.com domain')
    return NextResponse.json({ error: `Network error: ${msg}` }, { status: 502 })
  }

  console.log('[methods] GET - Auth0 response status:', res.status)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('[methods] GET - failed to list methods:', JSON.stringify(data))
    return NextResponse.json(
      { error: (data as { message?: string }).message ?? 'Failed to list methods' },
      { status: res.status },
    )
  }

  console.log('[methods] GET - raw response body:', JSON.stringify(data).slice(0, 500))

  // Log top-level keys to diagnose Auth0 response shape
  const rawData = data as Record<string, unknown>
  console.log('[methods] GET - response top-level keys:', Object.keys(rawData).join(', '))

  // Normalize to a stable { methods: [...] } shape regardless of Auth0 API response format
  const list: unknown[] =
    Array.isArray(data) ? data
    : Array.isArray(rawData.authenticators) ? (rawData.authenticators as unknown[])
    : Array.isArray(rawData.data) ? (rawData.data as unknown[])
    : []

  console.log('[methods] GET - success, method count:', list.length)
  return NextResponse.json({ methods: list })
}

export async function DELETE(req: NextRequest) {
  console.log('[methods] DELETE - removing authentication method')
  console.log('[methods] AUTH0_MANAGEMENT_DOMAIN:', process.env.AUTH0_MANAGEMENT_DOMAIN)

  const session = await auth0A.getSession()
  if (!session?.accessToken) {
    console.warn('[methods] DELETE - no access token in session, unauthenticated')
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  console.log('[methods] DELETE - user sub:', session.user?.sub)

  const { id } = (await req.json()) as { id?: string }
  if (!id) {
    console.warn('[methods] DELETE - missing id in request body')
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const url = `${apiBase()}/authentication-methods/${encodeURIComponent(id)}`
  console.log('[methods] DELETE', url)

  let res: Response
  try {
    res = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
  } catch (fetchErr) {
    const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr)
    console.error('[methods] DELETE network error:', msg, '— check AUTH0_MANAGEMENT_DOMAIN is native *.auth0.com domain')
    return NextResponse.json({ error: `Network error: ${msg}` }, { status: 502 })
  }

  console.log('[methods] DELETE - Auth0 response status:', res.status)

  if (res.status === 204) {
    console.log('[methods] DELETE - method removed successfully, id:', id)
    return new NextResponse(null, { status: 204 })
  }

  const data = await res.json().catch(() => ({}))
  console.error('[methods] DELETE - failed to remove method:', JSON.stringify(data))
  return NextResponse.json(
    { error: (data as { message?: string }).message ?? 'Failed to delete method' },
    { status: res.status },
  )
}
