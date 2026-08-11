'use client'

import Link from 'next/link'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useAuthVariant, getLoginUrl } from '@/lib/use-auth-variant'

export default function Navigation() {
  const { user, isLoading } = useUser()
  const partnerPortalUrl = process.env.NEXT_PUBLIC_PARTNER_PORTAL_URL || 'http://localhost:3000'
  const { variant } = useAuthVariant()

  return (
    <nav className="sticky top-0 z-50 bg-cat-black shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <svg
              className="w-8 h-8 text-cat-yellow"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 2a8 8 0 1 1 0 16A8 8 0 0 1 12 4zm0 2a6 6 0 1 0 0 12A6 6 0 0 0 12 6zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-6.364.636a7.978 7.978 0 0 1 .828-1.415l1.415 1.415a5.978 5.978 0 0 0-.622 1.06l-1.62-.06zm12.728 0l-1.621.06a5.978 5.978 0 0 0-.622-1.061l1.415-1.414a7.98 7.98 0 0 1 .828 1.415zM5.636 17.364a7.978 7.978 0 0 1-.828-1.415l1.62.06c.163.38.374.74.622 1.062l-1.414 1.293zm12.728 0l-1.415-1.415c.248-.321.46-.68.622-1.06l1.621-.06a7.979 7.979 0 0 1-.828 1.535z" />
            </svg>
            <div className="leading-tight">
              <div className="text-cat-yellow font-bold text-lg tracking-wide">Mobility</div>
              <div className="text-gray-400 text-xs tracking-widest uppercase">Partner Portal</div>
            </div>
          </Link>

          {/* Desktop nav links — only show when authenticated */}
          {user && (
            <div className="hidden lg:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-cat-yellow hover:bg-cat-charcoal px-3 py-2 rounded text-sm font-medium transition-colors duration-150"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="text-gray-300 hover:text-cat-yellow hover:bg-cat-charcoal px-3 py-2 rounded text-sm font-medium transition-colors duration-150"
              >
                Profile
              </Link>
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cross-portal SSO link */}
            <a
              href={partnerPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-cat-yellow text-sm font-medium hover:underline"
            >
              Partner Portal
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-cat-charcoal animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                {/* User avatar */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-cat-yellow flex items-center justify-center text-cat-black font-bold text-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                  <div className="hidden md:block leading-tight">
                    <div className="text-white text-sm font-medium truncate max-w-[140px]">{user.name}</div>
                    <div className="text-gray-400 text-xs truncate max-w-[140px]">{user.email}</div>
                  </div>
                </div>
                {/* Sign Out */}
                <a
                  href="/api/auth/logout"
                  className="bg-cat-charcoal text-gray-300 hover:text-cat-yellow hover:bg-opacity-80 px-3 py-1.5 rounded text-sm font-medium border border-cat-steel transition-colors duration-150"
                >
                  Sign Out
                </a>
              </div>
            ) : (
              <a
                href={getLoginUrl(variant)}
                className="bg-cat-yellow text-cat-black font-bold px-4 py-2 rounded text-sm hover:bg-yellow-400 transition-colors duration-150"
              >
                Sign In
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
