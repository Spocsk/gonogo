import { NextResponse } from "next/server"
import { createGame, createPin } from "@/lib/game"
import { pinExists, saveGame, storageKind } from "@/lib/store"

export const dynamic = "force-dynamic"

export async function POST() {
  let pin = createPin()
  let guard = 0
  while (await pinExists(pin)) {
    pin = createPin()
    guard += 1
    if (guard > 12) {
      return NextResponse.json({ error: "Impossible d’allouer un code." }, { status: 503 })
    }
  }
  const game = createGame(pin)
  await saveGame(game)
  return NextResponse.json({
    pin: game.pin,
    hostToken: game.hostToken,
    storage: storageKind(),
  })
}
