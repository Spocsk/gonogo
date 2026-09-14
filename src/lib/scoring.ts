export function scoreAnswer(
  correct: boolean,
  elapsedMs: number,
  timeLimitMs: number,
): number {
  if (!correct) return 0
  const ratio = Math.min(1, Math.max(0, elapsedMs / timeLimitMs))
  return Math.round(1000 * (1 - ratio / 2))
}

export function remainingMs(
  startedAt: number | null,
  timeLimitMs: number,
  now: number,
): number {
  if (startedAt == null) return 0
  return Math.max(0, timeLimitMs - (now - startedAt))
}
