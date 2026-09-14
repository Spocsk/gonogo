import type { PublicPlayer } from "@/lib/types"

export function Leaderboard({
  players,
  highlightId,
  limit,
}: {
  players: PublicPlayer[]
  highlightId?: string | null
  limit?: number
}) {
  const rows = limit ? players.slice(0, limit) : players
  if (rows.length === 0) {
    return (
      <p className="text-paper-dim text-lg">
        Aucun opérateur sur le lien. Les callsigns apparaîtront ici.
      </p>
    )
  }

  return (
    <ol className="flex flex-col gap-2">
      {rows.map((player, index) => {
        const mine = player.id === highlightId
        return (
          <li
            key={player.id}
            className={`flex items-baseline justify-between gap-4 px-3 py-2 ${
              mine ? "bg-go/15 text-paper" : "text-paper"
            }`}
          >
            <span className="flex min-w-0 items-baseline gap-3">
              <span className="font-mono tabular w-6 text-paper-dim">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="truncate font-display text-2xl tracking-wide uppercase">
                {player.nickname}
              </span>
            </span>
            <span className="font-mono tabular text-lg text-go">{player.score}</span>
          </li>
        )
      })}
    </ol>
  )
}

export function Podium({ players }: { players: PublicPlayer[] }) {
  const [first, second, third] = players
  const slots = [
    { player: second, place: "02", height: "h-28" },
    { player: first, place: "01", height: "h-40" },
    { player: third, place: "03", height: "h-20" },
  ]

  return (
    <div className="grid grid-cols-3 items-end gap-3">
      {slots.map((slot) => (
        <div key={slot.place} className="flex flex-col items-center gap-3">
          <p className="font-display text-xl uppercase tracking-wide text-center min-h-14">
            {slot.player?.nickname ?? "—"}
          </p>
          <div
            className={`w-full ${slot.height} bg-ink-3 flex flex-col items-center justify-end pb-3 ${
              slot.place === "01" ? "bg-go text-ink" : "text-paper"
            }`}
          >
            <span className="font-display text-4xl">{slot.place}</span>
            <span className="font-mono tabular text-sm">
              {slot.player ? slot.player.score : ""}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
