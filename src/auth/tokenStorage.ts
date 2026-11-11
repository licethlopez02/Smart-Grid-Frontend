const KEY = 'smartgrid.token'

export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(KEY)
    } catch {
      return null
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(KEY, token)
    } catch {
      // storage unavailable: the session just won't survive a reload
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY)
    } catch {
      // nothing to clear
    }
  },
}
