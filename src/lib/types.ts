export type DayTag = "J1" | "J2" | "J3" | "J4"
export type Phase = "lobby" | "question" | "reveal" | "podium"

export type Question = {
  id: string
  day: DayTag
  prompt: string
  choices: [string, string, string, string]
  correctIndex: 0 | 1 | 2 | 3
  timeLimitMs: number
}

export type PlayerAnswer = {
  choiceIndex: number
  at: number
  correct: boolean
  points: number
}

export type Player = {
  id: string
  nickname: string
  score: number
  answers: Record<string, PlayerAnswer>
  joinedAt: number
}

export type Game = {
  pin: string
  hostToken: string
  createdAt: number
  phase: Phase
  questionIndex: number
  questionStartedAt: number | null
  players: Player[]
}

export type PublicChoice = {
  text: string
  count?: number
}

export type PublicQuestion = {
  id: string
  day: DayTag
  prompt: string
  choices: PublicChoice[]
  timeLimitMs: number
  correctIndex?: number
}

export type PublicPlayer = {
  id: string
  nickname: string
  score: number
  answered: boolean
  lastCorrect?: boolean
  lastPoints?: number
}

export type PublicGame = {
  pin: string
  phase: Phase
  questionIndex: number
  questionCount: number
  question: PublicQuestion | null
  questionStartedAt: number | null
  serverNow: number
  remainingMs: number
  players: PublicPlayer[]
  you: PublicPlayer | null
  yourChoiceIndex: number | null
  answeredCount: number
  storage: "memory" | "redis"
}

export type Viewer =
  | { role: "host"; token: string }
  | { role: "player"; playerId: string }
  | { role: "guest" }
