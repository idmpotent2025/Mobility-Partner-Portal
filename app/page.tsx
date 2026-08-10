'use client'

import AbcToggle from '@/components/AbcToggle'
import { useAuthVariant, getLoginUrl } from '@/lib/use-auth-variant'

const portalTiles = [
  {
    id: 'explore',
    title: 'Explore',
    icon: '🔍',
    description: 'Browse product lines and specs',
    detail: 'Discover our full range of mobility solutions, equipment specs, and product catalogues.',
  },
  {
    id: 'manage',
    title: 'Manage',
    icon: '⚙️',
    description: 'Fleet and asset management',
    detail: 'Track, monitor, and manage your entire fleet from a single unified dashboard.',
  },
  {
    id: 'finance',
    title: 'Finance',
    icon: '💰',
    description: 'Financing, leasing, and payment options',
    detail: 'Flexible financing structures, lease programs, and payment solutions tailored for partners.',
  },
  {
    id: 'rent',
    title: 'Rent',
    icon: '🔑',
    description: 'Short and long-term rental booking',
    detail: 'Reserve equipment for your project timeline — from single-day rentals to multi-year agreements.',
  },
  {
    id: 'find-used',
    title: 'Find Used',
    icon: '🏷️',
    description: 'Certified pre-owned marketplace',
    detail: 'Shop inspected, certified pre-owned equipment with transparent condition reports and history.',
  },
  {
    id: 'service-info',
    title: 'Service Info',
    icon: '🔧',
    description: 'Maintenance schedules, parts, bulletins',
    detail: 'Access service manuals, OEM parts lookup, maintenance schedules, and technical bulletins.',
  },
  {
    id: 'buy-online',
    title: 'Buy Online',
    icon: '🛒',
    description: 'Parts and equipment procurement',
    detail: 'Order parts, attachments, and equipment directly with partner pricing and priority fulfillment.',
  },
]

const stats = [
  { value: '50,000+', label: 'Active Dealers' },
  { value: '300+', label: 'Equipment Models' },
  { value: '190', label: 'Countries' },
  { value: '99.9%', label: 'Uptime' },
]

const howItWorks = [
  {
    step: '01',
    title: 'Create Your Account',
    description: 'Register once with your partner credentials. One account gives you access to every Mobility service.',
  },
  {
    step: '02',
    title: 'Connect Your Fleet',
    description: 'Link your assets, set up financing, and onboard your team in minutes.',
  },
  {
    step: '03',
    title: 'Manage Everything',
    description: 'Operate, finance, service, and procure — all from a single authenticated session.',
  },
]

export default function HomePage() {
  const { variant, setVariant } = useAuthVariant()
  const dashboardLoginUrl = getLoginUrl(variant, '/dashboard')

  return (
    <div className="min-h-screen bg-cat-gray">
      {/* Hero */}
      <section className="bg-cat-black text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block bg-cat-yellow text-cat-black text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase mb-6">
            Partner Portal
          </div>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-4">
            One Account.
            <br />
            All Of <span className="text-cat-yellow">Mobility.</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Your fleet. Financed, managed, and serviced — all in one place.
          </p>

          {/* A/B/C Test toggle */}
          <div className="flex justify-center mb-8">
            <AbcToggle variant={variant} onChange={setVariant} />
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href={dashboardLoginUrl}
              className="bg-cat-yellow text-cat-black font-bold px-8 py-4 rounded-lg text-lg hover:bg-yellow-400 transition-colors duration-200"
            >
              Get Started
            </a>
            <a
              href="#features"
              className="border-2 border-cat-yellow text-cat-yellow font-bold px-8 py-4 rounded-lg text-lg hover:bg-cat-yellow hover:text-cat-black transition-colors duration-200"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-cat-charcoal text-white py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-cat-yellow text-3xl font-black">{stat.value}</div>
                <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature tiles */}
      <section id="features" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-cat-black text-center mb-2">
            Everything Your Business Needs
          </h2>
          <p className="text-cat-steel text-center mb-10">
            Seven powerful modules. One unified account.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {portalTiles.map((tile) => (
              <a
                key={tile.id}
                href={dashboardLoginUrl}
                className="bg-white rounded-xl border-2 border-transparent hover:border-cat-yellow p-6 shadow-sm hover:shadow-md transition-all duration-200 group text-left"
              >
                <div className="text-3xl mb-3">{tile.icon}</div>
                <h3 className="text-lg font-bold text-cat-black group-hover:text-cat-steel mb-1">
                  {tile.title}
                </h3>
                <p className="text-cat-steel text-sm font-medium mb-2">{tile.description}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{tile.detail}</p>
                <div className="mt-4 text-cat-yellow text-sm font-bold flex items-center gap-1">
                  Access
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-cat-black text-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-2">How It Works</h2>
          <p className="text-gray-400 text-center mb-12">Up and running in three steps</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step) => (
              <div key={step.step} className="text-center">
                <div className="text-cat-yellow text-5xl font-black mb-4">{step.step}</div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a
              href={dashboardLoginUrl}
              className="bg-cat-yellow text-cat-black font-bold px-10 py-4 rounded-lg text-lg hover:bg-yellow-400 transition-colors duration-200"
            >
              Create Your Account
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cat-charcoal text-gray-400 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cat-yellow rounded" />
            <span className="text-white font-bold">Mobility Partner Portal</span>
          </div>
          <p className="text-xs">
            &copy; {new Date().getFullYear()} Mobility Corp. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs">
            <a href="#" className="hover:text-cat-yellow transition-colors">Privacy</a>
            <a href="#" className="hover:text-cat-yellow transition-colors">Terms</a>
            <a href="#" className="hover:text-cat-yellow transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
