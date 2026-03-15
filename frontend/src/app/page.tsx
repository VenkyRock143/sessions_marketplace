'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import SessionCard from '@/components/SessionCard'
import SearchBar from '@/components/SearchBar'
import type { Session, Category, PaginatedResponse } from '@/types'

export default function HomePage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    api.get<Category[]>('/sessions/categories/').then(({ data }) => setCategories(data))
  }, [])

  useEffect(() => {
    const params = new URLSearchParams({ status: 'published' })
    if (search) params.set('search', search)
    if (selectedCategory) params.set('category', selectedCategory)
    setLoading(true)
    api.get<PaginatedResponse<Session>>(`/sessions/?${params}`)
      .then(({ data }) => setSessions(data.results ?? (data as any)))
      .finally(() => setLoading(false))
  }, [search, selectedCategory])

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Discover Expert Sessions
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-base">
          Book live workshops, coaching calls, and masterclasses from verified creators.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} />
        </div>
        {categories.length > 0 && (
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 h-[46px]"
          >
            <option value="">All categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-72 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-gray-400 text-lg mb-2">No sessions found.</p>
          <p className="text-gray-300 text-sm">Try a different search or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map(s => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
      )}
    </div>
  )
}
