import { useEffect, useRef } from 'react'

const ORBS = [
  { color: 'rgba(10, 132, 255, 0.04)', size: 600 },
  { color: 'rgba(100, 200, 255, 0.03)', size: 400 },
  { color: 'rgba(10, 132, 255, 0.02)', size: 300 },
]

export function Background3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
    }
    window.addEventListener('mousemove', onMouseMove)

    let frame: number
    const animate = () => {
      const mx = (mouseRef.current.x - 0.5) * 2
      const my = (mouseRef.current.y - 0.5) * 2
      const orbs = container.children
      for (let i = 0; i < orbs.length; i++) {
        const orb = orbs[i] as HTMLElement
        const speed = 20 + i * 15
        const dx = mx * speed
        const dy = my * speed
        const time = Date.now() / 10000
        const driftX = Math.sin(time + i * 2) * 30
        const driftY = Math.cos(time + i * 1.5) * 30
        orb.style.transform = `translate(${dx + driftX}px, ${dy + driftY}px)`
      }
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ perspective: '800px' }}>
      {ORBS.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full will-change-transform"
          style={{
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            top: `${30 + i * 20}%`,
            left: `${20 + i * 30}%`,
            transform: `translateZ(${i * 40 - 40}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      ))}
    </div>
  )
}
