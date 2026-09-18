import { ODYSSEY_QUESTIONS } from "./questions"
import { DOCK_CONTROL_QUESTIONS } from "./quizzes/dock-control"
import type { Quiz, QuizSummary } from "./types"

export const DEFAULT_QUIZ_ID = "odyssey"

export const QUIZZES: Quiz[] = [
  {
    id: "odyssey",
    title: "ODYSSEY-01",
    subtitle: "Recap React + TypeScript · jours 1 à 5",
    questions: ODYSSEY_QUESTIONS,
  },
  {
    id: "dock-control",
    title: "Dock Control",
    subtitle: "Recap Python + FastAPI · jours 1 à 4",
    questions: DOCK_CONTROL_QUESTIONS,
  },
]

export function getQuiz(id: string): Quiz | null {
  return QUIZZES.find((quiz) => quiz.id === id) ?? null
}

export function listQuizSummaries(): QuizSummary[] {
  return QUIZZES.map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    subtitle: quiz.subtitle,
    questionCount: quiz.questions.length,
    days: [...new Set(quiz.questions.map((question) => question.day))],
  }))
}
