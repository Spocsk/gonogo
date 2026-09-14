import type { Metadata, Viewport } from "next"
import { Big_Shoulders_Stencil, Chivo_Mono, Source_Sans_3 } from "next/font/google"
import "./globals.css"

const display = Big_Shoulders_Stencil({
  variable: "--font-stencil",
  subsets: ["latin"],
  weight: ["700", "800"],
})

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

const data = Chivo_Mono({
  variable: "--font-data",
  subsets: ["latin"],
  weight: ["500", "700"],
})

export const metadata: Metadata = {
  title: "GO/NO-GO · Recap React TypeScript",
  description:
    "Brief live Bachelor 2 : une question, quatre réponses, un callsign. Recap des jours 1 à 4, Orbital Command.",
}

export const viewport: Viewport = {
  themeColor: "#12181f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${display.variable} ${body.variable} ${data.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
