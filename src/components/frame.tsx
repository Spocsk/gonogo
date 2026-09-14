import type { ReactNode } from "react"

export function Frame({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`hud-corners ${className}`}>
      <span className="hud-bl" />
      <span className="hud-br" />
      {children}
    </div>
  )
}

export function formatPin(pin: string) {
  const digits = pin.replace(/\D/g, "").slice(0, 6)
  if (digits.length <= 3) return digits
  return `${digits.slice(0, 3)} ${digits.slice(3)}`
}
