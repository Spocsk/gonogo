import { NextResponse } from "next/server"
import { tickGame, toPublic } from "@/lib/game"
import { saveGame, storageKind, withGameLock } from "@/lib/store"
import type { Viewer } from "@/lib/types"

export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ pin: string }> }

export async function GET(request: Request, ctx: Ctx) {
  const { pin } = await ctx.params
  const url = new URL(request.url)
  const token = url.searchParams.get("token")
  const playerId = url.searchParams.get("playerId")
  const viewer: Viewer = token
    ? { role: "host", token }
    : playerId
      ? { role: "player", playerId }
      : { role: "guest" }

  const result = await withGameLock(pin, async (game) => {
    if (!game) return null
    const live = tickGame(game)
    if (live !== game) await saveGame(live)
    return toPublic(live, viewer, storageKind())
  })

  if (!result) {
    return NextResponse.json({ error: "Lien sol introuvable." }, { status: 404 })
  }
  return NextResponse.json(result)
}
