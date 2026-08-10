'use client'

import type { Variant } from '@/lib/use-auth-variant'

const VARIANTS: { id: Variant; label: string; description: string }[] = [
  { id: 'a', label: 'A', description: 'Auth App 1 — CLIENT_ID_A' },
  { id: 'b', label: 'B', description: 'Auth App 2 — CLIENT_ID_B' },
  { id: 'c', label: 'C', description: 'Auth App 3 — CLIENT_ID_C' },
]

interface Props {
  variant: Variant
  onChange: (v: Variant) => void
}

export default function AbcToggle({ variant, onChange }: Props) {
  const active = VARIANTS.find((v) => v.id === variant)!

  return (
    <div className="bg-cat-charcoal border border-cat-steel rounded-xl px-6 py-4 inline-flex flex-col items-center gap-3">
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">
        🔬 A / B / C Login Test Variant
      </p>

      {/* Pill toggle */}
      <div className="flex gap-2">
        {VARIANTS.map((v) => (
          <button
            key={v.id}
            onClick={() => onChange(v.id)}
            className={`w-12 h-10 rounded-full font-black text-base transition-all duration-150 ${
              variant === v.id
                ? 'bg-cat-yellow text-cat-black shadow-lg scale-105'
                : 'bg-transparent text-gray-400 border border-cat-steel hover:border-cat-yellow hover:text-white'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Active variant description */}
      <p className="text-cat-yellow text-xs font-medium">
        Variant {active.label} &mdash; {active.description}
      </p>
    </div>
  )
}
