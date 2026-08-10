'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { useAuthVariant, getLoginUrl } from '@/lib/use-auth-variant'

const features = [
  { title: 'Instant Availability', description: 'Search real-time availability across dealer locations by equipment type, date range, and region.' },
  { title: 'Short-Term Rentals', description: 'Day, week, or monthly rentals with delivery, operator, and fuel options configurable at checkout.' },
  { title: 'Long-Term Agreements', description: 'Negotiate multi-year rental contracts with guaranteed availability and locked-in rate protection.' },
  { title: 'Rental Fleet Specs', description: 'Browse certified rental units with current meter hours, maintenance history, and condition reports.' },
  { title: 'Online Booking', description: 'Reserve equipment from any device. Modify or cancel reservations up to 48 hours before pickup.' },
  { title: 'Rental Conversion', description: 'Convert an active rental to a purchase and apply a portion of rental payments toward the price.' },
]

export default function RentPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const { variant } = useAuthVariant()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(getLoginUrl(variant, '/rent'))
    }
  }, [user, isLoading, router, variant])

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
          <div className="text-5xl mb-4">🔑</div>
          <h1 className="text-4xl font-black mb-2">Rent</h1>
          <p className="text-gray-300 text-lg">
            Reserve equipment for your project timeline — from single-day rentals to multi-year agreements.
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
