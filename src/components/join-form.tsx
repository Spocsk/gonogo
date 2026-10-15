"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { FormEvent, useEffect, useMemo, useState } from "react"
import { formatPin } from "./frame"

export function JoinForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [pin, setPin] = useState(params.get("pin") ?? "")
  const [nickname, setNickname] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const cleanPin = useMemo(() => pin.replace(/\D/g, "").slice(0, 6), [pin])
  const [examPin, setExamPin] = useState<string | null>(null)
  const exam = examPin === cleanPin

  useEffect(() => {
    if (cleanPin.length !== 6) return
    let cancelled = false
    // An evaluation room asks for a real name instead of a callsign.
    fetch(`/api/games/${cleanPin}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((game: { mode?: string } | null) => {
        if (!cancelled) setExamPin(game?.mode === "exam" ? cleanPin : null)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [cleanPin])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (cleanPin.length !== 6) {
      setError("Le code lien sol a 6 chiffres.")
      return
    }
    setPending(true)
    try {
      const response = await fetch(`/api/games/${cleanPin}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname }),
      })
      const payload = await response.json()
      if (!response.ok) {
        setError(payload.error ?? "Entrée refusée.")
        return
      }
      localStorage.setItem("gonogo.pin", cleanPin)
      localStorage.setItem("gonogo.playerId", payload.playerId)
      localStorage.setItem("gonogo.nickname", payload.nickname)
      router.push("/play")
    } catch {
      setError("Liaison sol indisponible.")
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-paper-dim text-sm">Code à 6 chiffres</span>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          value={formatPin(pin)}
          onChange={(event) => setPin(event.target.value)}
          placeholder="000 000"
          className="bg-ink-2 text-paper font-display text-4xl tracking-[0.18em] px-4 py-3 w-full uppercase"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-paper-dim text-sm">{exam ? "Prénom et nom" : "Callsign"}</span>
        <input
          autoComplete={exam ? "name" : "nickname"}
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="ex. Maya Chen"
          maxLength={exam ? 40 : 18}
          className="bg-ink-2 text-paper font-display text-3xl tracking-wide px-4 py-3 w-full"
        />
      </label>
      {error ? <p className="text-nogo text-base">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="bg-go text-ink font-display text-3xl tracking-wide uppercase py-4 disabled:opacity-50"
      >
        {pending ? "Connexion…" : "Entrer en salle"}
      </button>
    </form>
  )
}
