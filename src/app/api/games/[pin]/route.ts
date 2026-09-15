import { NextResponse } from "next/server"
import { tickGame, toPublic } from "@/lib/game"
import { getGame, saveGame, storageKind, withGameLock } from "@/lib/store"
import type { Viewer } from "@/lib/types"

export const dynamic = "force-dynamic"
export const preferredRegion = "fra1"

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

  const game = await getGame(pin)
  if (!game) {
    return NextResponse.json({ error: "Lien sol introuvable." }, { status: 404 })
  }

  const live = tickGame(game)
  if (live !== game && viewer.role === "host") {
    await withGameLock(pin, async (current) => {
      if (!current) return
      const ticked = tickGame(current)
      if (ticked !== current) await saveGame(ticked)
    })
  }

  return NextResponse.json(toPublic(live, viewer, storageKind()))
}
