import assert from "node:assert/strict"
import { test } from "node:test"
import { fetchReactionGif, parseReactionGif, type ReactionOutcome } from "../src/lib/reaction-gifs"

const MEDIA_URL = "https://media2.giphy.com/media/demo/200.gif?cid=fixture&rid=200.gif&ct=g"
const MP4_URL = "https://media2.giphy.com/media/demo/small.mp4?cid=fixture&rid=small.mp4&ct=g"

function payload(images: Record<string, unknown> = { fixed_height: { url: MEDIA_URL } }) {
  return {
    data: [{
      title: "Funny reaction GIF",
      url: "https://giphy.com/gifs/funny-demo",
      images,
    }],
  }
}

function configureApiKey(value?: string) {
  const previous = process.env.NEXT_PUBLIC_GIPHY_API_KEY
  if (value === undefined) delete process.env.NEXT_PUBLIC_GIPHY_API_KEY
  else process.env.NEXT_PUBLIC_GIPHY_API_KEY = value
  return () => {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_GIPHY_API_KEY
    else process.env.NEXT_PUBLIC_GIPHY_API_KEY = previous
  }
}

test("empty or malformed provider metadata falls back to local effects", () => {
  for (const value of [null, undefined, [], {}, { data: [] }, { data: [null] }, { data: {} }, payload({})]) {
    assert.equal(parseReactionGif(value), null)
  }
})

test("the first GIPHY result uses a small MP4 and preserves every provider URL parameter", () => {
  const result = parseReactionGif(payload({
    downsized_small: { mp4: MP4_URL },
    fixed_height: { url: MEDIA_URL, mp4: "https://media2.giphy.com/media/demo/larger.mp4" },
  }))
  assert.deepEqual(result, {
    url: MP4_URL,
    format: "mp4",
    title: "Funny reaction GIF",
    provider: "giphy",
    sourceUrl: "https://giphy.com/gifs/funny-demo",
  })
})

test("missing MP4 renditions fall back to a downsized GIF then the fixed-height GIF", () => {
  assert.equal(parseReactionGif(payload())?.url, MEDIA_URL)
  assert.equal(parseReactionGif(payload())?.format, "gif")
  const downsized = "https://media.giphy.com/media/demo/downsized.gif?ct=g"
  assert.equal(parseReactionGif(payload({
    downsized: { url: downsized },
    fixed_height: { url: MEDIA_URL },
  }))?.url, downsized)
})

test("malformed, credentialed and non-GIPHY media URLs are never rendered", () => {
  for (const url of [
    "not-a-url",
    "http://media.giphy.com/media/demo.gif",
    "https://giphy.com.example.org/media/demo.gif",
    "https://fakegiphy.com/media/demo.gif",
    "https://user:password@media.giphy.com/media/demo.gif",
    "https://media.giphy.com:8443/media/demo.gif",
    "javascript:alert(1)",
  ]) {
    assert.equal(parseReactionGif(payload({ fixed_height: { url } })), null)
  }
})

test("missing API keys and already-aborted requests do not call GIPHY", async (context) => {
  const fetch = context.mock.method(globalThis, "fetch", async () => {
    throw new Error("must not request a GIF")
  })
  const restore = configureApiKey()
  try {
    assert.equal(await fetchReactionGif("correct", "q1", new AbortController().signal), null)
    process.env.NEXT_PUBLIC_GIPHY_API_KEY = "fixture-public-key"
    const controller = new AbortController()
    controller.abort()
    assert.equal(await fetchReactionGif("wrong", "q1", controller.signal), null)
    assert.equal(fetch.mock.callCount(), 0)
  } finally {
    restore()
  }
})

test("outcome searches are direct, rated G, English and uncached", async (context) => {
  const requests: URL[] = []
  context.mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input))
    assert.equal(url.origin, "https://api.giphy.com")
    assert.equal(url.pathname, "/v1/gifs/search")
    assert.equal(url.searchParams.get("rating"), "g")
    assert.equal(url.searchParams.get("lang"), "en")
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
