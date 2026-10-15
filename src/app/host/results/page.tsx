"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { Frame } from "@/components/frame"
import type { ExamResult, ExamSummary } from "@/lib/exam-results"

type KeyQuestion = {
  id: string
  prompt: string
  choices: string[]
  correctIndex: number
}

const LETTERS = ["A", "B", "C", "D"]

export default function ResultsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Results />
    </Suspense>
  )
}

function Loading() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-8">
      <p className="font-display text-3xl uppercase">Chargement des notes…</p>
    </main>
  )
}

function Results() {
  const params = useSearchParams()
  const sessionId = params.get("session")
  const [locked, setLocked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [list, setList] = useState<ExamSummary[] | null>(null)
  const [detail, setDetail] = useState<{ result: ExamResult; questions: KeyQuestion[] } | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const response = await fetch(sessionId ? `/api/results/${encodeURIComponent(sessionId)}` : "/api/results", { cache: "no-store" })
        const payload = await response.json()
        if (cancelled) return
        if (response.status === 401) {
          setLocked(true)
          return
        }
        if (!response.ok) {
          setError(payload.error ?? "Notes indisponibles.")
          return
        }
        setError(null)
        if (sessionId) setDetail(payload)
        else setList(payload.results)
      } catch {
        if (!cancelled) setError("Liaison sol indisponible.")
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  if (locked) {
    return (
      <main className="min-h-dvh flex items-center justify-center p-8">
        <p className="text-lg">
          Console verrouillée.{" "}
          <Link href="/host" className="text-go underline-offset-4 hover:underline">
            Entrer le mot de passe formateur
          </Link>
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-dvh flex flex-col gap-8 px-5 py-5 md:px-10 md:py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl uppercase leading-none">
          Notes des <span className="text-go">évaluations</span>
        </h1>
        <nav className="flex gap-4 font-display text-lg uppercase tracking-wide text-paper-dim">
          {sessionId ? (
            <Link href="/host/results" className="hover:text-go">Toutes les évaluations</Link>
          ) : null}
          <Link href="/host" className="hover:text-go">Console</Link>
        </nav>
      </header>
      {error ? <p className="text-nogo">{error}</p> : null}
      {sessionId ? (
        detail ? <Detail result={detail.result} questions={detail.questions} /> : error ? null : <p className="text-paper-dim">Chargement…</p>
      ) : list ? (
        <SessionList results={list} />
      ) : error ? null : (
        <p className="text-paper-dim">Chargement…</p>
      )}
    </main>
  )
}

function formatDate(at: number) {
  return new Date(at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })
}

function formatGrade(grade: number) {
  return grade.toLocaleString("fr-FR", { maximumFractionDigits: 2 })
}

function SessionList({ results }: { results: ExamSummary[] }) {
  const router = useRouter()
  if (results.length === 0) {
    return <p className="text-paper-dim text-lg">Aucune évaluation enregistrée pour l’instant.</p>
  }
  return (
    <ul className="grid gap-3">
      {results.map((result) => (
        <li key={result.sessionId}>
          <Frame className="bg-ink/50">
            <button
              type="button"
              onClick={() => router.push(`/host/results?session=${encodeURIComponent(result.sessionId)}`)}
              className="w-full text-left p-5 hover:bg-ink-3 flex flex-wrap items-baseline justify-between gap-4"
            >
              <span>
                <span className="block font-display text-2xl uppercase tracking-wide">{result.quizTitle}</span>
                <span className="block text-paper-dim mt-1">
                  {formatDate(result.startedAt)} · code {result.pin}
                  {result.complete ? "" : " · interrompue"}
                </span>
              </span>
              <span className="font-mono tabular text-paper-dim">
                {result.studentCount} étudiant{result.studentCount > 1 ? "s" : ""}
                {result.average != null ? ` · moyenne ${formatGrade(result.average)}/${result.outOf}` : ""}
              </span>
            </button>
          </Frame>
        </li>
      ))}
    </ul>
  )
}

function csvCell(value: string | number) {
  const text = String(value)
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function downloadCsv(result: ExamResult) {
  const header = ["Étudiant", `Note /${result.outOf}`, "Bonnes réponses", ...result.students[0]?.answers.map((_, index) => `Q${index + 1}`) ?? []]
  const rows = sortedStudents(result).map((student) => [
    student.name,
    formatGrade(student.grade),
    `${student.correct}/${result.questionCount}`,
    ...student.answers.map((answer) =>
      answer.choiceIndex == null ? "—" : `${LETTERS[answer.choiceIndex]}${answer.correct ? " (juste)" : " (faux)"}`,
    ),
  ])
  // The BOM lets spreadsheet software read accents correctly.
  const csv = "﻿" + [header, ...rows].map((row) => row.map(csvCell).join(";")).join("\n")
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
  const link = document.createElement("a")
  link.href = url
  link.download = `notes-${new Date(result.startedAt).toISOString().slice(0, 10)}-${result.pin}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function sortedStudents(result: ExamResult) {
  return [...result.students].sort((a, b) => a.name.localeCompare(b.name, "fr"))
}

function Detail({ result, questions }: { result: ExamResult; questions: KeyQuestion[] }) {
  const students = sortedStudents(result)
  const byId = new Map(questions.map((question) => [question.id, question]))
  const columns = result.students[0]?.answers.map((answer) => answer.questionId) ?? questions.map((question) => question.id)

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-2xl uppercase tracking-wide">{result.quizTitle}</p>
          <p className="text-paper-dim">
            {formatDate(result.startedAt)} · code {result.pin} · {students.length} étudiant{students.length > 1 ? "s" : ""}
            {result.complete ? "" : " · évaluation interrompue avant la fin"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => downloadCsv(result)}
          disabled={students.length === 0}
          className="bg-go text-ink font-display text-2xl uppercase tracking-wide px-6 py-3 disabled:opacity-40"
        >
          Exporter CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr className="font-mono text-sm text-paper-dim">
              <th className="py-2 pr-6">Étudiant</th>
              <th className="py-2 pr-6">Note /{result.outOf}</th>
              {columns.map((id, index) => (
                <th key={id} className="py-2 px-1 text-center" title={byId.get(id)?.prompt}>
                  Q{index + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.playerId} className="border-t border-ink-3">
                <td className="py-2 pr-6 whitespace-nowrap">{student.name}</td>
                <td className="py-2 pr-6 font-display text-2xl tabular">{formatGrade(student.grade)}</td>
                {student.answers.map((answer) => (
                  <td
                    key={answer.questionId}
                    className={`py-2 px-1 text-center font-mono tabular ${
                      answer.choiceIndex == null ? "text-paper-dim" : answer.correct ? "text-go" : "text-nogo"
                    }`}
                  >
                    {answer.choiceIndex == null ? "—" : LETTERS[answer.choiceIndex]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <details className="text-paper-dim">
        <summary className="cursor-pointer font-display uppercase tracking-wide">Corrigé</summary>
        <ol className="mt-3 flex flex-col gap-2">
          {columns.map((id, index) => {
            const question = byId.get(id)
            if (!question) return null
            return (
              <li key={id}>
                Q{index + 1} · {question.prompt} <span className="text-go">{LETTERS[question.correctIndex]}</span> · {question.choices[question.correctIndex]}
              </li>
            )
          })}
        </ol>
      </details>
    </section>
  )
}
