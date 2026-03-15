export interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  role: 'user' | 'creator'
  avatar: string | null
  bio: string
  profile: { display_name: string; website: string } | null
  date_joined: string
}

export interface Category {
  id: number
  name: string
  slug: string
}

export interface Session {
  id: number
  title: string
  slug: string
  description: string
  creator: User
  category: Category | null
  cover_image: string | null
  price: string
  capacity: number
  duration_min: number
  scheduled_at: string
  location: string
  status: 'draft' | 'published' | 'cancelled'
  spots_remaining: number
  is_booked: boolean
  created_at: string
}

export interface Booking {
  id: number
  session_detail: Session
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  amount_paid: string
  notes: string
  booked_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
