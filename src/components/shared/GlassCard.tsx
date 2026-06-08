import { cn } from '@/lib/utils'
import { type ReactNode, type HTMLAttributes } from 'react'
import { useTilt } from '@/hooks/useTilt'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function GlassCard({ className, children, ...props }: GlassCardProps) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(4, 8)
  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn(
        'glass rounded-[var(--radius)] p-5 transition-all duration-300',
        'hover:shadow-[var(--elevation-3)]',
        className
      )}
      style={{ transformStyle: 'preserve-3d' }}
      {...props}
    >
      {children}
    </div>
  )
}
