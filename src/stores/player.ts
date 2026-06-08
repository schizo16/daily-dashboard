import { create } from 'zustand'

interface Track {
  id: string
  title: string
  artist?: string
}

interface PlayerState {
  videoId: string | null
  title: string
  artist: string
  playing: boolean
  currentTime: number
  duration: number
  volume: number
  loop: 0 | 1 | 2
  shuffle: boolean
  queue: Track[]
  queueIdx: number
  setTrack: (id: string, title: string, artist?: string) => void
  setPlaying: (p: boolean) => void
  setTime: (t: number) => void
  setDuration: (d: number) => void
  setVolume: (v: number) => void
  toggleLoop: () => void
  toggleShuffle: () => void
  next: () => void
  prev: () => void
  addToQueue: (t: Track) => void
  clear: () => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  videoId: null,
  title: '',
  artist: '',
  playing: false,
  currentTime: 0,
  duration: 0,
  volume: 0.5,
  loop: 0,
  shuffle: false,
  queue: [],
  queueIdx: -1,

  setTrack: (id, title, artist) => set({ videoId: id, title, artist: artist || '', playing: true, currentTime: 0, duration: 0 }),

  setPlaying: (playing) => set({ playing }),

  setTime: (currentTime) => set({ currentTime }),

  setDuration: (duration) => set({ duration }),

  setVolume: (volume) => set({ volume }),

  toggleLoop: () => set((s) => ({ loop: (s.loop + 1) % 3 as 0 | 1 | 2 })),

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

  next: () => {
    const { queue, queueIdx, shuffle } = get()
    if (!queue.length) return
    const idx = shuffle ? Math.floor(Math.random() * queue.length) : (queueIdx + 1) % queue.length
    const t = queue[idx]
    if (t) set({ videoId: t.id, title: t.title, artist: t.artist || '', queueIdx: idx, playing: true, currentTime: 0, duration: 0 })
  },

  prev: () => {
    const { queue, queueIdx } = get()
    if (!queue.length) return
    const idx = queueIdx <= 0 ? queue.length - 1 : queueIdx - 1
    const t = queue[idx]
    if (t) set({ videoId: t.id, title: t.title, artist: t.artist || '', queueIdx: idx, playing: true, currentTime: 0, duration: 0 })
  },

  addToQueue: (track) => set((s) => {
    const newQ = [...s.queue, track]
    return { queue: newQ, queueIdx: s.queueIdx === -1 ? 0 : s.queueIdx }
  }),

  clear: () => set({ videoId: null, title: '', artist: '', playing: false, currentTime: 0, duration: 0, queue: [], queueIdx: -1 }),
}))
