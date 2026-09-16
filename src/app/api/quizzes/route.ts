import { NextResponse } from "next/server"
import {
  hasValidHostCookie,
  hostPasswordMissing,
  hostUnauthorized,
  passwordConfigured,
} from "@/lib/host-auth"
import { listQuizSummaries } from "@/lib/quiz-catalog"

export const dynamic = "force-dynamic"
export const preferredRegion = "fra1"

export async function GET(request: Request) {
  if (!passwordConfigured()) {
    return hostPasswordMissing()
  }
  if (!hasValidHostCookie(request)) {
    return hostUnauthorized()
  }
  return NextResponse.json({ quizzes: listQuizSummaries() })
}
