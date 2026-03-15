'use client' 
import {
createContext, useContext, useEffect, 
useState, ReactNode,
} from 'react'
import Cookies from 'js-cookie' 
import api from './api'
import type { User } from '@/types' 
interface AuthContextType {
user: User | null 
loading: boolean
login: (access: string, refresh: string) => Promise<void> 
logout: () => void
refreshUser: () => Promise<void> 
}
const AuthContext = createContext<AuthContextType>( 
{} as AuthContextType
)
export function AuthProvider({ children }: { children: ReactNode }) {
const [user, setUser] = useState<User | null>(null)
const [loading, setLoading] = useState(true)
const fetchUser = async () => { 
try {
const { data } = await api.get('/auth/me/') 
setUser(data)
} catch { 
setUser(null) 
}
}
useEffect(() => {
const token = Cookies.get('access_token')
if (token) fetchUser().finally(() => setLoading(false)) 
else setLoading(false)
}, [])
const login = async (access: string, refresh: string) => { 
Cookies.set('access_token', access,
{ secure: true, sameSite: 'lax' }) 
Cookies.set('refresh_token', refresh, 
{ secure: true, sameSite: 'lax' }) 
await fetchUser()
}
const logout = () => { 
Cookies.remove('access_token') 
Cookies.remove('refresh_token') 
setUser(null)
} 
return (
<AuthContext.Provider value={{
user, loading, login, logout, refreshUser: fetchUser 
}}>
{children}
</AuthContext.Provider> 
)
}
export const useAuth = () => useContext(AuthContext)