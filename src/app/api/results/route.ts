import { NextResponse } from "next/server"
import { listExamResults } from "@/lib/exam-results"
import { hasValidHostCookie, hostUnauthorized } from "@/lib/host-auth"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  if (!hasValidHostCookie(request)) {
    return hostUnauthorized()
  }
  try {
    return NextResponse.json({ results: await listExamResults() }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Notes indisponibles."
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
