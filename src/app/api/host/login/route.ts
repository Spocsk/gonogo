import { NextResponse } from "next/server"
import {
  HOST_COOKIE,
  hostCookieOptions,
  hostPasswordMissing,
  passwordConfigured,
  passwordMatches,
  signHostCookie,
} from "@/lib/host-auth"

export const dynamic = "force-dynamic"
export const preferredRegion = "fra1"

export async function POST(request: Request) {
  if (!passwordConfigured()) {
    return hostPasswordMissing()
  }

  let body: { password?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 })
  }

  const password = typeof body.password === "string" ? body.password : ""
  if (!passwordMatches(password)) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 401 })
  }

  const value = signHostCookie()
  if (!value) {
    return hostPasswordMissing()
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(HOST_COOKIE, value, hostCookieOptions())
  return response
}
