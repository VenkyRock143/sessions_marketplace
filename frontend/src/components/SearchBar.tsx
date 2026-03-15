'use client'
import { Search } from 'lucide-react'

interface Props {
  value: string
  onChange: (v: string) => void
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search sessions..."
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
      />
    </div>
  )
}
