'use client'

import { motion, easeInOut } from 'framer-motion'

interface Props {
  size?: number
  colorClass?: string
}

export function ThreeDotsLoader({ size = 6, colorClass = 'bg-gray-400' }: Props) {
  const dotStyle = `inline-block rounded-full ${colorClass}`
  const dim = `${size}px`

  const variants = {
    animate: (i: number) => ({
      y: [0, -4, 0],
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: easeInOut,
        delay: i * 0.12,
      },
    }),
  }

  return (
    <div className="flex items-center gap-[6px]" aria-label="loading">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={dotStyle}
          style={{ width: dim, height: dim }}
          variants={variants}
          animate="animate"
          custom={i}
        />
      ))}
    </div>
  )
}
