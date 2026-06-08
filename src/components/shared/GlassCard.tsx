import { cn } from '@/lib/utils'
import { type ReactNode, type HTMLAttributes } from 'react'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function GlassCard({ className, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass rounded-[var(--radius)] p-5 transition-all duration-300',
        'hover:shadow-[var(--elevation-3)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
