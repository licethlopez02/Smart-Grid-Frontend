import axios from 'axios'
import { tokenStorage } from '../auth/tokenStorage'

export const http = axios.create({
  baseURL: '/api',
})

// Normalize URL in case callers pass '/api/...' with baseURL: '/api'
http.interceptors.request.use((config) => {
  if (config.url?.startsWith('/api/')) {
    config.url = config.url.replace(/^\/api/, '')
  }
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const requestUrl = String(error.config?.url ?? '')
      const isAuthCall = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/registro')

      if (status === 401 && !isAuthCall) {
        tokenStorage.clear()
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.assign('/login')
        }
      }
      // 403: no cierra sesión, solo propaga el error
    }
    return Promise.reject(error)
  },
)

export function getErrorMessage(error: unknown, fallback = 'Ha ocurrido un error inesperado.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { mensaje?: string } | undefined
    if (data && typeof data.mensaje === 'string' && data.mensaje.trim() !== '') {
      return data.mensaje
    }

    const status = error.response?.status
    if (status === 401) {
      return 'No autorizado. Por favor inicia sesión.'
    }
    if (status === 403) {
      return 'Acceso denegado. No tienes permisos para consultar este medidor o recurso.'
    }
    if (status === 404) {
      return 'El medidor o recurso solicitado no fue encontrado.'
    }
    if (status === 503) {
      return 'Servicio no disponible temporalmente.'
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
