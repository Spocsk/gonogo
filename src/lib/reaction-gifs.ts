export type ReactionOutcome = "correct" | "wrong" | "timeout"

export type ReactionGif = {
  url: string
  format: "mp4" | "gif"
  title: string
  provider: "klipy"
  sourceUrl: string
}

const SEARCH_TERMS: Record<ReactionOutcome, readonly string[]> = {
  correct: ["funny celebration dance", "happy goofy dance", "funny victory celebration"],
  wrong: ["sad disappointed funny", "funny disappointed reaction", "dramatic sad funny"],
  timeout: ["clock waiting funny", "funny waiting", "time is up funny"],
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

// Keep the provider's URLs, including query parameters, exactly as returned.
function klipyUrl(value: unknown, media = true): string | null {
  if (typeof value !== "string") return null
  try {
    const url = new URL(value)
    const hosts = media
      ? ["static.klipy.com", "static1.klipy.com", "static2.klipy.com"]
      : ["klipy.com", "www.klipy.com"]
    return url.protocol === "https:" && !url.username && !url.password && !url.port &&
      hosts.includes(url.hostname)
      ? value
      : null
  } catch {
    return null
  }
}

export function parseReactionGif(payload: unknown): ReactionGif | null {
  const results = record(payload)?.results
  const gif = Array.isArray(results) ? record(results[0]) : null
  const formats = record(gif?.media_formats)
  if (!gif || gif.type === "ad" || !formats) return null

  // Prefer the compact video for a short reaction; no optimizer or media proxy.
  const mp4 = klipyUrl(record(formats.tinymp4)?.url) ??
    klipyUrl(record(formats.mp4)?.url)
  const url = mp4 ?? klipyUrl(record(formats.tinygif)?.url) ??
    klipyUrl(record(formats.gif)?.url)
  if (!url) return null

  return {
    url,
    format: mp4 ? "mp4" : "gif",
    title: typeof gif.content_description === "string" ? gif.content_description :
      typeof gif.title === "string" ? gif.title : "GIF de réaction",
    provider: "klipy",
    sourceUrl: klipyUrl(gif.itemurl, false) ?? klipyUrl(gif.url, false) ?? "https://klipy.com/",
  }
}

export async function fetchReactionGif(
  outcome: ReactionOutcome,
  questionId: string,
  signal: AbortSignal,
): Promise<ReactionGif | null> {
  const apiKey = process.env.NEXT_PUBLIC_KLIPY_API_KEY?.trim()
  if (!apiKey || signal.aborted) return null

  let hash = 0
  for (const character of questionId) hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  const terms = SEARCH_TERMS[outcome]
  const params = new URLSearchParams({
    key: apiKey,
    q: terms[hash % terms.length],
    contentfilter: "high",
    country: "FR",
    locale: "fr_FR",
    media_filter: "tinymp4,mp4,tinygif,gif",
    random: "true",
    limit: "1",
  })

  try {
    // KLIPY requires direct browser requests and intact media URLs. Request one
    // result rather than truncating a result list; no student data is included.
    // This response is used only for the current reaction, never persisted.
    const response = await fetch(`https://api.klipy.com/v2/search?${params}`, {
      signal: AbortSignal.any([signal, AbortSignal.timeout(1500)]),
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "strict-origin-when-cross-origin",
    })
    if (!response.ok) return null
    return parseReactionGif(await response.json())
  } catch {
    return null
  }
}
