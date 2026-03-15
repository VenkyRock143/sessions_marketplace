'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function AuthCallback() {
  const { login } = useAuth()
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const access = params.get('access')
    const refresh = params.get('refresh')

    if (access && refresh) {
      login(access, refresh).then(() => router.replace('/dashboard'))
    } else {
      router.replace('/login?error=auth_failed')
    }
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Completing sign in...</p>
      </div>
    </div>
  )
}
