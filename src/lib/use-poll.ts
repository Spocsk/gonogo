"use client"

import { useCallback, useEffect, useState, type SetStateAction } from "react"
import type { PublicGame } from "./types"

export function useGame(url: string | null, interval = 1600) {
  const [game, updateGame] = useState<PublicGame | null>(null)
  const [error, setError] = useState<string | null>(null)

  // A slow poll must not restore a previous question after a host action.
  const setGame = useCallback((value: SetStateAction<PublicGame | null>) => {
    updateGame((current) => {
      const incoming = typeof value === "function" ? value(current) : value
      if (current && incoming && current.pin === incoming.pin) {
        const currentRevision = current.revision ?? 0
        const incomingRevision = incoming.revision ?? 0
        if (incomingRevision < currentRevision || (incomingRevision === currentRevision && incoming.serverNow < current.serverNow)) return current
      }
      return incoming
    })
  }, [])

  useEffect(() => {
    if (!url) {
      // Disconnecting from the external session clears its last snapshot.
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
  }, [url, interval, setGame])

  return { game, error, setGame }
}
