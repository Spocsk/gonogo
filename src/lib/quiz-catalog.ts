import { ODYSSEY_QUESTIONS } from "./questions"
import { DOCK_CONTROL_QUESTIONS } from "./quizzes/dock-control"
import { SQL_OBJECTS_QUESTIONS } from "./quizzes/sql-objects"
import type { DayTag, Quiz, QuizSummary } from "./types"

const DAY_ORDER: DayTag[] = ["J1", "J2", "J3", "J4", "J5"]

export const DEFAULT_QUIZ_ID = "odyssey"

export const QUIZZES: Quiz[] = [
  {
    id: "odyssey",
    title: "ODYSSEY-01",
    subtitle: "Recap React + TypeScript · jours 1 et 5",
    questions: ODYSSEY_QUESTIONS,
  },
  {
    id: "dock-control",
    title: "Dock Control",
    subtitle: "Recap Python + FastAPI · jours 1 à 5",
    questions: DOCK_CONTROL_QUESTIONS,
  },
  {
    id: "sql-objects",
    title: "Le Cabinet du Quai",
    subtitle: "SQL · Objets programmables · fonctions, procédures et triggers",
    questions: SQL_OBJECTS_QUESTIONS,
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
    days: DAY_ORDER.filter((day) =>
      quiz.questions.some((question) => question.day === day),
    ),
  }))
}
