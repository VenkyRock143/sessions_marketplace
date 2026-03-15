'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          Sessions
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition">
                Dashboard
              </Link>
              {user.role === 'creator' && (
                <Link href="/creator" className="text-sm text-gray-600 hover:text-gray-900 transition">
                  Creator
                </Link>
              )}
              <Link href="/profile" className="text-sm text-gray-600 hover:text-gray-900 transition">
                Profile
              </Link>
              <div className="flex items-center gap-2 ml-1">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-semibold">
                  {user.username?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-800 transition"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
