import { ODYSSEY_QUESTIONS } from "./questions"
import { CABINET_EVAL_QUESTIONS } from "./quizzes/cabinet-eval"
import { DOCK_CONTROL_QUESTIONS } from "./quizzes/dock-control"
import { SQL_OBJECTS_QUESTIONS } from "./quizzes/sql-objects"
import type { DayTag, Quiz, QuizMode, QuizSummary } from "./types"

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
    subtitle: "SQL · Objets programmables, analyse et CTE",
    questions: SQL_OBJECTS_QUESTIONS,
  },
  {
    id: "cabinet-eval",
    title: "Évaluation · Le Cabinet du Quai",
    subtitle: "QCM noté sur 20 · objets, analytique, administration",
    questions: CABINET_EVAL_QUESTIONS,
    mode: "exam",
  },
]

export function getQuiz(id: string): Quiz | null {
  return QUIZZES.find((quiz) => quiz.id === id) ?? null
}

export function quizMode(quiz: Quiz | null | undefined): QuizMode {
  return quiz?.mode ?? "live"
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
    mode: quizMode(quiz),
  }))
}
