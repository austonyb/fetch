"use client"

import { useState, useEffect } from 'react'

export function useSafeWindow() {
  const [windowObj, setWindowObj] = useState<Window | null>(null)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  
  useEffect(() => {
    
    if (typeof window !== 'undefined') {
      setWindowObj(window)
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
      
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight
        })
      }
      
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])
  
  return { window: windowObj, ...windowSize }
}
