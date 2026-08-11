export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { auth0A } from '@/lib/auth-variants'

type AppRouteCtx = { params: Record<string, string | string[]> }

export const GET = auth0A.handleAuth({
  login: async (req: NextRequest, ctx: AppRouteCtx) => {
    const url = req.nextUrl
    const returnTo = url.searchParams.get('returnTo') ?? '/dashboard'
    const screenHint = url.searchParams.get('screen_hint') ?? undefined
    return auth0A.handleLogin(req, ctx, {
      returnTo,
      authorizationParams: {
        scope: 'openid profile email',
        ...(screenHint && { screen_hint: screenHint }),
      },
    })
  },
})
