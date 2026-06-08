import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

const variants = {
  enter: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 24 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
}

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div variants={variants} initial="exit" animate="enter" exit="exit">
      {children}
    </motion.div>
  )
}
