export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const val = localStorage.getItem('dd_' + key)
      return val !== null ? JSON.parse(val) : fallback
    } catch {
      return fallback
    }
  },
  set(key: string, val: unknown) {
    localStorage.setItem('dd_' + key, JSON.stringify(val))
  },
  remove(key: string) {
    localStorage.removeItem('dd_' + key)
  },
}
