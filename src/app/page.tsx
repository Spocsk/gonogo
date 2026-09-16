import { Suspense } from "react"
import Link from "next/link"
import { Frame } from "@/components/frame"
import { JoinForm } from "@/components/join-form"

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col lg:flex-row min-h-dvh">
      <section className="flex flex-1 flex-col justify-end px-6 py-10 md:px-12 lg:px-16 lg:py-16">
        <h1 className="font-display text-[clamp(3.4rem,15vw,9rem)] leading-[0.82] tracking-tight uppercase">
          GO
          <span className="block text-go">NO-GO</span>
        </h1>
        <p className="mt-8 max-w-md text-lg text-paper-dim leading-relaxed">
          Recap live React + TypeScript, Bachelor 2. Une question, quatre
          réponses, un callsign. Jours 1 à 5 d’Orbital Command.
        </p>
      </section>

      <section className="flex flex-1 items-center px-6 pb-12 md:px-12 lg:px-16">
        <Frame className="w-full max-w-md bg-ink/70 p-6 md:p-8">
          <h2 className="font-display text-3xl uppercase tracking-wide mb-6">
            Rejoindre le brief
          </h2>
          <Suspense
            fallback={
              <p className="text-paper-dim">Chargement du lien sol…</p>
            }
          >
            <JoinForm />
          </Suspense>
          <p className="mt-8 text-sm text-paper-dim">
            Vous animez la séance ?{" "}
            <Link href="/host" className="text-go underline-offset-4 hover:underline">
              Ouvrir la console formateur
            </Link>
          </p>
        </Frame>
      </section>
    </main>
  )
}
