// 출처 : https://reactbits.dev/animations/animated-content
'use client'

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function BubbleBackground() {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bubbles = container.current?.querySelectorAll<HTMLElement>('.bubble1')
    if (!bubbles) return

    bubbles.forEach(bubble => {
      const size = gsap.utils.random(20, 80)          // 크기 랜덤
      const opacity = gsap.utils.random(0.1, 0.3)     // 불투명도 랜덤
      const leftPct = gsap.utils.random(0, 100)       // 가로 위치 랜덤(%)

      // 초기 위치 세팅: 화면 아래(음수 값), left 으로 수평 분산
      gsap.set(bubble, {
        width: size,
        height: size,
        opacity,
        bottom: -size,
        left: `${leftPct}%`,
        backgroundColor: '#9CA3AF' 
      })

      gsap.to(bubble, {
        bottom: '100%',
        duration: gsap.utils.random(6, 12),
        ease: 'none',
        repeat: -1,
        delay: gsap.utils.random(0, 5)
      })
    })
  }, [])

  return (
    <div
      ref={container}
      className="fixed inset-0 pointer-events-none overflow-hidden"
    >
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="bubble1 rounded-full absolute" />
      ))}
    </div>
  )
}