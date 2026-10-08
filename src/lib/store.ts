import { Redis } from "@upstash/redis"
import { AsyncLocalStorage } from "node:async_hooks"
import { randomUUID } from "node:crypto"
import type { Game } from "./types"

const TTL_SECONDS = 60 * 60 * 6
const LOCK_TTL_MS = 15_000
const LOCK_WAIT_MS = 5_000
const lockContext = new AsyncLocalStorage<{ pin: string; token: string }>()
const SAVE_LOCKED_GAME = `
  if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end
  redis.call('SET', KEYS[2], ARGV[2], 'EX', ARGV[3])
  return 1
`
const DELETE_LOCKED_GAME = `
  if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end
  redis.call('DEL', KEYS[2])
  return 1
`
const RELEASE_LOCK = `
  if redis.call('GET', KEYS[1]) == ARGV[1] then
    return redis.call('DEL', KEYS[1])
  end
  return 0
`
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

function lockKeyFor(pin: string) {
  return `gonogo:lock:${pin}`
}

async function redisRequest<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request()
  } catch {
    // SDK errors can embed command arguments, including host tokens and answers.
    throw new Error("Stockage indisponible. Réessayez dans un instant.")
  }
}

export async function getGame(pin: string): Promise<Game | null> {
  const redis = redisClient()
  if (redis) {
    const game = await redisRequest(() => redis.get<Game>(keyFor(pin)))
    return game ?? null
  }
  return memoryMap().get(pin) ?? null
}

export async function saveGame(game: Game): Promise<Game> {
  const stored = { ...game, revision: (game.revision ?? 0) + 1 }
  const redis = redisClient()
  if (redis) {
    const lock = lockContext.getStore()
    if (lock?.pin === game.pin) {
      // Fencing the write also rejects a lock holder whose lease expired mid-request.
      const saved = await redisRequest(() => redis.eval(
        SAVE_LOCKED_GAME,
        [lockKeyFor(game.pin), keyFor(game.pin)],
        [lock.token, stored, TTL_SECONDS],
      ))
      if (saved !== 1) throw new Error("La session a changé. Réessayez l’action.")
      return stored
    }
    await redisRequest(() => redis.set(keyFor(game.pin), stored, { ex: TTL_SECONDS }))
    return stored
  }
  memoryMap().set(game.pin, stored)
  return stored
}

export async function deleteGame(pin: string): Promise<void> {
  const redis = redisClient()
  if (redis) {
    const lock = lockContext.getStore()
    if (lock?.pin === pin) {
      const deleted = await redisRequest(() => redis.eval(
        DELETE_LOCKED_GAME,
        [lockKeyFor(pin), keyFor(pin)],
        [lock.token],
      ))
      if (deleted !== 1) throw new Error("La session a changé. Réessayez l’action.")
      return
    }
    await redisRequest(() => redis.del(keyFor(pin)))
    return
  }
  memoryMap().delete(pin)
}

export async function pinExists(pin: string): Promise<boolean> {
  return (await getGame(pin)) != null
}

export async function withGameLock<T>(
  pin: string,
  fn: (current: Game | null) => Promise<T> | T,
): Promise<T> {
  const redis = redisClient()
  if (redis) {
    const token = randomUUID()
    const deadline = Date.now() + LOCK_WAIT_MS
    let acquired = false
    while (!acquired && Date.now() < deadline) {
      acquired = await redisRequest(() => redis.set(lockKeyFor(pin), token, { nx: true, px: LOCK_TTL_MS })) === "OK"
      if (!acquired) await new Promise((resolve) => setTimeout(resolve, 30 + Math.random() * 50))
    }
    if (!acquired) throw new Error("La session est occupée. Réessayez dans un instant.")
    try {
      return await lockContext.run({ pin, token }, async () => {
        const current = await getGame(pin)
        return await fn(current)
      })
    } finally {
      // A delayed request must never release a newer request's lock.
      await redisRequest(() => redis.eval(RELEASE_LOCK, [lockKeyFor(pin)], [token]))
    }
  }
  const locks = lockMap()
  const previous = locks.get(pin) ?? Promise.resolve()
  let release!: () => void
  const next = new Promise<void>((resolve) => {
    release = resolve
  })
  const queued = previous.then(() => next)
  locks.set(pin, queued)
  await previous
  try {
    const current = await getGame(pin)
    return await fn(current)
  } finally {
    release()
    if (locks.get(pin) === queued) locks.delete(pin)
  }
}
