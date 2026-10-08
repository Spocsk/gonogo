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

export function RoundReaction(props: RoundReactionProps) {
  if (props.elapsedMs >= 3000) return null
  return <ReactionScene key={props.questionId} {...props} />
}

function ReactionScene({ questionId, outcome, points, streak, elapsedMs }: RoundReactionProps) {
  const { reducedMotion, visible } = useMotionPreferences()
  const [dismissed, setDismissed] = useState(false)
  const [gif, setGif] = useState<ReactionGif | null>(null)
  const [mediaReady, setMediaReady] = useState(false)
  const [mediaFailed, setMediaFailed] = useState(false)
  const initialElapsed = useRef(elapsedMs)
  const attempted = useRef(false)
  const copy = COPY[outcome]

  useEffect(() => {
    // This also expires during a formateur pause: the spectacle never traps the correction.
    const timer = window.setTimeout(() => setDismissed(true), Math.max(0, 3000 - initialElapsed.current))
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!visible || reducedMotion || dismissed || attempted.current) return
    const controller = new AbortController()
    // Defer until the effect is committed so React's development replay can
    // clean up its first setup without consuming this round's single request.
    void Promise.resolve().then(async () => {
      if (controller.signal.aborted || attempted.current) return
      attempted.current = true
      const result = await fetchReactionGif(outcome, questionId, controller.signal)
      if (!controller.signal.aborted) setGif(result)
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

  const showMedia = gif && !mediaFailed && !reducedMotion

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
              onLoadedData={() => setMediaReady(true)}
              onError={() => setMediaFailed(true)}
              disablePictureInPicture
              tabIndex={-1}
            />
          ) : (
            // Direct, unoptimized media preserves GIPHY's URL and avoids an optimizer proxy.
            <Image
              className={styles.media}
              data-ready={mediaReady}
              src={gif.url}
              alt=""
              fill
              unoptimized
              sizes="(max-width: 640px) 88vw, 480px"
              onLoad={() => setMediaReady(true)}
              onError={() => setMediaFailed(true)}
            />
          ) : null}
        </div>

        <p className={styles.encouragement}>
          {outcome === "correct" && streak >= 2 ? `${streak} bonnes réponses d’affilée. Tu chauffes !` : copy.encouragement}
        </p>
        {showMedia && mediaReady ? (
          <a href={gif.sourceUrl} target="_blank" rel="noopener noreferrer" className={styles.attribution}>
            <Image src="/giphy/powered-by-giphy.png" width={200} height={26} alt="Powered by GIPHY" unoptimized />
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
