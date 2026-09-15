"use client"

import { useEffect, useState } from "react"
import type { PublicGame } from "./types"

export function useGame(url: string | null, interval = 1600) {
  const [game, setGame] = useState<PublicGame | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!url) {
      setGame(null)
      return
    }
    let cancelled = false
    let inFlight = false
    const target = url

    async function tick() {
      if (cancelled || inFlight) return
      if (typeof document !== "undefined" && document.hidden) return
      inFlight = true
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
      } finally {
        inFlight = false
      }
    }

    void tick()
    const id = window.setInterval(() => void tick(), interval)
    function onVisible() {
      if (!document.hidden) void tick()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      cancelled = true
      window.clearInterval(id)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [url, interval])

  return { game, error, setGame }
}
