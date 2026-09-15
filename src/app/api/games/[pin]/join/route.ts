import { NextResponse } from "next/server"
import { joinPlayer, tickGame, toPublic } from "@/lib/game"
import { saveGame, storageKind, withGameLock } from "@/lib/store"

export const dynamic = "force-dynamic"
export const preferredRegion = "fra1"

type Ctx = { params: Promise<{ pin: string }> }

export async function POST(request: Request, ctx: Ctx) {
  const { pin } = await ctx.params
  let body: { nickname?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 })
  }

  try {
    const result = await withGameLock(pin, async (game) => {
      if (!game) return { status: 404 as const, error: "Lien sol introuvable." }
      const live = tickGame(game)
      const { game: next, player } = joinPlayer(live, body.nickname ?? "")
      await saveGame(next)
      return {
        status: 200 as const,
        body: {
          playerId: player.id,
          nickname: player.nickname,
          game: toPublic(next, { role: "player", playerId: player.id }, storageKind()),
        },
      }
    })

    if (result.status !== 200) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    return NextResponse.json(result.body)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Inscription impossible."
    return NextResponse.json({ error: message }, { status: 409 })
  }
}
