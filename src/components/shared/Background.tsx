import { useEffect, useState } from "react"
import { MeshGradient } from "@paper-design/shaders-react"

export function Background() {
  const [mounted, setMounted] = useState(false)
  const [dims, setDims] = useState({ width: 1920, height: 1080 })

  useEffect(() => {
    setMounted(true)
    const update = () => setDims({ width: window.innerWidth, height: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {mounted && (
        <>
          <MeshGradient width={dims.width} height={dims.height} colors={['#000000', '#1c1c1e', '#2c2c2e', '#0a84ff', '#1c1c1e']} distortion={0.5} swirl={0.3} speed={0.25} offsetX={0.05} />
          <div className="absolute inset-0 pointer-events-none bg-black/50" />
        </>
      )}
    </div>
  )
}
