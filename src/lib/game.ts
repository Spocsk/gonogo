import { randomBytes, randomUUID } from "crypto"
import { DEFAULT_QUIZ_ID, getQuiz } from "./quiz-catalog"
import { remainingMs, scoreAnswer } from "./scoring"
import type { Game, Player, Question, Viewer, PublicGame, PublicPlayer } from "./types"

export const REVEAL_DURATION_MS = 10_000

export function createPin(): string {
  const n = randomBytes(3).readUIntBE(0, 3) % 1_000_000
  return n.toString().padStart(6, "0")
}

export function createGame(pin: string): Game {
  return {
    pin,
    revision: 0,
    hostToken: randomUUID(),
    createdAt: Date.now(),
    phase: "lobby",
    questionIndex: 0,
    questionStartedAt: null,
    revealStartedAt: null,
    revealPausedAt: null,
    players: [],
    quizId: null,
  }
}

export function quizIdOf(game: Game): string | null {
  if (game.quizId === undefined) return DEFAULT_QUIZ_ID
  return game.quizId
}

export function questionsFor(game: Game): Question[] {
  const id = quizIdOf(game)
  if (!id) return []
  return getQuiz(id)?.questions ?? []
}

export function normalizeNickname(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, 18)
}

export function nicknameOk(name: string): boolean {
  return name.length >= 2 && /^[\p{L}\p{N} _.\-]+$/u.test(name)
}

export function currentQuestion(game: Game) {
  return questionsFor(game)[game.questionIndex] ?? null
}

export function tickGame(game: Game, now = Date.now()): Game {
  let live = game
  if (live.phase === "question" && live.questionStartedAt != null) {
    const question = currentQuestion(live)
    if (!question) return finishGame(live)
    if (remainingMs(live.questionStartedAt, question.timeLimitMs, now) > 0) return live
    live = {
      ...live,
      phase: "reveal",
      revealStartedAt: live.questionStartedAt + question.timeLimitMs,
      revealPausedAt: null,
    }
  }
  if (live.phase === "reveal") {
    // Sessions created before the automatic timer receive a full correction window.
    if (live.revealStartedAt == null) {
      live = { ...live, revealStartedAt: now, revealPausedAt: null }
    }
    if (live.revealPausedAt == null && revealRemainingMs(live, now) === 0) {
      return advanceQuestion(live, now)
    }
  }
  return live
}

export function revealRemainingMs(game: Game, now = Date.now()): number {
  if (game.phase !== "reveal") return 0
  const startedAt = game.revealStartedAt ?? now
  const endAt = game.revealPausedAt ?? now
  return Math.min(REVEAL_DURATION_MS, Math.max(0, REVEAL_DURATION_MS - (endAt - startedAt)))
}

function finishGame(game: Game): Game {
  return {
    ...game,
    phase: "podium",
    questionStartedAt: null,
    revealStartedAt: null,
    revealPausedAt: null,
  }
}

function advanceQuestion(game: Game, now: number): Game {
  const nextIndex = game.questionIndex + 1
  if (nextIndex >= questionsFor(game).length) return finishGame(game)
  // Start at the time of this request; an absent audience never loses later questions.
  return {
    ...game,
    phase: "question",
    questionIndex: nextIndex,
    questionStartedAt: now,
    revealStartedAt: null,
    revealPausedAt: null,
  }
}

export function assertQuestionId(game: Game, questionId?: string): void {
  if (questionId != null && currentQuestion(game)?.id !== questionId) {
    throw new Error("Cette question est déjà terminée. Le round a changé.")
  }
}

export function joinPlayer(game: Game, nickname: string): { game: Game; player: Player } {
  const name = normalizeNickname(nickname)
  if (!nicknameOk(name)) {
    throw new Error("Callsign invalide. 2 à 18 caractères, lettres / chiffres.")
  }
  const taken = game.players.some(
    (p) => p.nickname.toLocaleLowerCase("fr") === name.toLocaleLowerCase("fr"),
  )
  if (taken) {
    throw new Error("Ce callsign est déjà pris sur ce lien sol.")
  }
  if (game.phase === "podium") {
    throw new Error("Le brief est terminé.")
  }
  const player: Player = {
    id: randomUUID(),
    nickname: name,
    score: 0,
    answers: {},
    joinedAt: Date.now(),
  }
  return { game: { ...game, players: [...game.players, player] }, player }
}

export function selectQuiz(game: Game, quizId: string): Game {
  if (game.phase !== "lobby") throw new Error("Le brief a déjà commencé.")
  if (!getQuiz(quizId)) throw new Error("Brief introuvable.")
  return { ...game, quizId }
}

export function startBrief(game: Game, now = Date.now()): Game {
  if (game.phase !== "lobby") throw new Error("Le brief a déjà commencé.")
  const quizId = quizIdOf(game)
  if (!quizId) throw new Error("Choisissez un brief avant le GO.")
  if (!getQuiz(quizId)) throw new Error("Brief introuvable.")
  return {
    ...game,
    quizId,
    phase: "question",
    questionIndex: 0,
    questionStartedAt: now,
    revealStartedAt: null,
    revealPausedAt: null,
  }
}

export function answerQuestion(
  game: Game,
  playerId: string,
  choiceIndex: number | null,
  now = Date.now(),
  questionId?: string,
): Game {
  const live = tickGame(game, now)
  assertQuestionId(live, questionId)
  if (live.phase !== "question") {
    throw new Error("Hors fenêtre de réponse.")
  }
  const question = currentQuestion(live)
  if (!question) throw new Error("Question introuvable.")
  if (choiceIndex != null && (!Number.isInteger(choiceIndex) || choiceIndex < 0 || choiceIndex > 3)) {
    throw new Error("Choix invalide.")
  }
  const player = live.players.find((p) => p.id === playerId)
  if (!player) throw new Error("Opérateur inconnu.")

  const previous = player.answers[question.id]
  if (choiceIndex != null && previous?.choiceIndex === choiceIndex) return live
  if (choiceIndex == null && !previous) return live
  const rest = { ...player.answers }
  if (previous) delete rest[question.id]
  const score = player.score - (previous?.points ?? 0)

  if (choiceIndex == null) {
    const nextPlayer: Player = { ...player, score, answers: rest }
    return {
      ...live,
      players: live.players.map((p) => (p.id === playerId ? nextPlayer : p)),
    }
  }

  const elapsed = now - (live.questionStartedAt ?? now)
  const correct = choiceIndex === question.correctIndex
  const points = scoreAnswer(correct, elapsed, question.timeLimitMs)
  const nextPlayer: Player = {
    ...player,
    score: score + points,
    answers: {
      ...rest,
      [question.id]: { choiceIndex, at: now, correct, points },
    },
  }
  return {
    ...live,
    players: live.players.map((p) => (p.id === playerId ? nextPlayer : p)),
  }
}

export function revealNow(game: Game, now = Date.now(), questionId?: string): Game {
  const live = tickGame(game, now)
  assertQuestionId(live, questionId)
  if (live.phase !== "question" && live.phase !== "reveal") {
    throw new Error("Pas de question à juger.")
  }
  if (live.phase === "reveal") return live
  return { ...live, phase: "reveal", revealStartedAt: now, revealPausedAt: null }
}

export function nextQuestion(game: Game, now = Date.now(), questionId?: string): Game {
  const live = tickGame(game, now)
  assertQuestionId(live, questionId)
  if (live.questionIndex !== game.questionIndex || live.phase === "podium") return live
  if (live.phase !== "reveal") throw new Error("Attendez le verdict.")
  return advanceQuestion(live, now)
}

export function pauseReveal(game: Game, now = Date.now(), questionId?: string): Game {
  const live = tickGame(game, now)
  assertQuestionId(live, questionId)
  if (live.phase !== "reveal") throw new Error("Pas de corrigé à suspendre.")
  if (live.revealPausedAt != null) return live
  return { ...live, revealPausedAt: now }
}

export function resumeReveal(game: Game, now = Date.now(), questionId?: string): Game {
  const live = tickGame(game, now)
  assertQuestionId(live, questionId)
  if (live.phase !== "reveal") throw new Error("Pas de corrigé à reprendre.")
  if (live.revealPausedAt == null) return live
  return {
    ...live,
    revealStartedAt: (live.revealStartedAt ?? live.revealPausedAt) + (now - live.revealPausedAt),
    revealPausedAt: null,
  }
}

function playerStreak(game: Game, player: Player) {
  const deck = questionsFor(game)
  const completed = game.phase === "lobby"
    ? 0
    : game.phase === "podium"
      ? deck.length
      : game.questionIndex + (game.phase === "reveal" ? 1 : 0)
  let streak = 0
  let bestStreak = 0
  for (const question of deck.slice(0, completed)) {
    streak = player.answers[question.id]?.correct ? streak + 1 : 0
    bestStreak = Math.max(bestStreak, streak)
  }
  return { streak, bestStreak }
}

export function toPublic(game: Game, viewer: Viewer, storage: "memory" | "redis", now = Date.now()): PublicGame {
  const live = game
  const liveQuestion = currentQuestion(live)
  const question =
    live.phase === "question" || live.phase === "reveal" ? liveQuestion : null
  const isHost = viewer.role === "host" && viewer.token === live.hostToken
  const youId = viewer.role === "player" ? viewer.playerId : null
  const showCorrect = live.phase === "reveal" || live.phase === "podium"
  const counts = [0, 0, 0, 0]
  if (question) {
    for (const player of live.players) {
      const answer = player.answers[question.id]
      if (answer) counts[answer.choiceIndex] += 1
    }
  }

  const remaining = question
    ? remainingMs(live.questionStartedAt, question.timeLimitMs, now)
    : 0

  const visibleScore = (player: Player) => player.score - (
    live.phase === "question" && question ? (player.answers[question.id]?.points ?? 0) : 0
  )
  const players: PublicPlayer[] = [...live.players]
    .sort((a, b) => visibleScore(b) - visibleScore(a) || a.joinedAt - b.joinedAt)
    .map((player) => {
      const answer = question ? player.answers[question.id] : undefined
      const row: PublicPlayer = {
        id: player.id,
        nickname: player.nickname,
        score: visibleScore(player),
        answered: Boolean(answer),
        ...playerStreak(live, player),
      }
      if (showCorrect && answer) {
        row.lastCorrect = answer.correct
        row.lastPoints = answer.points
      }
      return row
    })

  const youPlayer = youId ? live.players.find((p) => p.id === youId) : undefined
  const youAnswer = question && youPlayer ? youPlayer.answers[question.id] : undefined
  const quizId = quizIdOf(live)
  const quiz = quizId ? getQuiz(quizId) : null
  const deck = questionsFor(live)

  return {
    pin: live.pin,
    revision: live.revision ?? 0,
    phase: live.phase,
    questionIndex: live.questionIndex,
    questionCount: deck.length,
    question: question
      ? {
          id: question.id,
          day: question.day,
          context: question.context,
          prompt: question.prompt,
          choices: question.choices.map((text, index) => ({
            text,
            count: isHost || showCorrect ? counts[index] : undefined,
          })),
          timeLimitMs: question.timeLimitMs,
          correctIndex: showCorrect ? question.correctIndex : undefined,
          explanation: showCorrect ? question.explanation : undefined,
        }
      : null,
    questionStartedAt: live.questionStartedAt,
    serverNow: now,
    remainingMs: remaining,
    revealRemainingMs: revealRemainingMs(live, now),
    revealPaused: live.phase === "reveal" && live.revealPausedAt != null,
    players,
    you: players.find((player) => player.id === youId) ?? null,
    yourChoiceIndex: youAnswer?.choiceIndex ?? null,
    answeredCount: question
      ? live.players.filter((p) => p.answers[question.id]).length
      : 0,
    storage,
    quizId: quiz?.id ?? null,
    quizTitle: quiz?.title ?? null,
  }
}
