export type DayTag = "J1" | "J2" | "J3" | "J4" | "J5"
export type Phase = "lobby" | "question" | "reveal" | "podium"

export type Question = {
  id: string
  day: DayTag
  context: string
  prompt: string
  choices: [string, string, string, string]
  correctIndex: 0 | 1 | 2 | 3
  explanation: string
  timeLimitMs: number
}

export type Quiz = {
  id: string
  title: string
  subtitle: string
  questions: Question[]
}

export type QuizSummary = {
  id: string
  title: string
  subtitle: string
  questionCount: number
  days: DayTag[]
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
  revision?: number
  hostToken: string
  createdAt: number
  phase: Phase
  questionIndex: number
  questionStartedAt: number | null
  revealStartedAt?: number | null
  revealPausedAt?: number | null
  players: Player[]
  quizId?: string | null
}

export type PublicChoice = {
  text: string
  count?: number
}

export type PublicQuestion = {
  id: string
  day: DayTag
  context: string
  prompt: string
  choices: PublicChoice[]
  timeLimitMs: number
  correctIndex?: number
  explanation?: string
}

export type PublicPlayer = {
  id: string
  nickname: string
  score: number
  answered: boolean
  streak: number
  bestStreak: number
  lastCorrect?: boolean
  lastPoints?: number
}

export type PublicGame = {
  pin: string
  revision: number
  phase: Phase
  questionIndex: number
  questionCount: number
  question: PublicQuestion | null
  questionStartedAt: number | null
  serverNow: number
  remainingMs: number
  revealRemainingMs: number
  revealPaused: boolean
  players: PublicPlayer[]
  you: PublicPlayer | null
  yourChoiceIndex: number | null
  answeredCount: number
  storage: "memory" | "redis"
  quizId: string | null
  quizTitle: string | null
}

export type Viewer =
  | { role: "host"; token: string }
  | { role: "player"; playerId: string }
  | { role: "guest" }
