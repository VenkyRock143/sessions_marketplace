'use client'
import { useState, FormEvent } from 'react'
import { X } from 'lucide-react'
import api from '@/lib/api'

interface Props {
  onClose: () => void
  onCreated: () => void
}

export default function CreateSessionModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '0',
    capacity: '20',
    duration_min: '60',
    scheduled_at: '',
    location: '',
    status: 'draft',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post('/sessions/', form)
      onCreated()
    } catch (e: any) {
      setError(JSON.stringify(e.response?.data ?? 'Something went wrong'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">New Session</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {([
            { l: 'Title *', k: 'title', t: 'text', req: true },
            { l: 'Price ($)', k: 'price', t: 'number', req: false },
            { l: 'Capacity', k: 'capacity', t: 'number', req: false },
            { l: 'Duration (min)', k: 'duration_min', t: 'number', req: false },
            { l: 'Location', k: 'location', t: 'text', req: false },
          ] as const).map(f => (
            <div key={f.k}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.l}</label>
              <input
                type={f.t}
                required={f.req}
                value={(form as any)[f.k]}
                onChange={e => set(f.k, e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled at *</label>
            <input
              type="datetime-local"
              required
              value={form.scheduled_at}
              onChange={e => set('scheduled_at', e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={e => set('status', e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {saving ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
