'use client'

import AbcToggle from '@/components/AbcToggle'
import { useAuthVariant, getLoginUrl } from '@/lib/use-auth-variant'

export default function HomePage() {
  const { variant, setVariant } = useAuthVariant()
  const loginUrl = getLoginUrl(variant, '/dashboard')
  const signUpUrl = `${loginUrl}&screen_hint=signup`

  return (
    <div className="min-h-screen bg-cat-black flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-xl w-full">
        <div className="inline-block bg-cat-yellow text-cat-black text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase mb-8">
          Partner Portal
        </div>

        <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-4">
          One Account.
          <br />
          All Of <span className="text-cat-yellow">Mobility.</span>
        </h1>

        <p className="text-gray-400 text-lg mb-10">
          Your fleet. Financed, managed, and serviced — all in one place.
        </p>

        {/* A/B/C variant toggle */}
        <div className="flex justify-center mb-8">
          <AbcToggle variant={variant} onChange={setVariant} />
        </div>

        {/* Sign In / Sign Up */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={loginUrl}
            className="bg-cat-yellow text-cat-black font-bold px-10 py-4 rounded-lg text-lg hover:bg-yellow-400 transition-colors duration-200"
          >
            Sign In
          </a>
          <a
            href={signUpUrl}
            className="border-2 border-cat-yellow text-cat-yellow font-bold px-10 py-4 rounded-lg text-lg hover:bg-cat-yellow hover:text-cat-black transition-colors duration-200"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  )
}
