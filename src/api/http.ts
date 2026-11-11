import axios from 'axios'
import { tokenStorage } from '../auth/tokenStorage'

// Relative URLs: the Vite proxy (dev) or the API Gateway (later) decides which service answers.
export const http = axios.create()

http.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const isAuthCall = String(error.config?.url ?? '').startsWith('/api/auth/')
      if (error.response?.status === 401 && !isAuthCall) {
        tokenStorage.clear()
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)

// Every backend error body is { mensaje: string }.
export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { mensaje?: string } | undefined)?.mensaje
    if (message) return message
  }
  return fallback
}
