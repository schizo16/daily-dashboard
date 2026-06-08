import { useCallback, useRef } from 'react'

export function useTilt(maxDeg = 6, maxZ = 12) {
  const ref = useRef<HTMLDivElement>(null)
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    ref.current.style.transform = `perspective(600px) rotateX(${y * -maxDeg}deg) rotateY(${x * maxDeg}deg) translateZ(${maxZ}px)`
    ref.current.style.transition = 'transform 0.05s ease-out'
  }, [maxDeg, maxZ])
  const onMouseLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.transform = ''
    ref.current.style.transition = 'transform 0.3s ease-out'
  }, [])
  return { ref, onMouseMove, onMouseLeave }
}
