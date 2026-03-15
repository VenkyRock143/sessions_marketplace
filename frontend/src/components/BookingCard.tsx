'use client'
import { useState } from 'react'
import api from '@/lib/api'
import type { Booking } from '@/types'

interface Props {
  booking: Booking
  onCancel: () => void
}

const statusPill: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-600',
}

export default function BookingCard({ booking, onCancel }: Props) {
  const s = booking.session_detail
  const dt = new Date(s.scheduled_at)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState('')

  const handleCancel = async () => {
    if (!confirm('Cancel this booking?')) return
    setCancelling(true)
    setError('')
    try {
      await api.patch(`/bookings/${booking.id}/cancel/`)
      onCancel()
    } catch (e: any) {
      setError(e.response?.data?.detail ?? 'Could not cancel. Please try again.')
      setCancelling(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{s.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            {' at '}
            {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {' · '}
            {s.duration_min} min
          </p>
          {s.location && (
            <p className="text-xs text-gray-400 mt-0.5">{s.location}</p>
          )}
          {parseFloat(booking.amount_paid || '0') > 0 && (
            <p className="text-sm text-indigo-600 font-medium mt-1.5">Paid: ${booking.amount_paid}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusPill[booking.status] ?? ''}`}>
            {booking.status}
          </span>
          {booking.status === 'confirmed' && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="text-xs text-red-500 hover:text-red-700 hover:underline disabled:opacity-50 transition"
            >
              {cancelling ? 'Cancelling...' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
      {error && (
        <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
    </div>
  )
}
