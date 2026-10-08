"use client"

import { useSyncExternalStore } from "react"

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange)
  return () => document.removeEventListener("visibilitychange", onChange)
}

// Start with a quiet frame until browser preferences are known after hydration.
export function useMotionPreferences() {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true,
  )
  const visible = useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "visible",
    () => false,
  )
  return { reducedMotion, visible }
}
