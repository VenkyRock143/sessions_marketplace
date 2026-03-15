'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import api from '@/lib/api'
import BookingCard from '@/components/BookingCard'
import type { Booking, PaginatedResponse } from '@/types'

export default function UserDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  useEffect(() => {
    if (user) {
      api.get<PaginatedResponse<Booking>>('/bookings/')
        .then(({ data }) => setBookings(data.results ?? (data as any)))
    }
  }, [user])

  if (loading || !user) return null

  const now = new Date()
  const upcoming = bookings.filter(
    b => new Date(b.session_detail.scheduled_at) > now && b.status === 'confirmed'
  )
  const past = bookings.filter(
    b => new Date(b.session_detail.scheduled_at) <= now || b.status === 'cancelled'
  )
  const list = tab === 'upcoming' ? upcoming : past

  const handleCancel = (id: number) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">My Dashboard</h1>
      <p className="text-gray-500 mb-8">
        Welcome back, {user.first_name || user.username}
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total bookings', value: bookings.length },
          { label: 'Upcoming', value: upcoming.length },
          { label: 'Past', value: past.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-2xl font-semibold mt-1 text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-6">
        {(['upcoming', 'past'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition ${
              tab === t
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t === 'upcoming' ? 'Upcoming' : 'Past'} bookings
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {list.length === 0 ? (
          <p className="text-center text-gray-400 py-16">
            No {tab} bookings.{' '}
            {tab === 'upcoming' && (
              <button onClick={() => router.push('/')} className="text-indigo-600 underline">
                Browse sessions
              </button>
            )}
          </p>
        ) : (
          list.map(b => (
            <BookingCard key={b.id} booking={b} onCancel={() => handleCancel(b.id)} />
          ))
        )}
      </div>
    </div>
  )
}
