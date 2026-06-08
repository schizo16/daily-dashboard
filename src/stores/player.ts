import { create } from 'zustand'

interface PlayerState {
  videoId: string | null
  title: string
  setTrack: (id: string, title: string) => void
  clear: () => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  videoId: null,
  title: '',
  setTrack: (videoId, title) => set({ videoId, title }),
  clear: () => set({ videoId: null, title: '' }),
}))
