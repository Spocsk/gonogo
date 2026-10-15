import { NextResponse } from "next/server"
import { getExamResult } from "@/lib/exam-results"
import { hasValidHostCookie, hostUnauthorized } from "@/lib/host-auth"
import { getQuiz } from "@/lib/quiz-catalog"

export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ sessionId: string }> }

export async function GET(request: Request, ctx: Ctx) {
  if (!hasValidHostCookie(request)) {
    return hostUnauthorized()
  }
  const { sessionId } = await ctx.params
  try {
    const result = await getExamResult(sessionId)
    if (!result) {
      return NextResponse.json({ error: "Évaluation introuvable." }, { status: 404 })
    }
    // The trainer reviews each copy against the answer key.
    const questions = (getQuiz(result.quizId)?.questions ?? []).map((question) => ({
      id: question.id,
      prompt: question.prompt,
      choices: question.choices,
      correctIndex: question.correctIndex,
    }))
    return NextResponse.json({ result, questions }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Notes indisponibles."
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
