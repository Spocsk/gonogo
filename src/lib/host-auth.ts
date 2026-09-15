import { createHash, createHmac, timingSafeEqual } from "crypto"
import { NextResponse } from "next/server"

export const HOST_COOKIE = "gonogo_host"
const MAX_AGE_SEC = 60 * 60 * 12

function hostPassword(): string | null {
  const value = process.env.HOST_PASSWORD
  return value ? value : null
}

function sha256(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest()
}

export function passwordConfigured(): boolean {
  return hostPassword() !== null
}

export function passwordMatches(candidate: string): boolean {
  const expected = hostPassword()
  if (expected === null) return false
  const left = sha256(candidate)
  const right = sha256(expected)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

export function signHostCookie(now = Date.now()): string | null {
  const secret = hostPassword()
  if (!secret) return null
  const exp = now + MAX_AGE_SEC * 1000
  const payload = String(exp)
  const sig = createHmac("sha256", secret).update(`host:${payload}`).digest("hex")
  return `${payload}.${sig}`
}

export function verifyHostCookie(value: string, now = Date.now()): boolean {
  const secret = hostPassword()
  if (!secret) return false
  const dot = value.lastIndexOf(".")
  if (dot <= 0) return false
  const payload = value.slice(0, dot)
  const sig = value.slice(dot + 1)
  const exp = Number(payload)
  if (!Number.isFinite(exp) || exp < now) return false
  const expected = createHmac("sha256", secret).update(`host:${payload}`).digest("hex")
  const left = Buffer.from(sig, "hex")
  const right = Buffer.from(expected, "hex")
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie")
  if (!header) return null
  for (const part of header.split(";")) {
    const trimmed = part.trim()
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    if (trimmed.slice(0, eq) !== name) continue
    try {
      return decodeURIComponent(trimmed.slice(eq + 1))
    } catch {
      return trimmed.slice(eq + 1)
    }
  }
  return null
}

export function hasValidHostCookie(request: Request): boolean {
  const value = readCookie(request, HOST_COOKIE)
  return value ? verifyHostCookie(value) : false
}

export function hostUnauthorized(
  message = "Console formateur non autorisée.",
): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function hostPasswordMissing(): NextResponse {
  return NextResponse.json(
    { error: "Mot de passe formateur non configuré (HOST_PASSWORD)." },
    { status: 503 },
  )
}

export function hostCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_SEC,
    path: "/",
  }
}
