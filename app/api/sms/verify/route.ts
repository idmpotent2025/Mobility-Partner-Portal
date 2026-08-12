import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { phone_number, otp } = await req.json()

  if (!phone_number || !otp) {
    return NextResponse.json({ error: 'phone_number and otp are required' }, { status: 400 })
  }

  const clientId = process.env.AUTH0_CLIENT_ID_A
  const clientSecret = process.env.AUTH0_CLIENT_SECRET_A
  const domain = process.env.AUTH0_MANAGEMENT_DOMAIN

  if (!clientId || !clientSecret || !domain) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const res = await fetch(`https://${domain}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp',
      client_id: clientId,
      client_secret: clientSecret,
      connection: 'sms',
      username: phone_number,
      otp,
      scope: 'openid profile email',
    }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const msg =
      (data as { error_description?: string }).error_description ??
      (data as { message?: string }).message ??
      'OTP verification failed'
    return NextResponse.json({ error: msg }, { status: res.status })
  }

  return NextResponse.json(data)
}
