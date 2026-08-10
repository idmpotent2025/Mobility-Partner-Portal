'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

const features = [
  { title: 'Product Catalogue', description: 'Browse 300+ equipment models across all categories with full specs, dimensions, and performance data.' },
  { title: 'Configurator', description: 'Build custom configurations with your required attachments, packages, and regional specifications.' },
  { title: 'Compare Models', description: 'Side-by-side comparison of up to four models across payload, power, and operating specs.' },
  { title: 'New Arrivals', description: 'First-look access to upcoming model launches, limited editions, and regional exclusives.' },
  { title: 'Technology Features', description: 'Deep dives into Cat Connect telematics, Grade Control, and autonomous-ready systems.' },
  { title: 'Partner Pricing', description: 'Confidential partner pricing tiers, volume incentives, and promotional programs.' },
]

export default function ExplorePage() {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/api/auth/login?returnTo=/explore')
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cat-gray">
        <div className="w-10 h-10 border-4 border-cat-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cat-gray">
      <div className="bg-cat-black text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <Link href="/dashboard" className="text-cat-yellow text-sm hover:underline mb-4 inline-block">
            ← Dashboard
          </Link>
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-4xl font-black mb-2">Explore</h1>
          <p className="text-gray-300 text-lg">
            Browse our full range of mobility solutions, equipment specs, and product catalogues.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-xl border-2 border-transparent hover:border-cat-yellow p-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <h3 className="font-bold text-cat-black mb-2">{f.title}</h3>
              <p className="text-cat-steel text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
