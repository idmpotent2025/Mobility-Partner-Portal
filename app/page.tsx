'use client'

import AbcToggle from '@/components/AbcToggle'
import { useAuthVariant } from '@/lib/use-auth-variant'

export default function HomePage() {
  const { variant, setVariant } = useAuthVariant()

  return (
    <div className="min-h-screen bg-cat-black flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-xl w-full">
          <div className="inline-block bg-cat-yellow text-cat-black text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase mb-8">
            Mobility Portal
          </div>

          <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-4">
            One Account.
            <br />
            All Of <span className="text-cat-yellow">Mobility.</span>
          </h1>

          <p className="text-gray-400 text-lg">
            Your fleet. Financed, managed, and serviced — all in one place.
          </p>
        </div>
      </div>

      {/* Footer — discrete A/B/C variant selector */}
      <footer className="border-t border-cat-charcoal px-6 py-4">
        <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs tracking-wide">Auth variant</p>
          <AbcToggle variant={variant} onChange={setVariant} />
        </div>
      </footer>
    </div>
  )
}
