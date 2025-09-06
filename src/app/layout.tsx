import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ClientProviders } from "@/components/client-providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Goal Tracker - Achieve Your Dreams",
  description: "Advanced goal tracking and analytics platform with smart insights and productivity features",
  generator: "v0.app",
  keywords: ["goals", "productivity", "tracking", "analytics", "tasks", "planning"],
  authors: [{ name: "Goal Tracker Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
