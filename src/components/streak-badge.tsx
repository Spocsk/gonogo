export function StreakBadge({ streak, best = false }: { streak: number; best?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-sm tabular ${streak >= 2 ? "text-go" : "text-paper-dim"}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-5 shrink-0" aria-hidden="true">
        <path d="M12 3c1 5 6 6 6 12a6 6 0 0 1-12 0c0-3 1.5-5 3-7 .1 2 1 3 2 4 1-2 2-5 1-9Z" />
        <path d="M12 13c1 2 3 3 3 5a3 3 0 0 1-6 0c0-2 2-3 3-5Z" />
      </svg>
      {best ? "Meilleure série" : "Série"} {streak}
    </span>
  )
}
