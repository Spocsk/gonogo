"use client"

import { useEffect, useState } from "react"
import type { PublicGame } from "./types"

export function useGame(url: string | null, interval = 450) {
  const [game, setGame] = useState<PublicGame | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!url) {
      setGame(null)
      return
    }
    let cancelled = false
    const target = url

    async function tick() {
      try {
        const response = await fetch(target, { cache: "no-store" })
        const payload = await response.json()
        if (cancelled) return
        if (!response.ok) {
          setError(payload.error ?? "Lien sol perdu.")
          return
        }
        setError(null)
        setGame(payload as PublicGame)
      } catch {
        if (!cancelled) setError("Liaison sol indisponible.")
      }
    }

    void tick()
    const id = window.setInterval(() => void tick(), interval)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [url, interval])

  return { game, error, setGame }
}
