import { Redis } from "@upstash/redis"
import type { Game } from "./types"

const TTL_SECONDS = 60 * 60 * 6
const memory = globalThis as typeof globalThis & {
  gonogoGames?: Map<string, Game>
  gonogoLocks?: Map<string, Promise<void>>
}

function memoryMap() {
  if (!memory.gonogoGames) memory.gonogoGames = new Map()
  return memory.gonogoGames
}

function lockMap() {
  if (!memory.gonogoLocks) memory.gonogoLocks = new Map()
  return memory.gonogoLocks
}

function redisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

export function storageKind(): "memory" | "redis" {
  return redisClient() ? "redis" : "memory"
}

function keyFor(pin: string) {
  return `gonogo:game:${pin}`
}

export async function getGame(pin: string): Promise<Game | null> {
  const redis = redisClient()
  if (redis) {
    const game = await redis.get<Game>(keyFor(pin))
    return game ?? null
  }
  return memoryMap().get(pin) ?? null
}

export async function saveGame(game: Game): Promise<void> {
  const redis = redisClient()
  if (redis) {
    await redis.set(keyFor(game.pin), game, { ex: TTL_SECONDS })
    return
  }
  memoryMap().set(game.pin, game)
}

export async function pinExists(pin: string): Promise<boolean> {
  return (await getGame(pin)) != null
}

export async function withGameLock<T>(
  pin: string,
  fn: (current: Game | null) => Promise<T> | T,
): Promise<T> {
  const locks = lockMap()
  const previous = locks.get(pin) ?? Promise.resolve()
  let release!: () => void
  const next = new Promise<void>((resolve) => {
    release = resolve
  })
  locks.set(
    pin,
    previous.then(() => next),
  )
  await previous
  try {
    const current = await getGame(pin)
    return await fn(current)
  } finally {
    release()
    if (locks.get(pin) === next) locks.delete(pin)
  }
}
