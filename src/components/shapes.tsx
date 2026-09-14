export const PADS = [
  { bg: "#c44536", fg: "#eadfc8" },
  { bg: "#2c5d8c", fg: "#eadfc8" },
  { bg: "#d4a017", fg: "#12181f" },
  { bg: "#2d7a5c", fg: "#eadfc8" },
] as const

export function Shape({
  index,
  className = "size-8",
}: {
  index: number
  className?: string
}) {
  const common = {
    viewBox: "0 0 32 32",
    className,
    "aria-hidden": true as const,
  }

  if (index === 0) {
    return (
      <svg {...common}>
        <polygon points="16,3 30,28 2,28" fill="currentColor" />
      </svg>
    )
  }
  if (index === 1) {
    return (
      <svg {...common}>
        <polygon points="16,2 30,16 16,30 2,16" fill="currentColor" />
      </svg>
    )
  }
  if (index === 2) {
    return (
      <svg {...common}>
        <circle cx="16" cy="16" r="13" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <rect x="4" y="4" width="24" height="24" fill="currentColor" />
    </svg>
  )
}
