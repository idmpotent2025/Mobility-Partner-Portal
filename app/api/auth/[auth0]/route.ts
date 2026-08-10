export const runtime = 'nodejs'

import { handleAuth, handleLogin } from '@auth0/nextjs-auth0'

export const GET = handleAuth({
  login: async (req: Request, ctx: unknown) => {
    const returnTo = new URL(req.url).searchParams.get('returnTo') ?? '/dashboard'
    return handleLogin(req, ctx, {
      returnTo,
      authorizationParams: { scope: 'openid profile email' },
    })
  },
})
