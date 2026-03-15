'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import ProfileForm from '@/components/ProfileForm'
import api from '@/lib/api'
import Cookies from 'js-cookie'

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth()
  const router = useRouter()
  const [switching, setSwitching] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  if (loading || !user) return null

  const handleBecomeCreator = async () => {
    setSwitching(true)
    try {
      const { data } = await api.post('/auth/switch-role/')
      Cookies.set('access_token', data.access, { secure: true, sameSite: 'lax' })
      Cookies.set('refresh_token', data.refresh, { secure: true, sameSite: 'lax' })
      await refreshUser()
      setDone(true)
      setTimeout(() => router.push('/creator'), 1500)
    } catch {
      alert('Could not switch role — please try again.')
    } finally {
      setSwitching(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xl font-bold">
          {user.username?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">{user.email}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              user.role === 'creator'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      <ProfileForm />

      {user.role !== 'creator' && (
        <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
          <h2 className="text-base font-semibold text-indigo-900 mb-1">Want to publish sessions?</h2>
          <p className="text-sm text-indigo-700 mb-4">
            Switch to a creator account and you can create, manage, and publish your own sessions to the marketplace.
          </p>
          {done ? (
            <p className="text-sm font-medium text-green-700 bg-green-50 border border-green-200 px-4 py-2.5 rounded-xl">
              You are now a creator. Taking you to your dashboard...
            </p>
          ) : (
            <button
              onClick={handleBecomeCreator}
              disabled={switching}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {switching ? 'Switching...' : 'Become a Creator'}
            </button>
          )}
        </div>
      )}

      {user.role === 'creator' && (
        <div className="mt-8 rounded-2xl border border-green-100 bg-green-50 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-green-900 text-sm">Creator account</p>
            <p className="text-xs text-green-700 mt-0.5">You can publish and manage sessions from your dashboard.</p>
          </div>
          <button
            onClick={() => router.push('/creator')}
            className="flex-shrink-0 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  )
}
