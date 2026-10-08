import { NextResponse } from "next/server"
import { answerQuestion, tickGame, toPublic } from "@/lib/game"
import { saveGame, storageKind, withGameLock } from "@/lib/store"

export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ pin: string }> }

export async function POST(request: Request, ctx: Ctx) {
  const { pin } = await ctx.params
  let body: { playerId?: string; choiceIndex?: number | null; questionId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 })
  }
  if (!body.playerId) {
    return NextResponse.json({ error: "playerId requis." }, { status: 400 })
  }
  if (body.choiceIndex != null && (!Number.isInteger(body.choiceIndex) || body.choiceIndex < 0 || body.choiceIndex > 3)) {
    return NextResponse.json({ error: "choiceIndex invalide." }, { status: 400 })
  }
  if (body.questionId != null && typeof body.questionId !== "string") {
    return NextResponse.json({ error: "questionId invalide." }, { status: 400 })
  }

  try {
    const result = await withGameLock(pin, async (game) => {
      if (!game) return { status: 404 as const, error: "Lien sol introuvable." }
      const now = Date.now()
      let live = tickGame(game, now)
      if (live !== game) live = await saveGame(live)
      const next = answerQuestion(live, body.playerId!, body.choiceIndex ?? null, now, body.questionId)
      const stored = next !== live ? await saveGame(next) : live
      return {
        status: 200 as const,
        body: toPublic(stored, { role: "player", playerId: body.playerId! }, storageKind(), now),
      }
    })
    if (result.status !== 200) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    return NextResponse.json(result.body)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Réponse refusée."
    return NextResponse.json({ error: message }, { status: 409 })
  }
}
