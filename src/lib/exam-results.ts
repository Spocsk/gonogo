import { Redis } from "@upstash/redis"
import { EXAM_GRADE_SCALE } from "./exam-timing"
import { modeOf, questionsFor, quizIdOf } from "./game"
import { getQuiz } from "./quiz-catalog"
import { saveGame } from "./store"
import type { Game } from "./types"

export type ExamAnswer = {
  questionId: string
  choiceIndex: number | null
  correct: boolean
}

export type ExamStudent = {
  playerId: string
  name: string
  correct: number
  grade: number
  answers: ExamAnswer[]
}

export type ExamResult = {
  sessionId: string
  quizId: string
  quizTitle: string
  pin: string
  startedAt: number
  finishedAt: number
  complete: boolean
  questionCount: number
  outOf: number
  students: ExamStudent[]
}

export type ExamSummary = Omit<ExamResult, "students"> & {
  studentCount: number
  average: number | null
}

const INDEX_KEY = "gonogo:exam:sessions"
const memory = globalThis as typeof globalThis & { gonogoExamResults?: Map<string, ExamResult> }

function memoryMap() {
  if (!memory.gonogoExamResults) memory.gonogoExamResults = new Map()
  return memory.gonogoExamResults
}

function redisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

function keyFor(sessionId: string) {
  return `gonogo:exam:session:${sessionId}`
}

async function redisRequest<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request()
  } catch {
    // SDK errors can embed command arguments, including student answers.
    throw new Error("Stockage des notes indisponible. Réessayez dans un instant.")
  }
}

// Rounded to the quarter point when the deck is not exactly 20 questions.
export function examGrade(correct: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((correct / total) * EXAM_GRADE_SCALE * 4) / 4
}

export function buildExamResult(game: Game, now: number, complete: boolean): ExamResult | null {
  const quizId = quizIdOf(game)
  if (!quizId || !game.sessionId || modeOf(game) !== "exam") return null
  const deck = questionsFor(game)
  const students = game.players.map((player) => {
    const answers = deck.map((question) => {
      const answer = player.answers[question.id]
      return {
        questionId: question.id,
        choiceIndex: answer?.choiceIndex ?? null,
        correct: Boolean(answer?.correct),
      }
    })
    const correct = answers.filter((answer) => answer.correct).length
    return {
      playerId: player.id,
      name: player.nickname,
      correct,
      grade: examGrade(correct, deck.length),
      answers,
    }
  })
  return {
    sessionId: game.sessionId,
    quizId,
    quizTitle: getQuiz(quizId)?.title ?? quizId,
    pin: game.pin,
    startedAt: game.startedAt ?? now,
    finishedAt: now,
    complete,
    questionCount: deck.length,
    outOf: EXAM_GRADE_SCALE,
    students,
  }
}

export function needsArchive(game: Game): boolean {
  return game.phase === "podium" && modeOf(game) === "exam" && Boolean(game.sessionId) && !game.archivedAt
}

/** Results never expire, unlike the six-hour game session. */
export async function saveExamResult(result: ExamResult): Promise<void> {
  const redis = redisClient()
  if (redis) {
    await redisRequest(() => redis.set(keyFor(result.sessionId), result))
    await redisRequest(() => redis.zadd(INDEX_KEY, { score: result.startedAt, member: result.sessionId }))
    return
  }
  memoryMap().set(result.sessionId, result)
}

/** Writes the result before the game records it, so a failed save is retried on the next request. */
export async function archiveExam(game: Game, now = Date.now(), complete = true): Promise<Game> {
  const result = buildExamResult(game, now, complete)
  if (!result) return game
  await saveExamResult(result)
  return { ...game, archivedAt: now }
}

export async function getExamResult(sessionId: string): Promise<ExamResult | null> {
  const redis = redisClient()
  if (redis) {
    return (await redisRequest(() => redis.get<ExamResult>(keyFor(sessionId)))) ?? null
  }
  return memoryMap().get(sessionId) ?? null
}

export function summarize(result: ExamResult): ExamSummary {
  const { students, ...rest } = result
  const average = students.length
    ? Math.round((students.reduce((sum, student) => sum + student.grade, 0) / students.length) * 100) / 100
    : null
  return { ...rest, studentCount: students.length, average }
}

export async function listExamResults(): Promise<ExamSummary[]> {
  const redis = redisClient()
  let results: ExamResult[]
  if (redis) {
    const ids = await redisRequest(() => redis.zrange<string[]>(INDEX_KEY, 0, -1, { rev: true }))
    if (ids.length === 0) return []
    const loaded = await redisRequest(() => redis.mget<(ExamResult | null)[]>(...ids.map(keyFor)))
    results = loaded.filter((result): result is ExamResult => result != null)
  } else {
    results = [...memoryMap().values()].sort((a, b) => b.startedAt - a.startedAt)
  }
  return results.map(summarize)
}

/** Saves a game, archiving an evaluation the moment it reaches its end screen. */
export async function commitGame(game: Game, now = Date.now()): Promise<Game> {
  const next = needsArchive(game) ? await archiveExam(game, now) : game
  return saveGame(next)
}
