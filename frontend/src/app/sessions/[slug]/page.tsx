'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Calendar, Clock, MapPin, Users, ArrowLeft } from 'lucide-react'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import type { Session } from '@/types'

export default function SessionDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [booking, setBooking] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)

  useEffect(() => {
    api.get<Session>(`/sessions/${slug}/`)
      .then(({ data }) => setSession(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  const handleBook = async () => {
    if (!user) { router.push('/login'); return }
    setBooking(true)
    setBookingError('')
    try {
      await api.post('/bookings/', { session_id: session!.id })
      setSession(prev =>
        prev ? { ...prev, is_booked: true, spots_remaining: prev.spots_remaining - 1 } : prev
      )
      setBookingSuccess(true)
    } catch (e: any) {
      setBookingError(
        e.response?.data?.non_field_errors?.[0] ??
        e.response?.data?.detail ??
        'Booking failed — please try again.'
      )
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (notFound || !session) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
        <p className="text-xl font-semibold text-gray-700 mb-2">Session not found</p>
        <p className="text-gray-500 mb-8">This session may have been removed or the link is incorrect.</p>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition font-semibold"
        >
          <ArrowLeft size={16} />
          Back to Catalog
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition"
      >
        <ArrowLeft size={15} /> Back
      </button>

      {session.cover_image && (
        <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden mb-8">
          <Image src={session.cover_image} alt={session.title} fill className="object-cover" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {session.category && (
            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
              {session.category.name}
            </span>
          )}
          <h1 className="text-3xl font-bold text-gray-900">{session.title}</h1>
          <p className="text-gray-600 leading-relaxed text-base">{session.description}</p>
          <p className="text-sm text-gray-500">
            Hosted by <strong className="text-gray-700">{session.creator.username}</strong>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit lg:sticky lg:top-24">
          <p className="text-3xl font-bold text-indigo-600 mb-5">
            {session.price === '0.00' ? 'Free' : `$${session.price}`}
          </p>

          <div className="space-y-2.5 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2.5">
              <Calendar size={15} className="text-gray-400 flex-shrink-0" />
              {new Date(session.scheduled_at).toLocaleString(undefined, {
                weekday: 'short', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </div>
            <div className="flex items-center gap-2.5">
              <Clock size={15} className="text-gray-400 flex-shrink-0" />
              {session.duration_min} minutes
            </div>
            <div className="flex items-center gap-2.5">
              <Users size={15} className="text-gray-400 flex-shrink-0" />
              {session.spots_remaining > 0
                ? `${session.spots_remaining} of ${session.capacity} spots left`
                : <span className="text-red-500 font-medium">Fully booked</span>
              }
            </div>
            {session.location && (
              <div className="flex items-center gap-2.5">
                <MapPin size={15} className="text-gray-400 flex-shrink-0" />
                {session.location}
              </div>
            )}
          </div>

          {bookingSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-2.5 rounded-xl">
              You are booked in!
            </div>
          )}

          {bookingError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
              {bookingError}
            </div>
          )}

          {session.is_booked || bookingSuccess ? (
            <div className="w-full bg-green-50 text-green-700 border border-green-200 py-3 rounded-xl text-center text-sm font-semibold">
              Booked
            </div>
          ) : (
            <button
              onClick={handleBook}
              disabled={booking || session.spots_remaining === 0}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {booking ? 'Booking...'
                : session.spots_remaining === 0 ? 'Sold Out'
                : 'Book Now'}
            </button>
          )}

          {!user && (
            <p className="text-xs text-center text-gray-400 mt-3">
              <button onClick={() => router.push('/login')} className="text-indigo-600 underline">
                Sign in
              </button>{' '}
              to book this session
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
