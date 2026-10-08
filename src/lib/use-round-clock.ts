"use client"

import { useEffect, useState } from "react"
import type { PublicGame } from "./types"

// Anchor each server snapshot to its arrival, rather than the device's clock.
export function useRoundClock(game: PublicGame) {
  const { serverNow, remainingMs, revealRemainingMs, revealPaused } = game
  const [clock, setClock] = useState({ serverNow, questionRemaining: remainingMs, revealRemaining: revealRemainingMs })

  useEffect(() => {
    const observedAt = Date.now()
    function tick() {
      const elapsed = Math.max(0, Date.now() - observedAt)
      setClock({
        serverNow,
        questionRemaining: Math.max(0, remainingMs - elapsed),
        revealRemaining: Math.max(0, revealRemainingMs - (revealPaused ? 0 : elapsed)),
      })
    }
    const frame = window.requestAnimationFrame(tick)
    const interval = window.setInterval(tick, 200)
    return () => {
      window.cancelAnimationFrame(frame)
      window.clearInterval(interval)
    }
  }, [serverNow, remainingMs, revealRemainingMs, revealPaused])

  return clock.serverNow === serverNow
    ? clock
    : { questionRemaining: remainingMs, revealRemaining: revealRemainingMs }
}
