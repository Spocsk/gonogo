import { NextResponse } from "next/server"
import { tickGame, toPublic } from "@/lib/game"
import { hasValidHostCookie } from "@/lib/host-auth"
import { getGame, saveGame, storageKind, withGameLock } from "@/lib/store"
import type { Viewer } from "@/lib/types"

export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ pin: string }> }

export async function GET(request: Request, ctx: Ctx) {
  const { pin } = await ctx.params
  const url = new URL(request.url)
  const token = url.searchParams.get("token")
  const playerId = url.searchParams.get("playerId")
  const hostView = Boolean(token) && hasValidHostCookie(request)
  const viewer: Viewer = hostView && token
    ? { role: "host", token }
    : playerId
      ? { role: "player", playerId }
      : { role: "guest" }

  const game = await getGame(pin)
  if (!game) {
    return NextResponse.json({ error: "Lien sol introuvable." }, { status: 404 })
  }

  let live = game
  let now = Date.now()
  if (tickGame(game, now) !== game) {
    try {
      const updated = await withGameLock(pin, async (current) => {
        if (!current) return null
        now = Date.now()
        const ticked = tickGame(current, now)
        return ticked !== current ? await saveGame(ticked) : current
      })
      if (!updated) {
        return NextResponse.json({ error: "Lien sol introuvable." }, { status: 404 })
      }
      live = updated
    } catch {
      return NextResponse.json({ error: "Synchronisation indisponible. Réessayez." }, { status: 503 })
    }
  }

  return NextResponse.json(toPublic(live, viewer, storageKind(), now), {
    headers: { "Cache-Control": "no-store" },
  })
}
