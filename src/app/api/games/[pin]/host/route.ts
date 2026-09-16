import { NextResponse } from "next/server"
import {
  nextQuestion,
  revealNow,
  selectQuiz,
  startBrief,
  tickGame,
  toPublic,
} from "@/lib/game"
import { hasValidHostCookie, hostUnauthorized } from "@/lib/host-auth"
import { deleteGame, saveGame, storageKind, withGameLock } from "@/lib/store"
import type { Game } from "@/lib/types"

export const dynamic = "force-dynamic"
export const preferredRegion = "fra1"

type Ctx = { params: Promise<{ pin: string }> }
type Action = "start" | "reveal" | "next" | "abort" | "selectQuiz"

export async function POST(request: Request, ctx: Ctx) {
  if (!hasValidHostCookie(request)) {
    return hostUnauthorized()
  }

  const { pin } = await ctx.params
  let body: { hostToken?: string; action?: Action; quizId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 })
  }

  try {
    const result = await withGameLock(pin, async (game) => {
      if (!game) return { status: 404 as const, error: "Lien sol introuvable." }
      if (body.hostToken !== game.hostToken) {
        return { status: 401 as const, error: "Console formateur non autorisée." }
      }
      if (body.action === "abort") {
        await deleteGame(pin)
        return { status: 200 as const, body: { aborted: true } }
      }
      const live = tickGame(game)
      let next: Game | null
      if (body.action === "start") {
        next = startBrief(live)
      } else if (body.action === "reveal") {
        next = revealNow(live)
      } else if (body.action === "next") {
        next = nextQuestion(live)
      } else if (body.action === "selectQuiz") {
        if (!body.quizId) {
          return { status: 400 as const, error: "Brief manquant." }
        }
        next = selectQuiz(live, body.quizId)
      } else {
        next = null
      }
      if (!next) return { status: 400 as const, error: "Action inconnue." }
      await saveGame(next)
      return {
        status: 200 as const,
        body: toPublic(next, { role: "host", token: game.hostToken }, storageKind()),
      }
    })
    if (result.status !== 200) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    return NextResponse.json(result.body)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action refusée."
    return NextResponse.json({ error: message }, { status: 409 })
  }
}
