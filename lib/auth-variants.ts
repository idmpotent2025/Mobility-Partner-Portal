// Server-side only — imported by API route handlers, never by client components.
// Each instance uses its own CLIENT_ID/SECRET but shares AUTH0_SECRET so
// sessions are cross-compatible (same cookie encryption key).
import { initAuth0 } from '@auth0/nextjs-auth0'

function makeInstance(clientID: string, clientSecret: string) {
  return initAuth0({
    secret: process.env.AUTH0_SECRET!,
    baseURL: process.env.AUTH0_BASE_URL!,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL!,
    clientID,
    clientSecret,
  })
}

export const auth0A = makeInstance(
  process.env.AUTH0_CLIENT_ID_A!,
  process.env.AUTH0_CLIENT_SECRET_A!,
)

export const auth0B = makeInstance(
  process.env.AUTH0_CLIENT_ID_B!,
  process.env.AUTH0_CLIENT_SECRET_B!,
)

export const auth0C = makeInstance(
  process.env.AUTH0_CLIENT_ID_C!,
  process.env.AUTH0_CLIENT_SECRET_C!,
)
