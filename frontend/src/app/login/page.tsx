'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const error = params.get('error')

  const BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api').replace('/api', '')

  useEffect(() => {
    if (user) router.replace('/dashboard')
  }, [user])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
        <p className="text-gray-500 text-sm mb-8">Sign in to browse and book sessions</p>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
            Authentication failed. Please try again.
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.location.href = `${BASE}/social-auth/login/google-oauth2/`}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-3 hover:bg-gray-50 transition text-sm font-medium text-gray-700"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
            Continue with Google
          </button>

          <button
            onClick={() => window.location.href = `${BASE}/social-auth/login/github/`}
            className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white rounded-xl py-3 hover:bg-gray-800 transition text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.13 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          By signing in you agree to our terms of service.
        </p>
      </div>
    </div>
  )
}
