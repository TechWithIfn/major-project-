'use client'

import { useState, useCallback } from 'react'

export function useVoiceInput(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startListening = useCallback(() => {
    setError(null)
    const Win = typeof window !== 'undefined' ? window : null
    const SR = Win && (Win.SpeechRecognition || (Win as unknown as { webkitSpeechRecognition?: unknown })['webkitSpeechRecognition'])
    if (!SR) {
      setError('Voice input is not supported in this browser. Try Chrome or Edge.')
      return
    }
    const recognition = new (SR as new () => SpeechRecognition)()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-IN'

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = (e) => {
      setIsListening(false)
      setError(e.error === 'not-allowed' ? 'Microphone access denied.' : 'Voice input failed. Try again.')
    }
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(' ')
        .trim()
      if (transcript) onResult(transcript)
    }
    recognition.start()
  }, [onResult])

  const stopListening = useCallback(() => {
    setIsListening(false)
  }, [])

  return { isListening, error, startListening, stopListening }
}
