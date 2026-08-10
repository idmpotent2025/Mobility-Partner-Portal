import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth0A } from '@/lib/auth-variants'

const dashboardTiles = [
  {
    title: 'Explore',
    href: '/explore',
    icon: '🔍',
    description: 'Browse product lines and specs',
    color: 'border-l-4 border-l-blue-500',
  },
  {
    title: 'Manage',
    href: '/manage',
    icon: '⚙️',
    description: 'Fleet and asset management',
    color: 'border-l-4 border-l-green-500',
  },
  {
    title: 'Finance',
    href: '/finance',
    icon: '💰',
    description: 'Financing, leasing, and payment options',
    color: 'border-l-4 border-l-purple-500',
  },
  {
    title: 'Rent',
    href: '/rent',
    icon: '🔑',
    description: 'Short and long-term rental booking',
    color: 'border-l-4 border-l-orange-500',
  },
  {
    title: 'Find Used',
    href: '/find-used',
    icon: '🏷️',
    description: 'Certified pre-owned marketplace',
    color: 'border-l-4 border-l-red-500',
  },
  {
    title: 'Service Info',
    href: '/service-info',
    icon: '🔧',
    description: 'Maintenance schedules, parts, bulletins',
    color: 'border-l-4 border-l-teal-500',
  },
  {
    title: 'Buy Online',
    href: '/buy-online',
    icon: '🛒',
    description: 'Parts and equipment procurement',
    color: 'border-l-4 border-l-cat-yellow',
  },
]

export default async function DashboardPage() {
  const session = await auth0A.getSession()

  if (!session?.user) {
    redirect('/')
  }

  const { user } = session
  const firstName = user.name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'Partner'

  return (
    <div className="min-h-screen bg-cat-gray">
      {/* Welcome banner */}
      <div className="bg-cat-black text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">Partner Dashboard</p>
          <h1 className="text-3xl sm:text-4xl font-black">
            Welcome back,{' '}
            <span className="text-cat-yellow">{firstName}.</span>
          </h1>
          <p className="text-gray-400 mt-2">
            Signed in as <span className="text-gray-200">{user.email}</span>
          </p>
        </div>
      </div>

      {/* Dashboard grid */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-cat-black mb-6">Your Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {dashboardTiles.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className={`bg-white rounded-xl shadow-sm hover:shadow-md ${tile.color} p-6 hover:scale-[1.02] transition-all duration-200 group`}
            >
              <div className="text-3xl mb-3">{tile.icon}</div>
              <h3 className="text-lg font-bold text-cat-black group-hover:text-cat-steel mb-1">
                {tile.title}
              </h3>
              <p className="text-cat-steel text-sm">{tile.description}</p>
              <div className="mt-4 text-cat-yellow text-sm font-bold flex items-center gap-1">
                Open
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-12 bg-cat-black rounded-xl p-8 text-white">
          <h2 className="text-xl font-bold mb-1">Quick Actions</h2>
          <p className="text-gray-400 text-sm mb-6">Common partner tasks</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'New Quote', href: '/finance' },
              { label: 'Schedule Service', href: '/service-info' },
              { label: 'Browse Inventory', href: '/explore' },
              { label: 'Place Order', href: '/buy-online' },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="bg-cat-charcoal hover:bg-cat-yellow hover:text-cat-black text-white text-sm font-bold text-center py-3 px-4 rounded-lg transition-colors duration-200"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
