'use client'

import { useCallback, useRef } from 'react'

export function useSpeak() {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const clean = text.replace(/\s+/g, ' ').trim()
    if (!clean) return
    const u = new SpeechSynthesisUtterance(clean)
    u.rate = 0.9
    u.pitch = 1
    u.lang = 'en-IN'
    utteranceRef.current = u
    window.speechSynthesis.speak(u)
  }, [])

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [])

  return { speak, stop }
}
