"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { PADS, Shape } from "@/components/shapes"
import { Podium } from "@/components/leaderboard"
import { useGame } from "@/lib/use-poll"
import type { PublicGame } from "@/lib/types"

export default function PlayPage() {
  const [pin, setPin] = useState<string | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setPin(localStorage.getItem("gonogo.pin"))
    setPlayerId(localStorage.getItem("gonogo.playerId"))
    setReady(true)
  }, [])

  const url =
    pin && playerId
      ? `/api/games/${pin}?playerId=${encodeURIComponent(playerId)}`
      : null
  const { game, error, setGame } = useGame(url)

  const pick = useCallback(
    async (choiceIndex: number) => {
      if (!pin || !playerId || !game || game.phase !== "question") return
      const nextChoice = game.yourChoiceIndex === choiceIndex ? null : choiceIndex
      const response = await fetch(`/api/games/${pin}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, choiceIndex: nextChoice }),
      })
      const payload = await response.json()
      if (response.ok) setGame(payload as PublicGame)
    },
    [pin, playerId, game, setGame],
  )

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const map: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3 }
      if (event.key in map) void pick(map[event.key])
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [pick])

  if (!ready) return null

  if (!pin || !playerId) {
    return (
      <main className="min-h-dvh flex items-center justify-center p-8">
        <p className="text-lg">
          Pas de callsign en mémoire.{" "}
          <Link href="/" className="text-go underline-offset-4 hover:underline">
            Rejoindre le brief
          </Link>
        </p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-dvh flex items-center justify-center p-8">
        <p className="text-nogo text-xl">{error}</p>
      </main>
    )
  }

  if (!game) {
    return (
      <main className="min-h-dvh flex items-center justify-center p-8">
        <p className="font-display text-3xl uppercase">Sync…</p>
      </main>
    )
  }

  if (game.phase === "lobby") {
    return (
      <main className="min-h-dvh flex flex-col justify-end p-6 pb-12">
        <p className="font-mono text-paper-dim tabular">{game.pin.slice(0, 3)} {game.pin.slice(3)}</p>
        <h1 className="font-display text-6xl uppercase mt-4 leading-none">
          {game.you?.nickname}
        </h1>
        <p className="mt-6 text-xl text-paper-dim">Callsign locké. En attente du GO.</p>
      </main>
    )
  }

  if (game.phase === "podium") {
    const rank = game.players.findIndex((p) => p.id === playerId) + 1
    return (
      <main className="min-h-dvh flex flex-col gap-8 p-6 py-10">
        <h1 className="font-display text-5xl uppercase">
          {rank === 1 ? "GO" : "Brief clos"}
        </h1>
        <p className="text-xl text-paper-dim">
          {game.you?.nickname} · {game.you?.score ?? 0} pts · place {rank || "—"}
        </p>
        <Podium players={game.players} />
        <Link
          href="/"
          onClick={() => {
            localStorage.removeItem("gonogo.pin")
            localStorage.removeItem("gonogo.playerId")
            localStorage.removeItem("gonogo.nickname")
          }}
          className="self-start bg-go text-ink font-display text-2xl uppercase tracking-wide px-6 py-3"
        >
          Nouvelle partie
        </Link>
      </main>
    )
  }

  return <PlayQuestion game={game} onPick={pick} />
}

function PlayQuestion({
  game,
  onPick,
}: {
  game: PublicGame
  onPick: (index: number) => void
}) {
  const remaining = useRemaining(game)
  const seconds = Math.ceil(remaining / 1000)
  const question = game.question
  const timedOut = remaining <= 0
  const locked = game.phase === "reveal" || timedOut

  if (!question) return null

  return (
    <main className="min-h-dvh flex flex-col">
      <header className="flex items-end justify-between px-4 pt-4 pb-2">
        <p className="font-display text-2xl uppercase truncate max-w-[70%]">
          {game.you?.nickname}
        </p>
        <p className={`font-display text-4xl tabular ${seconds <= 5 ? "text-nogo" : "text-go"}`}>
          {String(Math.max(0, seconds)).padStart(2, "0")}
        </p>
      </header>
      <div className="px-4 pb-3 flex flex-col gap-2">
        <p className="text-sm leading-snug text-paper-dim">{question.context}</p>
        <p className="text-base leading-snug text-paper font-semibold">{question.prompt}</p>
      </div>
      <div className="grid grid-cols-2 grid-rows-2 flex-1 gap-2 p-2">
        {question.choices.map((choice, index) => {
          const selected = game.yourChoiceIndex === index
          const correct = question.correctIndex === index
          const revealing = game.phase === "reveal"
          return (
            <button
              key={choice.text}
              type="button"
              disabled={locked}
              onClick={() => onPick(index)}
              className="flex flex-col items-start justify-between p-4 text-left disabled:cursor-default touch-manipulation"
              style={{
                background: PADS[index].bg,
                color: PADS[index].fg,
                outline: selected ? "3px solid #eadfc8" : undefined,
                opacity: revealing && !correct && !selected ? 0.45 : 1,
              }}
            >
              <Shape index={index} className="size-10" />
              <span className="font-sans normal-case text-lg font-semibold leading-snug">
                {choice.text}
              </span>
            </button>
          )
        })}
      </div>
      {game.phase === "reveal" ? (
        <div className="px-4 py-4 pb-10 flex flex-col gap-3">
          <p
            className={`text-center font-display text-3xl tracking-wide ${
              game.you?.lastCorrect ? "text-go" : "text-nogo"
            }`}
          >
            {game.you?.lastCorrect
              ? `GO · +${game.you.lastPoints ?? 0}`
              : game.you?.answered
                ? "NO-GO"
                : "Sans réponse"}
          </p>
          {question.explanation ? (
            <p className="text-sm leading-relaxed text-paper-dim text-left">
              {question.explanation}
            </p>
          ) : null}
        </div>
      ) : timedOut ? (
        <p className="px-4 py-4 pb-10 text-center text-paper-dim">Temps écoulé.</p>
      ) : game.you?.answered ? (
        <p className="px-4 py-4 pb-10 text-center text-paper-dim">
          Réponse transmise. Retoucher le pad pour annuler.
        </p>
      ) : null}
    </main>
  )
}

function useRemaining(game: PublicGame) {
  const [now, setNow] = useState(() => Date.now())
  const snapshot = useMemo(
    () => ({ remaining: game.remainingMs, at: Date.now() }),
    [game.remainingMs, game.questionStartedAt, game.phase],
  )
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 200)
    return () => window.clearInterval(id)
  }, [])
  return Math.max(0, snapshot.remaining - (now - snapshot.at))
}
