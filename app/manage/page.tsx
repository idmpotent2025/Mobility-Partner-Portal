'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { useAuthVariant, getLoginUrl } from '@/lib/use-auth-variant'

const features = [
  { title: 'Fleet Overview', description: 'Real-time dashboard showing all assets, their locations, utilization rates, and operational status.' },
  { title: 'Asset Tracking', description: 'GPS-powered telematics integration for live location, hours, idle time, and geofence alerts.' },
  { title: 'User Management', description: 'Add team members, assign roles, and control access across your organization.' },
  { title: 'Utilization Reports', description: 'Weekly and monthly reports on fleet utilization, cost-per-hour, and efficiency metrics.' },
  { title: 'Maintenance Alerts', description: 'Proactive alerts for scheduled service intervals, fault codes, and preventive maintenance.' },
  { title: 'Document Vault', description: 'Centralized storage for warranties, registrations, compliance docs, and operator certifications.' },
]

export default function ManagePage() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const { variant } = useAuthVariant()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(getLoginUrl(variant, '/manage'))
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
          <div className="text-5xl mb-4">⚙️</div>
          <h1 className="text-4xl font-black mb-2">Manage</h1>
          <p className="text-gray-300 text-lg">
            Track, monitor, and manage your entire fleet from a single unified dashboard.
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
