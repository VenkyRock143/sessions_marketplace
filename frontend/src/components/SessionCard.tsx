'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Calendar, Clock, Users, Pencil, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import type { Session } from '@/types'

interface Props {
  session: Session
  editable?: boolean
  onUpdate?: () => void
}

export default function SessionCard({ session, editable, onUpdate }: Props) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: session.title,
    description: session.description,
    price: session.price,
    capacity: String(session.capacity),
    duration_min: String(session.duration_min),
    location: session.location,
    status: session.status,
    scheduled_at: session.scheduled_at?.slice(0, 16) ?? '',
  })

  const date = new Date(session.scheduled_at)

  const statusColor: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-700',
    published: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${session.title}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await api.delete(`/sessions/${session.slug}/`)
      onUpdate?.()
    } catch {
      alert('Could not delete session. Please try again.')
      setDeleting(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch(`/sessions/${session.slug}/`, form)
      setEditing(false)
      onUpdate?.()
    } catch (err: any) {
      alert(JSON.stringify(err.response?.data ?? 'Save failed'))
    } finally {
      setSaving(false)
    }
  }

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  if (editing) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Edit Session</h3>
          <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600 text-sm">
            Cancel
          </button>
        </div>
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          {([
            { l: 'Title', k: 'title', t: 'text' },
            { l: 'Price ($)', k: 'price', t: 'number' },
            { l: 'Capacity', k: 'capacity', t: 'number' },
            { l: 'Duration (min)', k: 'duration_min', t: 'number' },
            { l: 'Location', k: 'location', t: 'text' },
          ] as const).map(f => (
            <div key={f.k}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{f.l}</label>
              <input
                type={f.t}
                value={(form as any)[f.k]}
                onChange={e => set(f.k, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Scheduled at</label>
            <input
              type="datetime-local"
              value={form.scheduled_at}
              onChange={e => set('scheduled_at', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              value={form.status}
              onChange={e => set('status', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col">
      <div className="relative h-44 bg-gray-100">
        {session.cover_image ? (
          <Image src={session.cover_image} alt={session.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300 font-bold">
            {session.title?.[0]?.toUpperCase() ?? 'S'}
          </div>
        )}
        {editable && (
          <>
            <span className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full ${statusColor[session.status] ?? ''}`}>
              {session.status}
            </span>
            <div className="absolute top-3 right-3 flex gap-1.5">
              <button
                onClick={() => setEditing(true)}
                title="Edit"
                className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-indigo-50 transition"
              >
                <Pencil size={12} className="text-indigo-600" />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                title="Delete"
                className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-red-50 transition disabled:opacity-40"
              >
                <Trash2 size={12} className="text-red-500" />
              </button>
            </div>
          </>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{session.title}</h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{session.description}</p>

        <div className="mt-auto space-y-1 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} />
            {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} />{session.duration_min} min
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={12} />{session.spots_remaining} spots left
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="font-bold text-indigo-600">
            {session.price === '0.00' ? 'Free' : `$${session.price}`}
          </span>
          <Link
            href={`/sessions/${session.slug}`}
            className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  )
}
