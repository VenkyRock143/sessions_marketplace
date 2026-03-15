import axios from 'axios' 
import Cookies from 'js-cookie' 
const api = axios.create({
baseURL: process.env.NEXT_PUBLIC_API_URL || 
'http://localhost:8000/api',
headers: { 'Content-Type': 'application/json' }, 
})
// Attach JWT to every request automatically
api.interceptors.request.use((config) => { 
const token = Cookies.get('access_token')
if (token) config.headers.Authorization = `Bearer ${token}` 
return config
})
// Auto-refresh token on 401
api.interceptors.response.use( 
(res) => res,
async (err) => {
const original = err.config
if (err.response?.status === 401 && !original._retry) { 
original._retry = true
try {
const refresh = Cookies.get('refresh_token') 
const { data } = await axios.post(
`${process.env.NEXT_PUBLIC_API_URL}/token/refresh/`, 
{ refresh }
)
Cookies.set('access_token', data.access, { secure: true }) 
original.headers.Authorization = `Bearer ${data.access}` 
return api(original)
} catch {
Cookies.remove('access_token')
Cookies.remove('refresh_token')
if (typeof window !== 'undefined') { 
window.location.href = '/login'
} 
} 
}
return Promise.reject(err) 
}
)
export default api