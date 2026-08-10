export const runtime = 'nodejs'

import { handleAuth, handleLogin } from '@auth0/nextjs-auth0'
import { NextRequest } from 'next/server'

type AppRouteCtx = { params: Record<string, string | string[]> }

export const GET = handleAuth({
  login: async (req: NextRequest, ctx: AppRouteCtx) => {
    const returnTo = req.nextUrl.searchParams.get('returnTo') ?? '/dashboard'
    return handleLogin(req, ctx, {
      returnTo,
      authorizationParams: { scope: 'openid profile email' },
    })
  },
})
