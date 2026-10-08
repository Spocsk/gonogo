import assert from "node:assert/strict"
import { test } from "node:test"
import { createGame, revealNow, selectQuiz, startBrief, tickGame, toPublic } from "../src/lib/game"
import * as store from "../src/lib/store"

const ENV_KEYS = ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_URL", "KV_REST_API_TOKEN"] as const

function configureStorage(redis: boolean) {
  const previous = ENV_KEYS.map((key) => process.env[key])
  for (const key of ENV_KEYS) delete process.env[key]
  if (redis) {
    process.env.UPSTASH_REDIS_REST_URL = "https://redis.gonogo.test"
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token"
  }
  return () => ENV_KEYS.forEach((key, index) => {
    if (previous[index] === undefined) delete process.env[key]
    else process.env[key] = previous[index]
  })
}

test("memory mutations are serialized and their lock is removed after success or error", async () => {
  const restore = configureStorage(false)
  const pin = "234567"
  try {
    await store.saveGame(createGame(pin))
    await Promise.all(Array.from({ length: 10 }, () => store.withGameLock(pin, async (game) => {
      assert.ok(game)
      await Promise.resolve()
      await store.saveGame({ ...game, questionIndex: game.questionIndex + 1 })
    })))
    assert.equal((await store.getGame(pin))?.questionIndex, 10)
    await assert.rejects(store.withGameLock(pin, () => { throw new Error("fixture") }), /fixture/)
    const globalMemory = globalThis as typeof globalThis & { gonogoLocks?: Map<string, Promise<void>> }
    assert.equal(globalMemory.gonogoLocks?.has(pin), false)
    assert.equal(await store.withGameLock(pin, (game) => game?.questionIndex), 10)
  } finally {
    await store.deleteGame(pin)
    restore()
  }
})

test("durable revisions distinguish a delayed snapshot from a more recent mutation", async () => {
  const restore = configureStorage(false)
  const pin = "567890"
  try {
    const initial = createGame(pin)
    delete initial.revision // Stored sessions from before revisions start at zero.
    const first = await store.saveGame(initial)
    assert.equal(first.revision, 1)
    assert.equal(initial.revision, undefined, "saving must not mutate the caller's snapshot")
    const delayedSnapshot = await store.getGame(pin)
    assert.ok(delayedSnapshot)
    const second = await store.withGameLock(pin, async (game) => {
      assert.ok(game)
      return await store.saveGame({ ...game, questionIndex: game.questionIndex + 1 })
    })
    const delayedResponse = toPublic(delayedSnapshot, { role: "guest" }, "memory", 100_300)
    const recentResponse = toPublic(second, { role: "guest" }, "memory", 100_200)
    assert.ok(delayedResponse.serverNow > recentResponse.serverNow)
    assert.ok(delayedResponse.revision < recentResponse.revision)
    assert.equal((await store.getGame(pin))?.revision, 2)
    assert.equal(delayedSnapshot.questionIndex, 0)
  } finally {
    await store.deleteGame(pin)
    restore()
  }
})

/** REST contract fixture: concurrent store instances share only this Redis state. */
function mockRedis() {
  const values = new Map<string, string>()
  const originalFetch = globalThis.fetch
  const commands: unknown[][] = []

  function command(args: unknown[]) {
    commands.push(args)
    const operation = String(args[0]).toLowerCase()
    const key = String(args[1])
    if (operation === "set") {
      if (args.includes("nx") && values.has(key)) return null
      values.set(key, String(args[2]))
      return "OK"
    }
    if (operation === "get") return values.get(key) ?? null
    if (operation === "del") return Number(values.delete(key))
    assert.equal(operation, "eval", "fixture only accepts the store's Redis commands")
    const script = String(args[1])
    const keyCount = Number(args[2])
    const keys = args.slice(3, 3 + keyCount).map(String)
    const arguments_ = args.slice(3 + keyCount)
    // All mutating scripts must compare the lease token before touching game state.
    assert.match(script, /redis\.call\('GET', KEYS\[1\]\)/)
    assert.match(script, /ARGV\[1\]/)
    if (values.get(keys[0]) !== arguments_[0]) return 0
    if (script.includes("redis.call('SET'")) {
      assert.equal(keyCount, 2)
      const serialized = String(arguments_[1])
      assert.equal(JSON.parse(serialized).pin, keys[1].split(":").at(-1))
      assert.ok(Number(arguments_[2]) > 0)
      values.set(keys[1], serialized)
      return 1
    }
    if (keyCount === 2) {
      values.delete(keys[1])
      return 1
    }
    return Number(values.delete(keys[0]))
  }

  globalThis.fetch = async (_input, init) => {
    const args = JSON.parse(String(init?.body)) as unknown[]
    const encoded = (result: unknown) => ({
      result: typeof result === "string" ? Buffer.from(result).toString("base64") : result,
    })
    const result = Array.isArray(args[0])
      ? args.map((entry) => encoded(command(entry as unknown[])))
      : encoded(command(args))
    return Response.json(result)
  }
  return { values, commands, restore: () => { globalThis.fetch = originalFetch } }
}

test("independent Redis store instances serialize progression instead of double advancing", async () => {
  const restoreEnv = configureStorage(true)
  const redis = mockRedis()
  const pin = "345678"
  try {
    // A fresh module has its own AsyncLocalStorage and no shared process lock.
    delete require.cache[require.resolve("../src/lib/store")]
    const otherStore = await import("../src/lib/store")
    const game = revealNow(startBrief(selectQuiz(createGame(pin), "odyssey"), 100_000), 100_000)
    await store.saveGame(game)
    await Promise.all([store, otherStore].map((instance) => instance.withGameLock(pin, async (current) => {
      assert.ok(current)
      await new Promise((resolve) => setTimeout(resolve, 100))
      const ticked = tickGame(current, 110_000)
      if (ticked !== current) await instance.saveGame(ticked)
    })))
    const next = await store.getGame(pin)
    assert.equal(next?.questionIndex, 1)
    assert.equal(next?.questionStartedAt, 110_000)
    assert.equal(redis.values.has(`gonogo:lock:${pin}`), false)
    assert.ok(redis.commands.some((command) => command[0] === "eval"))
  } finally {
    redis.restore()
    restoreEnv()
  }
})

test("an expired Redis lease cannot overwrite game state or release the newer lock", async () => {
  const restoreEnv = configureStorage(true)
  const redis = mockRedis()
  const pin = "456789"
  try {
    await store.saveGame(createGame(pin))
    await assert.rejects(store.withGameLock(pin, async (game) => {
      assert.ok(game)
      // Simulate lease expiration followed by another server acquiring it.
      redis.values.set(`gonogo:lock:${pin}`, "new-holder")
      await store.saveGame({ ...game, questionIndex: 99 })
    }), /session a changé/)
    assert.equal((await store.getGame(pin))?.questionIndex, 0)
    assert.equal(redis.values.get(`gonogo:lock:${pin}`), "new-holder")
    redis.values.delete(`gonogo:lock:${pin}`)
    await assert.rejects(store.withGameLock(pin, async () => {
      redis.values.set(`gonogo:lock:${pin}`, "another-holder")
      await store.deleteGame(pin)
    }), /session a changé/)
    assert.ok(await store.getGame(pin))
    assert.equal(redis.values.get(`gonogo:lock:${pin}`), "another-holder")
  } finally {
    redis.restore()
    restoreEnv()
  }
})
