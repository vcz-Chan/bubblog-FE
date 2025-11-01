'use client'

import { useCallback, useEffect, useRef } from 'react'

const BubbleBackgroundCursor = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  const createBubble = useCallback((x: number, y: number) => {
    const container = containerRef.current
    if (!container) return

    const bubble = document.createElement('span')
    const size = Math.random() * 30 + 10 // 10px to 40px
    
    bubble.className = 'bubble-cursor'
    bubble.style.width = `${size}px`
    bubble.style.height = `${size}px`
    
    // Adjust position to center the bubble on the cursor
    bubble.style.left = `${x - container.getBoundingClientRect().left - size / 2}px`
    bubble.style.top = `${y - container.getBoundingClientRect().top - size / 2}px`

    container.appendChild(bubble)

    setTimeout(() => {
      bubble.remove()
    }, 2000) // Animation duration is 2s
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      // Throttle bubble creation
      if (Math.random() > 0.5) {
        createBubble(e.clientX, e.clientY)
      }
    },
    [createBubble],
  )

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [handleMouseMove])

  return <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden" />
}

export default BubbleBackgroundCursor