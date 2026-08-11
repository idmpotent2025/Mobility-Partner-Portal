import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth0A } from '@/lib/auth-variants'

const fleetStats = [
  { label: 'Active Machines', value: '142', delta: '+3 this week', color: 'text-green-600' },
  { label: 'Pending Service', value: '8', delta: '2 overdue', color: 'text-orange-500' },
  { label: 'Open Rentals', value: '27', delta: '5 expiring soon', color: 'text-blue-600' },
  { label: 'Open Orders', value: '14', delta: '$284,500 total', color: 'text-purple-600' },
]

const recentActivity = [
  { id: 'ACT-001', type: 'Service', machine: 'CAT 320 Excavator', serial: 'SN-CAT320-7841', date: 'Aug 09, 2026', status: 'Completed' },
  { id: 'ACT-002', type: 'Rental', machine: 'CAT 950 Wheel Loader', serial: 'SN-CAT950-3312', date: 'Aug 08, 2026', status: 'Active' },
  { id: 'ACT-003', type: 'Purchase', machine: 'CAT 336 Excavator', serial: 'SN-CAT336-9903', date: 'Aug 07, 2026', status: 'Processing' },
  { id: 'ACT-004', type: 'Service', machine: 'CAT D6 Dozer', serial: 'SN-CATD6-5521', date: 'Aug 06, 2026', status: 'Scheduled' },
  { id: 'ACT-005', type: 'Rental', machine: 'CAT 420 Backhoe', serial: 'SN-CAT420-6677', date: 'Aug 05, 2026', status: 'Completed' },
]

const statusColors: Record<string, string> = {
  Completed: 'bg-green-100 text-green-700',
  Active: 'bg-blue-100 text-blue-700',
  Processing: 'bg-yellow-100 text-yellow-700',
  Scheduled: 'bg-purple-100 text-purple-700',
}

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
        <div className="max-w-6xl mx-auto flex items-start justify-between gap-4">
          <div>
            <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">Fleet Dashboard</p>
            <h1 className="text-3xl sm:text-4xl font-black">
              Welcome back,{' '}
              <span className="text-cat-yellow">{firstName}.</span>
            </h1>
            <p className="text-gray-400 mt-2">
              Signed in as <span className="text-gray-200">{user.email}</span>
            </p>
          </div>
          <Link
            href="/profile"
            className="shrink-0 bg-cat-yellow text-cat-black font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-yellow-400 transition-colors"
          >
            My Profile
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        {/* Fleet stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {fleetStats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-cat-black mb-1">{stat.value}</p>
              <p className={`text-xs font-medium ${stat.color}`}>{stat.delta}</p>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-cat-black">Recent Activity</h2>
            <span className="text-xs text-gray-400">Last 7 days</span>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity.map((item) => (
              <div key={item.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="text-xs font-mono text-gray-400 shrink-0 w-20">{item.id}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-cat-black truncate">{item.machine}</p>
                    <p className="text-xs text-gray-400 font-mono">{item.serial}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-gray-500">{item.date}</span>
                  <span className="text-xs text-gray-400">{item.type}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet health snapshot */}
        <div className="bg-cat-black rounded-xl p-8 text-white">
          <h2 className="text-xl font-bold mb-1">Fleet Health</h2>
          <p className="text-gray-400 text-sm mb-6">Machine condition overview</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Operational', value: '118', pct: '83%', color: 'text-green-400' },
              { label: 'In Service', value: '16', pct: '11%', color: 'text-yellow-400' },
              { label: 'On Rental', value: '27', pct: '19%', color: 'text-blue-400' },
              { label: 'Awaiting Parts', value: '5', pct: '4%', color: 'text-red-400' },
            ].map((item) => (
              <div key={item.label}>
                <div className={`text-3xl font-black ${item.color}`}>{item.value}</div>
                <div className="text-gray-400 text-xs mt-1">{item.label}</div>
                <div className="text-gray-500 text-xs">{item.pct}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
