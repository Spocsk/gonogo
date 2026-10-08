"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import Image from "next/image"
import { fetchReactionGif, type ReactionGif, type ReactionOutcome } from "@/lib/reaction-gifs"
import { useMotionPreferences } from "@/lib/use-motion-preferences"
import styles from "./round-reaction.module.css"

export type RoundReactionProps = {
  questionId: string
  outcome: ReactionOutcome
  points: number
  streak: number
  elapsedMs: number
}

const COPY = {
  correct: { heading: "GO !", description: "Bonne réponse", encouragement: "Bien joué." },
  wrong: { heading: "NO-GO…", description: "Mauvaise réponse", encouragement: "La prochaine sera la bonne." },
  timeout: { heading: "Trop tard !", description: "Temps écoulé", encouragement: "On se rattrape au prochain round." },
} as const

const MEDIA_LOAD_WINDOW_MS = 3000
const REACTION_DISPLAY_MS = 5000
const REACTION_MAX_MS = MEDIA_LOAD_WINDOW_MS + REACTION_DISPLAY_MS

export function RoundReaction(props: RoundReactionProps) {
  if (props.elapsedMs >= REACTION_MAX_MS) return null
  return <ReactionScene key={props.questionId} {...props} />
}

function ReactionScene({ questionId, outcome, points, streak, elapsedMs }: RoundReactionProps) {
  const { reducedMotion, visible } = useMotionPreferences()
  // Do not replay a reaction for someone joining an already-revealed round.
  const [dismissed, setDismissed] = useState(() => elapsedMs >= MEDIA_LOAD_WINDOW_MS)
  const [gif, setGif] = useState<ReactionGif | null>(null)
  const [mediaStatus, setMediaStatus] = useState<"loading" | "playing" | "fallback">("loading")
  const initialElapsed = useRef(elapsedMs)
  const mountedAt = useRef<number | null>(null)
  const displayStartedAt = useRef<number | null>(null)
  const attempted = useRef(false)
  const copy = COPY[outcome]

  useEffect(() => {
    if (dismissed) return
    // Both deadlines keep running during a formateur pause, and survive effect replay.
    mountedAt.current ??= performance.now()
    const age = initialElapsed.current + performance.now() - mountedAt.current
    const stop = window.setTimeout(() => setDismissed(true), Math.max(0, REACTION_MAX_MS - age))
    const loading = window.setTimeout(() => {
      // Never flash a late GIF for just the tail of the reaction window.
      setMediaStatus(current => current === "loading" ? "fallback" : current)
    }, Math.max(0, MEDIA_LOAD_WINDOW_MS - age))
    return () => {
      window.clearTimeout(stop)
      window.clearTimeout(loading)
    }
  }, [dismissed])

  useEffect(() => {
    if (dismissed || !visible || (mediaStatus === "loading" && !reducedMotion)) return
    // Start only once the media actually plays, or when local effects take over.
    // Buffering, repeated playing events and tab changes cannot restart the clock.
    displayStartedAt.current ??= performance.now()
    const remaining = REACTION_DISPLAY_MS - (performance.now() - displayStartedAt.current)
    const timer = window.setTimeout(() => setDismissed(true), Math.max(0, remaining))
    return () => window.clearTimeout(timer)
  }, [mediaStatus, reducedMotion, visible, dismissed])

  useEffect(() => {
    if (!visible || reducedMotion || dismissed || attempted.current) return
    const controller = new AbortController()
    // Defer until the effect is committed so React's development replay can
    // clean up its first setup without consuming this round's single request.
    void Promise.resolve().then(async () => {
      if (controller.signal.aborted || attempted.current) return
      attempted.current = true
      const result = await fetchReactionGif(outcome, questionId, controller.signal)
      if (!controller.signal.aborted) {
        setGif(result)
        if (!result) setMediaStatus(current => current === "loading" ? "fallback" : current)
      }
    })
    return () => controller.abort()
  }, [questionId, outcome, visible, reducedMotion, dismissed])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setDismissed(true)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  if (dismissed || !visible) return null

  const mediaReady = mediaStatus === "playing"
  const showMedia = gif && mediaStatus !== "fallback" && !reducedMotion

  function onMediaReady() {
    const age = initialElapsed.current + performance.now() - (mountedAt.current ?? performance.now())
    setMediaStatus(current => current === "loading"
      ? age < MEDIA_LOAD_WINDOW_MS ? "playing" : "fallback"
      : current)
  }

  return (
    <div className={styles.reaction} data-outcome={outcome} data-quiet={reducedMotion}>
      <div className={styles.lights} aria-hidden="true">
        <div className={styles.halo} />
        <div className={styles.beam} />
        <div className={styles.beam} />
        <div className={styles.orbit} />
        {Array.from({ length: outcome === "correct" ? 28 : 12 }, (_, index) => (
          <i
            key={index}
            className={styles.particle}
            style={{
              "--x": `${(index * 37 + 11) % 100}%`,
              "--drift": `${((index * 43) % 160) - 80}px`,
              "--delay": `${(index % 7) * 65}ms`,
              "--turn": `${(index * 97) % 360}deg`,
              "--color": ["#e0b25a", "#fff1bd", "#6ec9c4", "#e98449"][index % 4],
            } as CSSProperties}
          />
        ))}
      </div>

      <div className={styles.content}>
        <div role="status" aria-live="polite" aria-atomic="true" className={styles.verdict}>
          <h2 className={styles.heading}>{copy.heading}</h2>
          <p className={styles.result}>
            {outcome === "correct" ? `+${points} points` : copy.description}
          </p>
        </div>

        <div className={styles.stage} aria-hidden="true">
          <div className={styles.localMark} data-covered={Boolean(showMedia && mediaReady)}>
            <span className={styles.signalRing} />
            <svg viewBox="0 0 160 160" className={styles.signal} fill="none">
              {outcome === "correct" ? (
                <path d="m36 83 28 28 60-62" />
              ) : outcome === "wrong" ? (
                <path d="m49 49 62 62m0-62-62 62" />
              ) : (
                <>
                  <circle cx="80" cy="80" r="46" />
                  <path d="M80 50v32l21 13" />
                </>
              )}
            </svg>
          </div>
          {showMedia ? gif.format === "mp4" ? (
            <video
              className={styles.media}
              data-ready={mediaReady}
              src={gif.url}
              autoPlay
              muted
              playsInline
              loop
              preload="auto"
              onPlaying={onMediaReady}
              onError={() => setMediaStatus("fallback")}
              disablePictureInPicture
              tabIndex={-1}
            />
          ) : (
            // Direct, unoptimized media preserves KLIPY's URL and avoids an optimizer proxy.
            <Image
              className={styles.media}
              data-ready={mediaReady}
              src={gif.url}
              alt=""
              fill
              unoptimized
              sizes="(max-width: 640px) 88vw, 480px"
              onLoad={onMediaReady}
              onError={() => setMediaStatus("fallback")}
            />
          ) : null}
        </div>

        <p className={styles.encouragement}>
          {outcome === "correct" && streak >= 2 ? `${streak} bonnes réponses d’affilée. Tu chauffes !` : copy.encouragement}
        </p>
        {showMedia && mediaReady ? (
          <a href={gif.sourceUrl} target="_blank" rel="noopener noreferrer" className={styles.attribution}>
            Powered by KLIPY
          </a>
        ) : null}
        <button type="button" className={styles.skip} onClick={() => setDismissed(true)}>
          Voir le corrigé
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-5-5 5 5-5 5" /></svg>
        </button>
      </div>
    </div>
  )
}
