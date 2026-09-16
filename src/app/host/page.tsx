"use client"

import { QRCodeSVG } from "qrcode.react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Frame, formatPin } from "@/components/frame"
import { Leaderboard, Podium } from "@/components/leaderboard"
import { PADS, Shape } from "@/components/shapes"
import { useGame } from "@/lib/use-poll"
import type { PublicGame, QuizSummary } from "@/lib/types"

const HOST_PIN = "gonogo.hostPin"
const HOST_TOKEN = "gonogo.hostToken"

type AuthGate = "checking" | "locked" | "open"

export default function HostPage() {
  const router = useRouter()
  const [auth, setAuth] = useState<AuthGate>("checking")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginPending, setLoginPending] = useState(false)
  const [pin, setPin] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [bootError, setBootError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [origin, setOrigin] = useState("")
  const [leaving, setLeaving] = useState(false)
  const [quizzes, setQuizzes] = useState<QuizSummary[] | null>(null)
  const [quizzesError, setQuizzesError] = useState<string | null>(null)

  const url =
    auth === "open" && pin && token
      ? `/api/games/${pin}?token=${encodeURIComponent(token)}`
      : null
  const { game, error, setGame } = useGame(url)
  const joinUrl = origin && pin ? `${origin}/?pin=${pin}` : ""

  const lockConsole = useCallback(() => {
    setAuth("locked")
    setPin(null)
    setToken(null)
    setGame(null)
    setActionError(null)
  }, [setGame])

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    if (auth !== "open") return
    let cancelled = false
    async function loadQuizzes() {
      try {
        const response = await fetch("/api/quizzes", { cache: "no-store" })
        const payload = (await response.json()) as {
          quizzes?: QuizSummary[]
          error?: string
        }
        if (cancelled) return
        if (response.status === 401) {
          lockConsole()
          return
        }
        if (!response.ok) {
          setQuizzesError(payload.error ?? "Impossible de charger les briefs.")
          return
        }
        setQuizzesError(null)
        setQuizzes(payload.quizzes ?? [])
      } catch {
        if (!cancelled) setQuizzesError("Liaison sol indisponible.")
      }
    }
    void loadQuizzes()
    return () => {
      cancelled = true
    }
  }, [auth, lockConsole])

  useEffect(() => {
    let cancelled = false
    async function checkSession() {
      try {
        const response = await fetch("/api/host/session", { cache: "no-store" })
        if (cancelled) return
        if (response.ok) {
          setAuth("open")
          return
        }
        const payload = (await response.json()) as { error?: string }
        if (response.status === 503) {
          setLoginError(payload.error ?? "Mot de passe formateur non configuré.")
        }
        setAuth("locked")
      } catch {
        if (!cancelled) setAuth("locked")
      }
    }
    void checkSession()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (auth !== "open") return
    function onVisible() {
      if (document.hidden) return
      void fetch("/api/host/session", { cache: "no-store" }).then((response) => {
        if (!response.ok) lockConsole()
      })
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [auth, lockConsole])

  useEffect(() => {
    if (leaving || auth !== "open") return
    const existingPin = localStorage.getItem(HOST_PIN)
    const existingToken = localStorage.getItem(HOST_TOKEN)
    if (existingPin && existingToken) {
      setPin(existingPin)
      setToken(existingToken)
      return
    }
    void createSession(setPin, setToken, setBootError, lockConsole)
  }, [leaving, auth, lockConsole])

  useEffect(() => {
    if (leaving || auth !== "open") return
    if (error?.includes("non autorisée")) {
      const id = window.setTimeout(() => lockConsole(), 0)
      return () => window.clearTimeout(id)
    }
    if (error?.includes("introuvable") && pin) {
      localStorage.removeItem(HOST_PIN)
      localStorage.removeItem(HOST_TOKEN)
      void createSession(setPin, setToken, setBootError, lockConsole)
    }
  }, [error, pin, leaving, auth, lockConsole])

  const act = useCallback(
    async (action: "start" | "reveal" | "next" | "selectQuiz", quizId?: string) => {
      if (!pin || !token) return
      setActionError(null)
      const response = await fetch(`/api/games/${pin}/host`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostToken: token, action, quizId }),
      })
      const payload = await response.json()
      if (response.status === 401) {
        lockConsole()
        return
      }
      if (!response.ok) {
        setActionError(payload.error ?? "Action refusée.")
        return
      }
      setGame(payload as PublicGame)
    },
    [pin, token, setGame, lockConsole],
  )

  async function onUnlock(event: FormEvent) {
    event.preventDefault()
    setLoginError(null)
    setLoginPending(true)
    try {
      const response = await fetch("/api/host/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        setLoginError(payload.error ?? "Accès refusé.")
        return
      }
      setPassword("")
      setBootError(null)
      setAuth("open")
    } catch {
      setLoginError("Liaison sol indisponible.")
    } finally {
      setLoginPending(false)
    }
  }

  async function resetSession() {
    localStorage.removeItem(HOST_PIN)
    localStorage.removeItem(HOST_TOKEN)
    setPin(null)
    setToken(null)
    setGame(null)
    await createSession(setPin, setToken, setBootError, lockConsole)
  }

  async function abortToHome() {
    setLeaving(true)
    const currentPin = pin
    const currentToken = token
    localStorage.removeItem(HOST_PIN)
    localStorage.removeItem(HOST_TOKEN)
    setPin(null)
    setToken(null)
    setGame(null)
    if (currentPin && currentToken) {
      try {
        await fetch(`/api/games/${currentPin}/host`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hostToken: currentToken, action: "abort" }),
        })
      } catch {
        // on rentre à l'accueil même si Redis ne répond pas
      }
    }
    router.push("/")
  }

  if (leaving) {
    return (
      <main className="min-h-dvh flex items-center justify-center p-8">
        <p className="font-display text-3xl uppercase">Retour à l’accueil…</p>
      </main>
    )
  }

  if (auth !== "open") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
        <Frame className="w-full max-w-md bg-ink/70 p-6 md:p-8">
          <h1 className="font-display text-3xl uppercase tracking-wide mb-2">
            Console formateur
          </h1>
          <p className="text-paper-dim mb-6">
            Accès réservé. Entrez le mot de passe de séance.
          </p>
          {auth === "checking" ? (
            <p className="font-display text-2xl uppercase">Vérification…</p>
          ) : (
            <form onSubmit={(event) => void onUnlock(event)} className="flex flex-col gap-5">
              <label className="flex flex-col gap-2">
                <span className="text-paper-dim text-sm">Mot de passe</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  autoFocus
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="bg-ink-2 text-paper font-display text-3xl tracking-wide px-4 py-3 w-full"
                />
              </label>
              {loginError ? <p className="text-nogo text-base">{loginError}</p> : null}
              <button
                type="submit"
                disabled={loginPending || password.length === 0}
                className="bg-go text-ink font-display text-3xl tracking-wide uppercase py-4 disabled:opacity-50"
              >
                {loginPending ? "Contrôle…" : "Déverrouiller"}
              </button>
            </form>
          )}
          <p className="mt-8 text-sm text-paper-dim">
            <Link href="/" className="text-go underline-offset-4 hover:underline">
              Retour à l’accueil
            </Link>
          </p>
        </Frame>
      </main>
    )
  }

  if (bootError) {
    return (
      <main className="min-h-dvh flex items-center justify-center p-8">
        <p className="text-nogo text-xl">{bootError}</p>
      </main>
    )
  }

  if (!game || !pin) {
    return (
      <main className="min-h-dvh flex items-center justify-center p-8">
        <p className="font-display text-3xl uppercase">Ouverture de la console…</p>
      </main>
    )
  }

  return (
    <main className="min-h-dvh flex flex-col px-5 py-5 md:px-10 md:py-8 gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl uppercase leading-none">
          GO/<span className="text-go">NO-GO</span>
        </h1>
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
          {game.phase === "lobby" ? (
            <p className="font-mono text-paper-dim text-sm max-w-md text-right">
              {game.storage === "memory"
                ? "Stockage local. Sur Vercel, ajoutez Upstash Redis pour la classe."
                : "Sessions persistées."}{" "}
              <button type="button" onClick={() => void resetSession()} className="text-go">
                Nouvelle session
              </button>
            </p>
          ) : (
            <p className="font-mono tabular text-paper-dim text-sm">{formatPin(game.pin)}</p>
          )}
          <button
            type="button"
            onClick={() => void abortToHome()}
            className="font-display text-lg uppercase tracking-wide text-paper-dim hover:text-nogo"
          >
            Annuler · accueil
          </button>
        </div>
      </header>

      {game.phase === "lobby" ? (
        <Lobby
          game={game}
          joinUrl={joinUrl}
          quizzes={quizzes}
          quizzesError={quizzesError}
          onSelectQuiz={(quizId) => void act("selectQuiz", quizId)}
          onStart={() => void act("start")}
        />
      ) : null}
      {game.phase === "question" || game.phase === "reveal" ? (
        <QuestionStage
          game={game}
          onReveal={() => void act("reveal")}
          onNext={() => void act("next")}
        />
      ) : null}
      {game.phase === "podium" ? (
        <section className="flex flex-1 flex-col justify-center gap-10">
          <h2 className="font-display text-6xl uppercase">Classement final</h2>
          <Podium players={game.players} />
          <Leaderboard players={game.players} />
          <button
            type="button"
            onClick={() => void resetSession()}
            className="self-start bg-go text-ink font-display text-3xl uppercase tracking-wide px-8 py-4"
          >
            Nouvelle partie
          </button>
        </section>
      ) : null}

      {actionError ? <p className="text-nogo">{actionError}</p> : null}
    </main>
  )
}

function Lobby({
  game,
  joinUrl,
  quizzes,
  quizzesError,
  onSelectQuiz,
  onStart,
}: {
  game: PublicGame
  joinUrl: string
  quizzes: QuizSummary[] | null
  quizzesError: string | null
  onSelectQuiz: (quizId: string) => void
  onStart: () => void
}) {
  const selected = quizzes?.find((quiz) => quiz.id === game.quizId)
  const canStart = Boolean(game.quizId)

  return (
    <section className="flex flex-1 flex-col gap-10">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
        <div>
          <p className="text-paper-dim text-lg mb-3">Les opérateurs tapent ce code</p>
          <p className="font-display text-[clamp(4rem,14vw,10rem)] leading-none tracking-wide">
            {formatPin(game.pin)}
          </p>
        </div>
        <div className="flex flex-col gap-6">
          {joinUrl ? (
            <div className="flex flex-col gap-2">
              <Frame className="bg-paper p-4 w-fit text-ink">
                <QRCodeSVG value={joinUrl} size={188} bgColor="#eadfc8" fgColor="#12181f" />
              </Frame>
              <p className="font-mono text-sm text-paper-dim break-all">{joinUrl}</p>
            </div>
          ) : null}
          <Frame className="p-4 bg-ink/50">
            <p className="font-mono text-sm text-paper-dim mb-3 tabular">
              {String(game.players.length).padStart(2, "0")} callsigns
            </p>
            <ul className="flex flex-wrap gap-2">
              {game.players.map((player) => (
                <li
                  key={player.id}
                  className="font-display uppercase tracking-wide bg-ink-3 px-3 py-1 text-lg"
                >
                  {player.nickname}
                </li>
              ))}
            </ul>
          </Frame>
        </div>
      </div>

      <div>
        <p className="font-display text-2xl uppercase tracking-wide mb-2">
          Briefs disponibles
        </p>
        <p className="text-paper-dim mb-4">
          Choisissez le quizz à lancer. Les callsigns peuvent rejoindre pendant le choix.
        </p>
        {quizzesError ? <p className="text-nogo mb-4">{quizzesError}</p> : null}
        {!quizzes ? (
          <p className="font-display text-xl uppercase text-paper-dim">Chargement des briefs…</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {quizzes.map((quiz) => {
              const active = quiz.id === game.quizId
              return (
                <li key={quiz.id}>
                  <Frame className={active ? "ring-2 ring-go bg-ink/50" : "bg-ink/50"}>
                    <button
                      type="button"
                      onClick={() => onSelectQuiz(quiz.id)}
                      className="w-full text-left p-5 hover:bg-ink-3"
                    >
                      <p className="font-display text-2xl uppercase tracking-wide">{quiz.title}</p>
                      <p className="text-paper-dim mt-1">{quiz.subtitle}</p>
                      <p className="font-mono tabular text-sm text-paper-dim mt-3">
                        {quiz.days.join(" · ")} · {quiz.questionCount} questions
                      </p>
                    </button>
                  </Frame>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={onStart}
        disabled={!canStart}
        className="self-start bg-go text-ink font-display text-4xl uppercase tracking-wide px-8 py-4 disabled:opacity-40"
      >
        {canStart ? `GO · ${selected?.title ?? game.quizTitle}` : "Choisissez un brief"}
      </button>
    </section>
  )
}

function QuestionStage({
  game,
  onReveal,
  onNext,
}: {
  game: PublicGame
  onReveal: () => void
  onNext: () => void
}) {
  const question = game.question
  const remaining = useRemaining(game)
  const seconds = Math.ceil(remaining / 1000)
  const last = game.questionIndex + 1 >= game.questionCount
  const revealSent = useRef(false)

  useEffect(() => {
    revealSent.current = false
  }, [game.questionIndex])

  useEffect(() => {
    if (game.phase !== "question" || remaining > 0 || revealSent.current) return
    revealSent.current = true
    onReveal()
  }, [game.phase, remaining, onReveal])

  if (!question) return null

  return (
    <section className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="font-mono tabular text-paper-dim">
          {question.day} · {game.questionIndex + 1}/{game.questionCount}
        </p>
        <p
          className={`font-display text-6xl tabular leading-none ${
            seconds <= 5 ? "text-nogo" : "text-go"
          }`}
        >
          {String(Math.max(0, seconds)).padStart(2, "0")}
        </p>
      </div>
      <p className="max-w-5xl text-lg leading-relaxed text-paper-dim">{question.context}</p>
      <h2 className="font-display text-[clamp(1.8rem,4.2vw,3.4rem)] leading-[1.12] tracking-wide">
        {question.prompt}
      </h2>
      <ol className="grid gap-3 md:grid-cols-2">
        {question.choices.map((choice, index) => {
          const correct = question.correctIndex === index
          const revealing = game.phase === "reveal"
          return (
            <li
              key={choice.text}
              className={`flex items-start gap-4 p-4 min-h-24 ${
                revealing && correct
                  ? "ring-2 ring-go"
                  : revealing
                    ? "opacity-35"
                    : ""
              }`}
              style={{ background: PADS[index].bg, color: PADS[index].fg }}
            >
              <Shape index={index} className="size-8 shrink-0 mt-1" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-xl leading-snug font-semibold">
                  {choice.text}
                </span>
                {choice.count ? (
                  <span className="font-mono tabular text-sm">
                    {choice.count} voix
                  </span>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
      {game.phase === "reveal" && question.explanation ? (
        <p className="max-w-5xl text-lg leading-relaxed text-paper">
          <span className="font-display uppercase tracking-wide text-go">Pourquoi · </span>
          {question.explanation}
        </p>
      ) : null}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
        <p className="font-mono tabular text-paper-dim">
          {game.answeredCount}/{game.players.length} réponses
        </p>
        {game.phase === "question" ? (
          <button
            type="button"
            onClick={onReveal}
            className="bg-paper text-ink font-display text-2xl uppercase px-6 py-3"
          >
            Verdict
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="bg-go text-ink font-display text-2xl uppercase px-6 py-3"
          >
            {last ? "Classement" : "Question suivante"}
          </button>
        )}
      </div>
      {game.phase === "reveal" ? (
        <Leaderboard players={game.players} limit={5} />
      ) : null}
    </section>
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

async function createSession(
  setPin: (pin: string) => void,
  setToken: (token: string) => void,
  setError: (error: string) => void,
  onUnauthorized: () => void,
) {
  try {
    const response = await fetch("/api/games", { method: "POST" })
    const payload = await response.json()
    if (response.status === 401) {
      onUnauthorized()
      return
    }
    if (!response.ok) {
      setError(payload.error ?? "Impossible d’ouvrir une session.")
      return
    }
    localStorage.setItem(HOST_PIN, payload.pin)
    localStorage.setItem(HOST_TOKEN, payload.hostToken)
    setPin(payload.pin)
    setToken(payload.hostToken)
  } catch {
    setError("Liaison sol indisponible.")
  }
}
