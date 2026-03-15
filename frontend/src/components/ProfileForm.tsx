'use client'
import { useState, useEffect, FormEvent } from 'react'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

export default function ProfileForm() {
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    display_name: '',
    website: '',
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name ?? '',
        last_name: user.last_name ?? '',
        bio: user.bio ?? '',
        display_name: user.profile?.display_name ?? '',
        website: user.profile?.website ?? '',
      })
    }
  }, [user])

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    setError('')
    try {
      await api.patch('/auth/me/', {
        first_name: form.first_name,
        last_name: form.last_name,
        bio: form.bio,
      })
      await api.patch('/auth/profile/', {
        display_name: form.display_name,
        website: form.website,
      })
      await refreshUser()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-100 p-8 space-y-5"
    >
      <div className="grid grid-cols-2 gap-4">
        {[
          { l: 'First name', k: 'first_name' },
          { l: 'Last name', k: 'last_name' },
        ].map(f => (
          <div key={f.k}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{f.l}</label>
            <input
              type="text"
              value={(form as any)[f.k]}
              onChange={e => set(f.k, e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        ))}
      </div>

      {[
        { l: 'Display name', k: 'display_name' },
        { l: 'Website', k: 'website' },
      ].map(f => (
        <div key={f.k}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{f.l}</label>
          <input
            type="text"
            value={(form as any)[f.k]}
            onChange={e => set(f.k, e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <textarea
          rows={3}
          value={form.bio}
          onChange={e => set('bio', e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
        />
      </div>

      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-100 px-3 py-2 rounded-lg">
          Changes saved successfully.
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 transition"
      >
        {saving ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  )
}
