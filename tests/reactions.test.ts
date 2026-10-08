import assert from "node:assert/strict"
import { test } from "node:test"
import { fetchReactionGif, parseReactionGif, type ReactionOutcome } from "../src/lib/reaction-gifs"

const MEDIA_URL = "https://static1.klipy.com/media/demo/tiny.gif?fixture=1&format=tinygif"
const MP4_URL = "https://static2.klipy.com/media/demo/tiny.mp4?fixture=1&format=tinymp4"

function payload(mediaFormats: Record<string, unknown> = { tinygif: { url: MEDIA_URL } }) {
  return {
    results: [{
      title: "Funny reaction GIF",
      itemurl: "https://klipy.com/gifs/demo",
      media_formats: mediaFormats,
    }],
  }
}

function configureApiKey(value?: string) {
  const previous = process.env.NEXT_PUBLIC_KLIPY_API_KEY
  if (value === undefined) delete process.env.NEXT_PUBLIC_KLIPY_API_KEY
  else process.env.NEXT_PUBLIC_KLIPY_API_KEY = value
  return () => {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_KLIPY_API_KEY
    else process.env.NEXT_PUBLIC_KLIPY_API_KEY = previous
  }
}

test("empty or malformed provider metadata falls back to local effects", () => {
  for (const value of [
    null, undefined, [], {}, { results: [] }, { results: [null] }, { results: {} }, payload({}),
    { data: [{ images: { fixed_height: { url: "https://media.giphy.com/media/demo.gif" } } }] },
  ]) {
    assert.equal(parseReactionGif(value), null)
  }
})

test("the first KLIPY result uses a tiny MP4 and preserves every provider URL parameter", () => {
  const result = parseReactionGif(payload({
    tinymp4: { url: MP4_URL },
    mp4: { url: "https://static.klipy.com/media/demo/larger.mp4" },
    tinygif: { url: MEDIA_URL },
  }))
  assert.deepEqual(result, {
    url: MP4_URL,
    format: "mp4",
    title: "Funny reaction GIF",
    provider: "klipy",
    sourceUrl: "https://klipy.com/gifs/demo",
  })
})

test("missing renditions fall back from MP4 to tiny GIF then GIF", () => {
  assert.equal(parseReactionGif(payload())?.url, MEDIA_URL)
  assert.equal(parseReactionGif(payload())?.format, "gif")
  const largerMp4 = "https://static.klipy.com/media/demo/larger.mp4?fixture=2"
  const mp4 = parseReactionGif(payload({
    mp4: { url: largerMp4 },
    tinygif: { url: MEDIA_URL },
  }))
  assert.equal(mp4?.url, largerMp4)
  assert.equal(mp4?.format, "mp4")
  const fullGif = "https://static.klipy.com/media/demo/full.gif?fixture=3"
  assert.equal(parseReactionGif(payload({ gif: { url: fullGif } }))?.url, fullGif)
  assert.equal(parseReactionGif(payload({ tinygif: { url: MEDIA_URL }, gif: { url: fullGif } }))?.url, MEDIA_URL)
})

test("malformed, credentialed, unexpected hosts and legacy GIPHY media are never rendered", () => {
  for (const url of [
    "not-a-url",
    "http://static.klipy.com/media/demo.gif",
    "https://static.klipy.com.example.org/media/demo.gif",
    "https://fakeklipy.com/media/demo.gif",
    "https://media.klipy.com/media/demo.gif",
    "https://klipy.com/media/demo.gif",
    "https://user:password@static.klipy.com/media/demo.gif",
    "https://static.klipy.com:8443/media/demo.gif",
    "https://media2.giphy.com/media/demo/200.gif",
    "javascript:alert(1)",
  ]) {
    assert.equal(parseReactionGif(payload({ tinygif: { url } })), null)
  }
})

test("source links allow only KLIPY pages and otherwise use the provider home page", () => {
  for (const itemurl of [
    "http://klipy.com/gifs/demo",
    "https://static.klipy.com/media/demo.gif",
    "https://klipy.com.example.org/gifs/demo",
    "https://user:password@klipy.com/gifs/demo",
    "https://klipy.com:8443/gifs/demo",
    "javascript:alert(1)",
  ]) {
    const result = payload()
    result.results[0].itemurl = itemurl
    assert.equal(parseReactionGif(result)?.sourceUrl, "https://klipy.com/")
  }
  const result = payload()
  result.results[0].itemurl = "https://www.klipy.com/gifs/demo?fixture=4"
  assert.equal(parseReactionGif(result)?.sourceUrl, result.results[0].itemurl)
})

test("invalid first results and ads are never replaced by a later result", () => {
  const valid = payload().results[0]
  assert.equal(parseReactionGif({ results: [null, valid] }), null)
  assert.equal(parseReactionGif({ results: [{ ...valid, media_formats: {} }, valid] }), null)
  assert.equal(parseReactionGif({ results: [{ ...valid, type: "ad" }, valid] }), null)
})

test("missing API keys and already-aborted requests do not call KLIPY", async (context) => {
  const fetch = context.mock.method(globalThis, "fetch", async () => {
    throw new Error("must not request a GIF")
  })
  const restore = configureApiKey()
  try {
    assert.equal(await fetchReactionGif("correct", "q1", new AbortController().signal), null)
    process.env.NEXT_PUBLIC_KLIPY_API_KEY = "fixture-public-key"
    const controller = new AbortController()
    controller.abort()
    assert.equal(await fetchReactionGif("wrong", "q1", controller.signal), null)
    assert.equal(fetch.mock.callCount(), 0)
  } finally {
    restore()
  }
})

test("outcome searches call KLIPY directly with safe regional settings and uncached media metadata", async (context) => {
  const requests: URL[] = []
  context.mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input))
    assert.equal(url.origin, "https://api.klipy.com")
    assert.equal(url.pathname, "/v2/search")
    assert.equal(url.searchParams.get("contentfilter"), "high")
    assert.equal(url.searchParams.get("country"), "FR")
    assert.equal(url.searchParams.get("locale"), "fr_FR")
    assert.equal(url.searchParams.get("media_filter"), "tinymp4,mp4,tinygif,gif")
    assert.equal(url.searchParams.get("random"), "true")
    assert.equal(url.searchParams.get("limit"), "1")
    assert.equal(init?.cache, "no-store")
    assert.equal(init?.credentials, "omit")
    requests.push(url)
    return Response.json(payload())
  })
  const restore = configureApiKey("fixture-public-key")
  try {
    for (const outcome of ["correct", "wrong", "timeout"] as ReactionOutcome[]) {
      assert.equal((await fetchReactionGif(outcome, "q1", new AbortController().signal))?.url, MEDIA_URL)
    }
    assert.match(requests[0].searchParams.get("q")!, /happy|victory|celebration/)
    assert.match(requests[1].searchParams.get("q")!, /sad|disappointed/)
    assert.match(requests[2].searchParams.get("q")!, /clock|waiting|time/)
  } finally {
    restore()
  }
})

test("rate limits, network errors and malformed JSON retain the local reaction", async (context) => {
  const restore = configureApiKey("fixture-public-key")
  try {
    for (const fixture of [
      async () => new Response(null, { status: 429 }),
      async () => { throw new TypeError("network unavailable") },
      async () => new Response("not json", { status: 200 }),
    ]) {
      const mock = context.mock.method(globalThis, "fetch", fixture)
      assert.equal(await fetchReactionGif("correct", "q1", new AbortController().signal), null)
      mock.mock.restore()
    }
  } finally {
    restore()
  }
})

test("the 1.5-second request budget aborts a stalled provider without breaking the verdict", async (context) => {
  const restore = configureApiKey("fixture-public-key")
  context.mock.method(AbortSignal, "timeout", (duration: number) => {
    assert.equal(duration, 1500)
    const controller = new AbortController()
    queueMicrotask(() => controller.abort(new DOMException("fixture timeout", "TimeoutError")))
    return controller.signal
  })
  context.mock.method(globalThis, "fetch", async (_input: string | URL | Request, init?: RequestInit) => {
    return new Promise<Response>((_resolve, reject) => {
      const signal = init!.signal!
      signal.addEventListener("abort", () => reject(signal.reason), { once: true })
    })
  })
  try {
    assert.equal(await fetchReactionGif("correct", "q1", new AbortController().signal), null)
  } finally {
    restore()
  }
})
