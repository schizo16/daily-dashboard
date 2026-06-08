import { useEffect, useRef } from 'react'
import { usePlayerStore } from '@/stores/player'

let apiReady = false
const readyCallbacks: (() => void)[] = []

function onYouTubeIframeAPIReady() {
  apiReady = true
  readyCallbacks.forEach(cb => cb())
  readyCallbacks.length = 0
}

if (typeof window !== 'undefined') {
  ;(window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady
  if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  }
}

function waitForAPI(): Promise<void> {
  return new Promise(resolve => {
    if (apiReady) resolve()
    else readyCallbacks.push(resolve)
  })
}

export function useYouTubePlayer(containerId: string) {
  const playerRef = useRef<any>(null)
  const { videoId, volume, setPlaying, setTime, setDuration, setTrack, next, loop, title, artist } = usePlayerStore()
  const prevIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!videoId) return
    if (videoId === prevIdRef.current && playerRef.current) return
    prevIdRef.current = videoId

    let cancelled = false

    waitForAPI().then(() => {
      if (cancelled) return
      if (playerRef.current) {
        try { playerRef.current.destroy() } catch {}
      }

      const div = document.getElementById(containerId)
      if (!div) return

      playerRef.current = new (window as any).YT.Player(containerId, {
        height: '0',
        width: '0',
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
        },
        events: {
          onReady: (e: any) => {
            e.target.setVolume(volume * 100)
            e.target.playVideo()
          },
          onStateChange: (e: any) => {
            setPlaying(e.data === 1)
            if (e.data === 1) setDuration(e.target.getDuration())
            if (e.data === 0) {
              if (loop === 2) e.target.playVideo()
              else if (loop === 1 || loop === 0) next()
            }
          },
        },
      })
    })

    return () => { cancelled = true }
  }, [videoId])

  useEffect(() => {
    if (playerRef.current) playerRef.current.setVolume(volume * 100)
  }, [volume])

  useEffect(() => {
    const id = setInterval(() => {
      try {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          setTime(playerRef.current.getCurrentTime())
        }
      } catch {}
    }, 500)
    return () => clearInterval(id)
  }, [])

  return {
    play: () => playerRef.current?.playVideo(),
    pause: () => playerRef.current?.pauseVideo(),
    seek: (t: number) => playerRef.current?.seekTo(t, true),
  }
}
