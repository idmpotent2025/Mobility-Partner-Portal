'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

const features = [
  { title: 'Equipment Loans', description: 'Competitive fixed and variable rate loans with terms from 24 to 84 months and flexible down payment options.' },
  { title: 'Lease Programs', description: 'Operating and finance leases with seasonal payment structures, deferred payment, and step-up schedules.' },
  { title: 'Payment Calculator', description: 'Instant payment estimates with live rate feeds, trade-in valuation, and residual value modelling.' },
  { title: 'Credit Applications', description: 'Streamlined digital credit applications with 24-hour approvals for qualified partners.' },
  { title: 'Invoice Financing', description: 'Convert outstanding dealer invoices to immediate working capital with floor plan financing.' },
  { title: 'Incentive Programs', description: 'Quarterly partner incentives, volume rebates, and promotional rate campaigns.' },
]

export default function FinancePage() {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/api/auth/login?returnTo=/finance')
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
          <div className="text-5xl mb-4">💰</div>
          <h1 className="text-4xl font-black mb-2">Finance</h1>
          <p className="text-gray-300 text-lg">
            Flexible financing structures, lease programs, and payment solutions tailored for partners.
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
