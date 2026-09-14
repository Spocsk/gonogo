import { randomBytes, randomUUID } from "crypto"
import { QUESTIONS } from "./questions"
import { remainingMs, scoreAnswer } from "./scoring"
import type { Game, Player, Viewer, PublicGame, PublicPlayer } from "./types"

export function createPin(): string {
  const n = randomBytes(3).readUIntBE(0, 3) % 1_000_000
  return n.toString().padStart(6, "0")
}

export function createGame(pin: string): Game {
  return {
    pin,
    hostToken: randomUUID(),
    createdAt: Date.now(),
    phase: "lobby",
    questionIndex: 0,
    questionStartedAt: null,
    players: [],
  }
}

export function normalizeNickname(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, 18)
}

export function nicknameOk(name: string): boolean {
  return name.length >= 2 && /^[\p{L}\p{N} _.\-]+$/u.test(name)
}

export function currentQuestion(game: Game) {
  return QUESTIONS[game.questionIndex] ?? null
}

export function tickGame(game: Game, now = Date.now()): Game {
  if (game.phase !== "question" || game.questionStartedAt == null) return game
  const question = currentQuestion(game)
  if (!question) return { ...game, phase: "podium", questionStartedAt: null }
  if (remainingMs(game.questionStartedAt, question.timeLimitMs, now) > 0) {
    return game
  }
  return { ...game, phase: "reveal" }
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

export function startBrief(game: Game): Game {
  if (game.phase !== "lobby") throw new Error("Le brief a déjà commencé.")
  return {
    ...game,
    phase: "question",
    questionIndex: 0,
    questionStartedAt: Date.now(),
  }
}

export function answerQuestion(
  game: Game,
  playerId: string,
  choiceIndex: number,
  now = Date.now(),
): Game {
  const live = tickGame(game, now)
  if (live.phase !== "question") {
    throw new Error("Hors fenêtre de réponse.")
  }
  const question = currentQuestion(live)
  if (!question) throw new Error("Question introuvable.")
  if (choiceIndex < 0 || choiceIndex > 3) {
    throw new Error("Choix invalide.")
  }
  const player = live.players.find((p) => p.id === playerId)
  if (!player) throw new Error("Opérateur inconnu.")
  if (player.answers[question.id]) {
    throw new Error("Réponse déjà transmise.")
  }
  const elapsed = now - (live.questionStartedAt ?? now)
  const correct = choiceIndex === question.correctIndex
  const points = scoreAnswer(correct, elapsed, question.timeLimitMs)
  const nextPlayer: Player = {
    ...player,
    score: player.score + points,
    answers: {
      ...player.answers,
      [question.id]: { choiceIndex, at: now, correct, points },
    },
  }
  return {
    ...live,
    players: live.players.map((p) => (p.id === playerId ? nextPlayer : p)),
  }
}

export function revealNow(game: Game): Game {
  const live = tickGame(game)
  if (live.phase !== "question" && live.phase !== "reveal") {
    throw new Error("Pas de question à juger.")
  }
  return { ...live, phase: "reveal" }
}

export function nextQuestion(game: Game): Game {
  const live = tickGame(game)
  if (live.phase !== "reveal") throw new Error("Attendez le verdict.")
  const nextIndex = live.questionIndex + 1
  if (nextIndex >= QUESTIONS.length) {
    return { ...live, phase: "podium", questionStartedAt: null }
  }
  return {
    ...live,
    phase: "question",
    questionIndex: nextIndex,
    questionStartedAt: Date.now(),
  }
}

export function toPublic(game: Game, viewer: Viewer, storage: "memory" | "redis"): PublicGame {
  const now = Date.now()
  const live = tickGame(game, now)
  const liveQuestion = currentQuestion(live)
  const question =
    live.phase === "question" || live.phase === "reveal" ? liveQuestion : null
  const isHost = viewer.role === "host" && viewer.token === live.hostToken
  const youId = viewer.role === "player" ? viewer.playerId : null
  const showCorrect = live.phase === "reveal" || live.phase === "podium" || isHost
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

  const players: PublicPlayer[] = [...live.players]
    .sort((a, b) => b.score - a.score || a.joinedAt - b.joinedAt)
    .map((player) => {
      const answer = question ? player.answers[question.id] : undefined
      const row: PublicPlayer = {
        id: player.id,
        nickname: player.nickname,
        score: player.score,
        answered: Boolean(answer),
      }
      if (showCorrect && answer) {
        row.lastCorrect = answer.correct
        row.lastPoints = answer.points
      }
      return row
    })

  const youPlayer = youId ? live.players.find((p) => p.id === youId) : undefined
  const youAnswer = question && youPlayer ? youPlayer.answers[question.id] : undefined

  return {
    pin: live.pin,
    phase: live.phase,
    questionIndex: live.questionIndex,
    questionCount: QUESTIONS.length,
    question: question
      ? {
          id: question.id,
          day: question.day,
          prompt: question.prompt,
          choices: question.choices.map((text, index) => ({
            text,
            count: isHost || showCorrect ? counts[index] : undefined,
          })),
          timeLimitMs: question.timeLimitMs,
          correctIndex: showCorrect ? question.correctIndex : undefined,
        }
      : null,
    questionStartedAt: live.questionStartedAt,
    serverNow: now,
    remainingMs: remaining,
    players,
    you: youPlayer
      ? {
          id: youPlayer.id,
          nickname: youPlayer.nickname,
          score: youPlayer.score,
          answered: Boolean(youAnswer),
          lastCorrect: youAnswer?.correct,
          lastPoints: youAnswer?.points,
        }
      : null,
    yourChoiceIndex: youAnswer?.choiceIndex ?? null,
    answeredCount: question
      ? live.players.filter((p) => p.answers[question.id]).length
      : 0,
    storage,
  }
}
