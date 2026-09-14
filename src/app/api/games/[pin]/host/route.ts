import { NextResponse } from "next/server"
import { nextQuestion, revealNow, startBrief, tickGame, toPublic } from "@/lib/game"
import { saveGame, storageKind, withGameLock } from "@/lib/store"

export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ pin: string }> }
type Action = "start" | "reveal" | "next"

export async function POST(request: Request, ctx: Ctx) {
  const { pin } = await ctx.params
  let body: { hostToken?: string; action?: Action }
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
      const live = tickGame(game)
      const next =
        body.action === "start"
          ? startBrief(live)
          : body.action === "reveal"
            ? revealNow(live)
            : body.action === "next"
              ? nextQuestion(live)
              : null
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
