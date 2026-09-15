import { NextResponse } from "next/server"
import { answerQuestion, toPublic } from "@/lib/game"
import { saveGame, storageKind, withGameLock } from "@/lib/store"

export const dynamic = "force-dynamic"
export const preferredRegion = "fra1"

type Ctx = { params: Promise<{ pin: string }> }

export async function POST(request: Request, ctx: Ctx) {
  const { pin } = await ctx.params
  let body: { playerId?: string; choiceIndex?: number | null }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 })
  }
  if (!body.playerId) {
    return NextResponse.json({ error: "playerId requis." }, { status: 400 })
  }
  if (body.choiceIndex != null && typeof body.choiceIndex !== "number") {
    return NextResponse.json({ error: "choiceIndex invalide." }, { status: 400 })
  }

  try {
    const result = await withGameLock(pin, async (game) => {
      if (!game) return { status: 404 as const, error: "Lien sol introuvable." }
      const next = answerQuestion(game, body.playerId!, body.choiceIndex ?? null)
      await saveGame(next)
      return {
        status: 200 as const,
        body: toPublic(next, { role: "player", playerId: body.playerId! }, storageKind()),
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
