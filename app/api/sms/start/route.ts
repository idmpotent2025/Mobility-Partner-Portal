import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { phone_number } = await req.json()

  if (!phone_number) {
    return NextResponse.json({ error: 'phone_number is required' }, { status: 400 })
  }

  const clientId = process.env.AUTH0_CLIENT_ID_A
  const clientSecret = process.env.AUTH0_CLIENT_SECRET_A
  const domain = process.env.AUTH0_MANAGEMENT_DOMAIN

  if (!clientId || !clientSecret || !domain) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const res = await fetch(`https://${domain}/passwordless/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      connection: 'sms',
      phone_number,
      send: 'code',
    }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const msg =
      (data as { error_description?: string }).error_description ??
      (data as { message?: string }).message ??
      'Failed to send SMS code'
    return NextResponse.json({ error: msg }, { status: res.status })
  }

  return NextResponse.json({ ok: true })
}
