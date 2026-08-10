export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { auth0B } from '@/lib/auth-variants'

type AppRouteCtx = { params: Record<string, string | string[]> }

export const GET = auth0B.handleAuth({
  login: async (req: NextRequest, ctx: AppRouteCtx) => {
    const returnTo = req.nextUrl.searchParams.get('returnTo') ?? '/dashboard'
    return auth0B.handleLogin(req, ctx, {
      returnTo,
      authorizationParams: { scope: 'openid profile email' },
    })
  },
})
