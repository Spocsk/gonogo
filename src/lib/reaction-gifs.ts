export type ReactionOutcome = "correct" | "wrong" | "timeout"

export type ReactionGif = {
  url: string
  format: "mp4" | "gif"
  title: string
  provider: "giphy"
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
function giphyUrl(value: unknown): string | null {
  if (typeof value !== "string") return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" && !url.username && !url.password && !url.port &&
      (url.hostname === "giphy.com" || url.hostname.endsWith(".giphy.com"))
      ? value
      : null
  } catch {
    return null
  }
}

export function parseReactionGif(payload: unknown): ReactionGif | null {
  const data = record(payload)?.data
  const gif = Array.isArray(data) ? record(data[0]) : null
  const images = record(gif?.images)
  if (!gif || !images) return null

  // The small MP4 is capped at 200 kB by GIPHY; no image optimizer or media proxy.
  const mp4 = giphyUrl(record(images.downsized_small)?.mp4) ??
    giphyUrl(record(images.fixed_height)?.mp4)
  const url = mp4 ?? giphyUrl(record(images.downsized)?.url) ??
    giphyUrl(record(images.fixed_height)?.url)
  if (!url) return null

  return {
    url,
    format: mp4 ? "mp4" : "gif",
    title: typeof gif.title === "string" ? gif.title : "GIF de réaction",
    provider: "giphy",
    sourceUrl: giphyUrl(gif.url) ?? "https://giphy.com/",
  }
}

export async function fetchReactionGif(
  outcome: ReactionOutcome,
  questionId: string,
  signal: AbortSignal,
): Promise<ReactionGif | null> {
  const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY?.trim()
  if (!apiKey || signal.aborted) return null

  let hash = 0
  for (const character of questionId) hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  const terms = SEARCH_TERMS[outcome]
  const params = new URLSearchParams({
    api_key: apiKey,
    q: terms[hash % terms.length],
    rating: "g",
    lang: "en",
    limit: "1",
  })

  try {
    // GIPHY requires API calls and media requests directly from the browser.
    // This response is used only for the current reaction, never persisted.
    const response = await fetch(`https://api.giphy.com/v1/gifs/search?${params}`, {
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
