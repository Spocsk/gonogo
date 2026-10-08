import assert from "node:assert/strict"
import { test } from "node:test"
import {
  answerQuestion,
  createGame,
  currentQuestion,
  joinPlayer,
  nextQuestion,
  pauseReveal,
  questionsFor,
  REVEAL_DURATION_MS,
  resumeReveal,
  revealNow,
  selectQuiz,
  startBrief,
  tickGame,
  toPublic,
} from "../src/lib/game"
import type { Game } from "../src/lib/types"

const START = 100_000

function session() {
  const joined = joinPlayer(selectQuiz(createGame("123456"), "odyssey"), "Ada")
  return { game: startBrief(joined.game, START), playerId: joined.player.id }
}

function publicPlayer(game: Game, playerId: string, now = START) {
  return toPublic(game, { role: "player", playerId }, "memory", now).you!
}

test("a question reveals at its exact deadline and advances after ten seconds", () => {
  const { game } = session()
  const expires = START + currentQuestion(game)!.timeLimitMs
  assert.equal(tickGame(game, expires - 1), game)
  const reveal = tickGame(game, expires)
  assert.equal(reveal.phase, "reveal")
  assert.equal(reveal.revealStartedAt, expires)
  assert.equal(toPublic(reveal, { role: "guest" }, "memory", expires).revealRemainingMs, 10_000)
  assert.equal(tickGame(reveal, expires + 9_999), reveal)
  const next = tickGame(reveal, expires + 10_000)
  assert.equal(next.phase, "question")
  assert.equal(next.questionIndex, 1)
  assert.equal(next.questionStartedAt, expires + 10_000)
  assert.equal(next.revealStartedAt, null)
})

test("a delayed poll advances one round and gives the next question its full time", () => {
  const { game } = session()
  const now = START + 60 * 60 * 1_000
  const next = tickGame(game, now)
  assert.equal(next.questionIndex, 1)
  assert.equal(next.phase, "question")
  assert.equal(next.questionStartedAt, now)
  assert.equal(tickGame(next, now), next)
  assert.equal(toPublic(next, { role: "guest" }, "memory", now).remainingMs, currentQuestion(next)!.timeLimitMs)
})

test("manual verdict starts ten seconds and repeated reveal does not reset it", () => {
  const { game } = session()
  const reveal = revealNow(game, START + 1_000)
  assert.equal(reveal.revealStartedAt, START + 1_000)
  assert.equal(revealNow(reveal, START + 5_000), reveal)
  assert.equal(tickGame(reveal, START + 11_000).questionIndex, 1)
})

test("pause freezes exact remaining time and resume shifts the timer", () => {
  const { game } = session()
  const paused = pauseReveal(revealNow(game, START), START + 3_250)
  const later = START + 60_000
  assert.equal(tickGame(paused, later), paused)
  const projection = toPublic(paused, { role: "guest" }, "memory", later)
  assert.equal(projection.revealRemainingMs, 6_750)
  assert.equal(projection.revealPaused, true)
  assert.equal(pauseReveal(paused, later), paused)
  const resumed = resumeReveal(paused, later)
  assert.equal(toPublic(resumed, { role: "guest" }, "memory", later).revealRemainingMs, 6_750)
  assert.equal(resumeReveal(resumed, later + 1), resumed)
  assert.equal(tickGame(resumed, later + 6_749), resumed)
  assert.equal(tickGame(resumed, later + 6_750).questionIndex, 1)
})

test("manual next can accelerate a paused correction", () => {
  const { game } = session()
  const paused = pauseReveal(revealNow(game, START), START + 2_000)
  const next = nextQuestion(paused, START + 3_000)
  assert.equal(next.questionIndex, 1)
  assert.equal(next.revealPausedAt, null)
  assert.equal(next.questionStartedAt, START + 3_000)
})

test("the final automatic transition reaches the podium", () => {
  const { game } = session()
  const last = { ...game, questionIndex: questionsFor(game).length - 1 }
  const podium = tickGame(revealNow(last, START), START + REVEAL_DURATION_MS)
  assert.equal(podium.phase, "podium")
  assert.equal(podium.questionStartedAt, null)
  assert.equal(podium.revealStartedAt, null)
  assert.equal(toPublic(podium, { role: "guest" }, "memory", START).question, null)
})

test("legacy games keep their quiz and obtain a durable full reveal window", () => {
  const legacy = createGame("234567")
  delete legacy.quizId
  delete legacy.revealStartedAt
  delete legacy.revealPausedAt
  assert.ok(questionsFor(legacy).length > 0)
  const reveal = tickGame({ ...legacy, phase: "reveal" }, START)
  assert.equal(reveal.revealStartedAt, START)
  assert.equal(tickGame(reveal, START + 9_000), reveal)
  assert.equal(tickGame(reveal, START + 10_000).questionIndex, 1)
})

test("score, correct choice and answer points remain hidden until the verdict", () => {
  const { game, playerId } = session()
  const question = currentQuestion(game)!
  const answered = answerQuestion(game, playerId, question.correctIndex, START + 100)
  for (const viewer of [
    { role: "player" as const, playerId },
    { role: "host" as const, token: game.hostToken },
    { role: "guest" as const },
  ]) {
    const publicGame = toPublic(answered, viewer, "memory", START + 100)
    assert.equal(publicGame.question?.correctIndex, undefined)
    assert.equal(publicGame.question?.explanation, undefined)
    assert.equal(publicGame.players[0].score, 0)
    assert.equal(publicGame.players[0].lastCorrect, undefined)
    assert.equal(publicGame.players[0].lastPoints, undefined)
    assert.equal(publicGame.players[0].streak, 0)
    if (publicGame.you) {
      assert.equal(publicGame.you.lastCorrect, undefined)
      assert.equal(publicGame.you.lastPoints, undefined)
    }
  }
  const verdict = publicPlayer(revealNow(answered, START + 1_000), playerId)
  assert.equal(verdict.lastCorrect, true)
  assert.ok(verdict.score > 0)
  assert.equal(verdict.lastPoints, verdict.score)
  assert.equal(verdict.streak, 1)
})

test("streaks count only finalized answers, persist on reload and reset on mistakes or misses", () => {
  const { playerId, game: initialGame } = session()
  let game = initialGame
  let now = START
  for (let index = 0; index < 2; index += 1) {
    game = answerQuestion(game, playerId, currentQuestion(game)!.correctIndex, now + 100)
    assert.equal(publicPlayer(game, playerId, now).streak, index)
    game = revealNow(game, now + 200)
    assert.equal(publicPlayer(game, playerId, now + 200).streak, index + 1)
    assert.deepEqual(publicPlayer(JSON.parse(JSON.stringify(game)), playerId, now + 200), publicPlayer(game, playerId, now + 200))
    now += 1_000
    game = nextQuestion(game, now)
  }
  const wrong = (currentQuestion(game)!.correctIndex + 1) % 4
  game = revealNow(answerQuestion(game, playerId, wrong, now + 100), now + 200)
  assert.equal(publicPlayer(game, playerId).streak, 0)
  assert.equal(publicPlayer(game, playerId).bestStreak, 2)
  game = nextQuestion(game, now + 1_000)
  game = revealNow(answerQuestion(game, playerId, currentQuestion(game)!.correctIndex, now + 1_100), now + 1_200)
  assert.equal(publicPlayer(game, playerId).streak, 1)
  game = nextQuestion(game, now + 2_000)
  game = revealNow(game, now + 2_100)
  assert.equal(publicPlayer(game, playerId).streak, 0)
  assert.equal(publicPlayer(game, playerId).bestStreak, 2)
})

test("best streak survives the podium and bonuses never change scoring", () => {
  const { playerId, game: initialGame } = session()
  let game = initialGame
  let now = START
  const count = questionsFor(game).length
  for (let index = 0; index < count; index += 1) {
    game = answerQuestion(game, playerId, currentQuestion(game)!.correctIndex, now)
    game = revealNow(game, now)
    now += REVEAL_DURATION_MS
    game = tickGame(game, now)
  }
  assert.equal(game.phase, "podium")
  const player = publicPlayer(game, playerId, now)
  assert.equal(player.streak, count)
  assert.equal(player.bestStreak, count)
  assert.equal(player.score, count * 1_000)
})

test("changing or cancelling a choice does not prematurely increment a streak", () => {
  const { game, playerId } = session()
  const correct = currentQuestion(game)!.correctIndex
  const correctAnswer = answerQuestion(game, playerId, correct, START + 100)
  const duplicate = answerQuestion(correctAnswer, playerId, correct, START + 200)
  assert.equal(duplicate, correctAnswer)
  assert.equal(duplicate.players[0].answers[currentQuestion(game)!.id].at, START + 100)
  const cancelled = answerQuestion(correctAnswer, playerId, null, START + 200)
  assert.equal(cancelled.players[0].score, 0)
  assert.equal(publicPlayer(revealNow(cancelled, START + 300), playerId).streak, 0)
  const wrong = answerQuestion(correctAnswer, playerId, (correct + 1) % 4, START + 200)
  assert.equal(wrong.players[0].score, 0)
  assert.equal(publicPlayer(revealNow(wrong, START + 300), playerId).streak, 0)
})

test("stale player and host requests cannot act on the next question", () => {
  const { game, playerId } = session()
  const oldId = currentQuestion(game)!.id
  const next = tickGame(revealNow(game, START), START + REVEAL_DURATION_MS)
  assert.throws(() => answerQuestion(next, playerId, 0, START + 10_100, oldId), /round a changé/)
  assert.throws(() => revealNow(next, START + 10_100, oldId), /round a changé/)
  assert.throws(() => nextQuestion(next, START + 10_100, oldId), /round a changé/)
  assert.throws(() => pauseReveal(next, START + 10_100, oldId), /round a changé/)
  assert.throws(() => resumeReveal(next, START + 10_100, oldId), /round a changé/)
  assert.equal(next.phase, "question")
  assert.equal(next.players[0].score, 0)
})

test("an expired player window rejects answers, including fractional or infinite choices", () => {
  const { game, playerId } = session()
  const deadline = START + currentQuestion(game)!.timeLimitMs
  assert.throws(() => answerQuestion(game, playerId, 0, deadline), /Hors fenêtre/)
  for (const value of [-1, 4, 1.5, Infinity, NaN]) {
    assert.throws(() => answerQuestion(game, playerId, value, START), /Choix invalide/)
  }
})
