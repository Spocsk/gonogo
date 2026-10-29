import assert from "node:assert/strict"
import { test } from "node:test"
import { EXAM_COOLDOWN_MS, EXAM_QUESTION_MS, EXAM_WAIT_MS } from "../src/lib/exam-timing"
import {
  archiveExam,
  buildExamResult,
  commitGame,
  examGrade,
  getExamResult,
  listExamResults,
  needsArchive,
} from "../src/lib/exam-results"
import {
  answerQuestion,
  createGame,
  currentQuestion,
  joinPlayer,
  nextQuestion,
  questionsFor,
  revealNow,
  selectQuiz,
  startBrief,
  tickGame,
  toPublic,
} from "../src/lib/game"
import { listQuizSummaries } from "../src/lib/quiz-catalog"
import { deleteGame } from "../src/lib/store"
import type { Game } from "../src/lib/types"

const START = 100_000

for (const key of ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_URL", "KV_REST_API_TOKEN"]) {
  delete process.env[key]
}

function room(names = ["Ada Lovelace", "Alan Turing"]) {
  let game = selectQuiz(createGame("654321"), "cabinet-eval")
  const ids: string[] = []
  for (const name of names) {
    const joined = joinPlayer(game, name)
    game = joined.game
    ids.push(joined.player.id)
  }
  return { game: startBrief(game, START), ids }
}

function correctAnswer(game: Game) {
  return currentQuestion(game)!.correctIndex
}

function wrongAnswer(game: Game) {
  return (correctAnswer(game) + 1) % 4
}

test("the evaluation has 20 balanced questions and is listed as an exam", () => {
  const summary = listQuizSummaries().find((quiz) => quiz.id === "cabinet-eval")
  assert.equal(summary?.mode, "exam")
  assert.equal(summary?.questionCount, 20)
  const { game } = room()
  const deck = questionsFor(game)
  assert.equal(new Set(deck.map((question) => question.id)).size, 20)
  for (const index of [0, 1, 2, 3]) {
    assert.equal(deck.filter((question) => question.correctIndex === index).length, 5)
  }
  assert.ok(deck.every((question) => question.timeLimitMs === EXAM_QUESTION_MS))
})

test("the courses 1 and 2 recap is a live quiz, not graded", () => {
  const summary = listQuizSummaries().find((quiz) => quiz.id === "contrat-eval")
  assert.equal(summary?.mode, "live")
  assert.equal(summary?.questionCount, 20)
})

test("students join with a first and last name, and the mode cannot switch once they are in", () => {
  const game = selectQuiz(createGame("654321"), "cabinet-eval")
  assert.throws(() => joinPlayer(game, "Ada"), /prénom et votre nom/)
  const joined = joinPlayer(game, "  Jean-Luc   d’Arc ")
  assert.equal(joined.player.nickname, "Jean-Luc d’Arc")
  assert.throws(() => selectQuiz(joined.game, "odyssey"), /évaluation avant/)
  const live = joinPlayer(createGame("111111"), "Maverick").game
  assert.throws(() => selectQuiz(live, "cabinet-eval"), /évaluation avant/)
  assert.throws(() => startBrief(selectQuiz(createGame("222222"), "cabinet-eval"), START), /Aucun étudiant/)
})

test("everyone answering moves to the next question at once, without a correction phase", () => {
  const { game, ids } = room()
  const one = tickGame(answerQuestion(game, ids[0], correctAnswer(game), START + 5_000), START + 5_000)
  assert.equal(one.questionIndex, 0)
  const at = START + 9_000
  const both = tickGame(answerQuestion(one, ids[1], wrongAnswer(one), at), at)
  assert.equal(both.phase, "question")
  assert.equal(both.questionIndex, 1)
  assert.equal(both.questionStartedAt, at)
})

test("missing students hold the question two minutes, then a visible 60-second cooldown", () => {
  const { game, ids } = room()
  const answered = answerQuestion(game, ids[0], correctAnswer(game), START + 1_000)
  const waiting = tickGame(answered, START + EXAM_WAIT_MS - 1)
  assert.equal(waiting.questionIndex, 0)
  assert.equal(toPublic(waiting, { role: "guest" }, "memory", START + EXAM_WAIT_MS - 1).cooldownRemainingMs, null)
  const cooling = toPublic(answered, { role: "guest" }, "memory", START + EXAM_WAIT_MS + 30_000)
  assert.equal(cooling.cooldownRemainingMs, EXAM_COOLDOWN_MS - 30_000)
  assert.equal(tickGame(answered, START + EXAM_QUESTION_MS - 1).questionIndex, 0)
  const moved = tickGame(answered, START + EXAM_QUESTION_MS)
  assert.equal(moved.questionIndex, 1)
  assert.equal(moved.phase, "question")
})

test("a late answer during the cooldown still counts and closes the question", () => {
  const { game, ids } = room()
  const first = answerQuestion(game, ids[0], correctAnswer(game), START + 1_000)
  const at = START + EXAM_WAIT_MS + 10_000
  const done = tickGame(answerQuestion(first, ids[1], correctAnswer(first), at), at)
  assert.equal(done.questionIndex, 1)
  assert.equal(done.players[1].score, 1)
})

test("answers are final, worth one point and never revealed", () => {
  const { game, ids } = room()
  const answered = answerQuestion(game, ids[0], correctAnswer(game), START + 30_000)
  assert.equal(answered.players[0].score, 1)
  assert.throws(() => answerQuestion(answered, ids[0], wrongAnswer(game), START + 31_000), /déjà validée/)
  assert.throws(() => answerQuestion(answered, ids[0], null, START + 31_000), /déjà validée/)
  assert.throws(() => revealNow(answered, START + 31_000), /Pas de corrigé/)

  for (const viewer of [{ role: "host" as const, token: game.hostToken }, { role: "player" as const, playerId: ids[0] }]) {
    const view = toPublic(answered, viewer, "memory", START + 31_000)
    assert.equal(view.mode, "exam")
    assert.equal(view.question?.correctIndex, undefined)
    assert.equal(view.question?.explanation, undefined)
    assert.ok(view.question?.choices.every((choice) => choice.count === undefined))
    assert.ok(view.players.every((player) => player.score === 0 && player.lastCorrect === undefined))
    assert.equal(view.answeredCount, 1)
  }
  assert.equal(toPublic(answered, { role: "player", playerId: ids[0] }, "memory", START + 31_000).yourChoiceIndex, correctAnswer(game))
})

test("the trainer can skip a stuck question and the grade is out of 20", async () => {
  let { game } = room(["Ada Lovelace", "Alan Turing", "Grace Hopper"])
  const [ada, alan] = game.players.map((player) => player.id)
  let now = START
  for (let index = 0; index < 20; index += 1) {
    now += 1_000
    game = answerQuestion(game, ada, correctAnswer(game), now)
    if (index < 10) game = answerQuestion(game, alan, correctAnswer(game), now)
    // Grace never answers: the host skips each question.
    game = nextQuestion(game, now, currentQuestion(game)!.id)
  }
  assert.equal(game.phase, "podium")
  assert.ok(needsArchive(game))
  const result = buildExamResult(game, now, true)!
  const grades = Object.fromEntries(result.students.map((student) => [student.name, student.grade]))
  assert.deepEqual(grades, { "Ada Lovelace": 20, "Alan Turing": 10, "Grace Hopper": 0 })
  assert.equal(result.students[2].answers.every((answer) => answer.choiceIndex === null), true)
  assert.equal(examGrade(7, 13), 10.75)

  const stored = await commitGame(game, now)
  assert.equal(stored.archivedAt, now)
  assert.equal(needsArchive(stored), false)
  assert.deepEqual((await getExamResult(game.sessionId!))?.students.map((student) => student.grade), [20, 10, 0])
  const summary = (await listExamResults()).find((entry) => entry.sessionId === game.sessionId)
  assert.equal(summary?.studentCount, 3)
  assert.equal(summary?.average, 10)
  await deleteGame(game.pin)
})

test("an aborted evaluation keeps answers marked incomplete, live quizzes never archive", async () => {
  const { game, ids } = room()
  const answered = answerQuestion(game, ids[0], correctAnswer(game), START + 1_000)
  const archived = await archiveExam(answered, START + 2_000, false)
  const saved = await getExamResult(game.sessionId!)
  assert.equal(saved?.complete, false)
  assert.equal(saved?.students[0].correct, 1)
  assert.equal(archived.archivedAt, START + 2_000)

  const live = startBrief(joinPlayer(selectQuiz(createGame("333333"), "odyssey"), "Ada").game, START)
  assert.equal(buildExamResult(live, START, true), null)
  assert.equal(toPublic(live, { role: "guest" }, "memory", START).mode, "live")
})

test("results are stored in Redis without expiry and listed newest first", async () => {
  const values = new Map<string, string>()
  const sorted = new Map<string, number>()
  const commands: unknown[][] = []
  const originalFetch = globalThis.fetch
  const encode = (result: unknown): unknown =>
    typeof result === "string" ? Buffer.from(result).toString("base64") : Array.isArray(result) ? result.map(encode) : result
  function command(args: unknown[]): unknown {
    commands.push(args)
    const operation = String(args[0]).toLowerCase()
    if (operation === "set") {
      values.set(String(args[1]), String(args[2]))
      return "OK"
    }
    if (operation === "zadd") {
      sorted.set(String(args[3]), Number(args[2]))
      return 1
    }
    if (operation === "zrange") {
      assert.ok(args.includes("rev"))
      return [...sorted.entries()].sort((a, b) => b[1] - a[1]).map(([member]) => member)
    }
    if (operation === "mget") return args.slice(1).map((key) => values.get(String(key)) ?? null)
    if (operation === "get") return values.get(String(args[1])) ?? null
    return assert.fail(`unexpected command ${operation}`)
  }
  globalThis.fetch = async (_input, init) => {
    const args = JSON.parse(String(init?.body)) as unknown[]
    // The SDK may batch commands into a pipeline.
    return Response.json(Array.isArray(args[0])
      ? args.map((entry) => ({ result: encode(command(entry as unknown[])) }))
      : { result: encode(command(args)) })
  }
  process.env.UPSTASH_REDIS_REST_URL = "https://redis.gonogo.test"
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-token"
  try {
    const older = room().game
    const newer = startBrief(selectQuiz(joinPlayer(selectQuiz(createGame("444444"), "cabinet-eval"), "Ada Lovelace").game, "cabinet-eval"), START + 5_000)
    await archiveExam({ ...older, phase: "podium" }, START + 1_000)
    await archiveExam({ ...newer, phase: "podium" }, START + 6_000)
    const sets = commands.filter((command) => String(command[0]).toLowerCase() === "set")
    assert.ok(sets.every((command) => !command.some((part) => String(part).toLowerCase() === "ex")))
    const listed = await listExamResults()
    assert.deepEqual(listed.map((entry) => entry.sessionId), [newer.sessionId, older.sessionId])
    assert.equal((await getExamResult(older.sessionId!))?.students.length, 2)
  } finally {
    globalThis.fetch = originalFetch
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
  }
})
