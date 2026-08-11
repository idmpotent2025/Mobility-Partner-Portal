// Required .env.local variables:
//   AUTH0_MANAGEMENT_DOMAIN      — native Auth0 tenant domain (e.g. dev-xxx.us.auth0.com)
//   AUTH0_MANAGEMENT_CLIENT_ID   — client_id of an M2M app registered in your Auth0 tenant
//   AUTH0_MANAGEMENT_CLIENT_SECRET — client_secret of that M2M app
//
// The M2M app must be authorized to call the Management API with scope: create:connections

import { NextRequest, NextResponse } from 'next/server'

type TokenResponse = { access_token: string }
type ErrorResponse = { message?: string; error_description?: string }

async function getMgmtToken(): Promise<string> {
  const res = await fetch(`https://${process.env.AUTH0_MANAGEMENT_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
      client_secret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_MANAGEMENT_DOMAIN}/api/v2/`,
    }),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as ErrorResponse
    throw new Error(err.error_description ?? 'Failed to obtain management API token')
  }
  const { access_token } = (await res.json()) as TokenResponse
  return access_token
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const token = await getMgmtToken()

    const mgmtRes = await fetch(`https://${process.env.AUTH0_MANAGEMENT_DOMAIN}/api/v2/connections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    const data = (await mgmtRes.json()) as ErrorResponse & { id?: string; name?: string }

    if (!mgmtRes.ok) {
      return NextResponse.json(
        { error: data.message ?? data.error_description ?? 'Failed to create connection' },
        { status: mgmtRes.status }
      )
    }

    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
