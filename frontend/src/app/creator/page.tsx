'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import api from '@/lib/api'
import SessionCard from '@/components/SessionCard'
import CreateSessionModal from '@/components/CreateSessionModal'
import type { Session, Booking, PaginatedResponse } from '@/types'

export default function CreatorDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [tab, setTab] = useState<'sessions' | 'bookings'>('sessions')

  useEffect(() => {
    if (!loading && (!user || user.role !== 'creator')) {
      router.push(user ? '/profile' : '/login')
    }
  }, [user, loading])

  const fetchSessions = () => {
    api.get<Session[]>('/sessions/my-sessions/').then(({ data }) => setSessions(data))
  }

  const fetchBookings = () => {
    api.get<PaginatedResponse<Booking>>('/bookings/')
      .then(({ data }) => setBookings(data.results ?? (data as any)))
  }

  useEffect(() => {
    if (user?.role === 'creator') {
      fetchSessions()
      fetchBookings()
    }
  }, [user])

  if (loading || !user) return null

  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + parseFloat(b.amount_paid || '0'), 0)

  const statusPill: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your sessions and track bookings</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="self-start sm:self-auto bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition"
        >
          + New Session
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total sessions', value: sessions.length },
          { label: 'Published', value: sessions.filter(s => s.status === 'published').length },
          { label: 'Bookings', value: bookings.filter(b => b.status === 'confirmed').length },
          { label: 'Revenue', value: `$${totalRevenue.toFixed(2)}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-2xl font-semibold mt-1 text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-6">
        {(['sessions', 'bookings'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition ${
              tab === t
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t === 'sessions' ? 'My Sessions' : 'Booking Overview'}
          </button>
        ))}
      </div>

      {tab === 'sessions' && (
        sessions.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 mb-4 text-lg">No sessions yet.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition"
            >
              Create your first session
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map(s => (
              <SessionCard key={s.id} session={s} editable onUpdate={fetchSessions} />
            ))}
          </div>
        )
      )}

      {tab === 'bookings' && (
        bookings.length === 0 ? (
          <p className="text-center text-gray-400 py-24">No bookings yet.</p>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => {
              const dt = new Date(b.session_detail.scheduled_at)
              return (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{b.session_detail.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      {' · '}{b.session_detail.duration_min} min
                    </p>
                    {parseFloat(b.amount_paid || '0') > 0 && (
                      <p className="text-sm text-indigo-600 font-medium mt-1">Paid: ${b.amount_paid}</p>
                    )}
                  </div>
                  <span className={`flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${statusPill[b.status] ?? ''}`}>
                    {b.status}
                  </span>
                </div>
              )
            })}
          </div>
        )
      )}

      {showCreate && (
        <CreateSessionModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { fetchSessions(); setShowCreate(false) }}
        />
      )}
    </div>
  )
}
