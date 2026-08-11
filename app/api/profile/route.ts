import { auth0A } from '@/lib/auth-variants'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await auth0A.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    return NextResponse.json({
      accessToken: session.accessToken ?? null,
      idToken: session.idToken ?? null,
      refreshToken: session.refreshToken ?? null,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve tokens'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
