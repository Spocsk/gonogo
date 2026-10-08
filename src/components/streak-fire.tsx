"use client"

import { type CSSProperties } from "react"
import { useMotionPreferences } from "@/lib/use-motion-preferences"
import styles from "./streak-fire.module.css"

const FLAME_CONTOUR = "M0 80V54C9 58 14 66 21 57C26 49 19 35 27 25C26 44 43 44 43 59C53 55 53 28 68 16C61 37 77 42 77 59C88 68 92 40 88 31C110 45 98 69 120 61C125 45 120 18 140 4C126 29 151 37 149 56C167 52 164 34 174 28C171 50 187 53 190 62C204 60 204 38 216 30C210 48 223 59 232 61C246 52 232 22 251 10C243 39 267 47 264 65C280 58 274 38 284 32C283 46 298 43 299 61C313 69 318 53 323 39C325 62 337 69 346 56C351 40 340 20 358 9C348 39 374 37 371 58C389 57 391 34 402 23C398 43 416 45 416 64C429 58 425 38 440 25C434 46 450 45 453 63C469 64 467 29 484 13C475 42 493 39 496 57C506 66 515 52 514 44C526 54 526 66 538 58C547 41 539 28 554 18C548 44 566 48 567 63C581 55 585 43 582 32C595 48 591 58 600 54V80Z"

export function StreakFire({ streak }: { streak: number }) {
  const { reducedMotion, visible } = useMotionPreferences()
  if (streak < 2) return null

  const level = streak >= 8 ? 4 : streak >= 5 ? 3 : streak >= 3 ? 2 : 1
  return (
    <div
      className={styles.fire}
      data-level={level}
      data-paused={!visible || reducedMotion}
      aria-hidden="true"
      style={{ "--heat": level } as CSSProperties}
    >
      <div className={styles.edgeGlow} />
      {(["bottom", "left", "right", "top"] as const).map((side) => (
        <div key={side} className={`${styles.edge} ${styles[side]}`}>
          {[0, 1].map((layer) => (
            <svg
              key={layer}
              viewBox={side === "left" || side === "right" ? "0 0 80 600" : "0 0 600 80"}
              preserveAspectRatio="none"
              className={layer === 0 ? styles.flame : styles.core}
            >
              <g transform={side === "left" ? "translate(80 0) rotate(90)" : side === "right" ? "translate(0 600) rotate(-90)" : undefined}>
                <path d={FLAME_CONTOUR} />
              </g>
            </svg>
          ))}
        </div>
      ))}
      <div className={styles.embers}>
        {Array.from({ length: level * 4 }, (_, index) => (
          <i
            key={index}
            style={{
              "--position": `${(index * 29 + 4) % 100}%`,
              "--delay": `${-((index * 347) % 2900)}ms`,
              "--drift": `${((index * 31) % 42) - 21}px`,
              "--flight": `${45 + (index * 19) % 90}px`,
            } as CSSProperties}
          />
        ))}
      </div>
    </div>
  )
}
