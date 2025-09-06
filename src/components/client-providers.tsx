"use client"

import type React from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { Suspense } from "react"
import { ErrorBoundary } from "@/components/error-boundary"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { ConvexProvider } from "convex/react"
import convex from "@/lib/convex"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ConvexProvider client={convex}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Suspense fallback={null}>
            <AuthProvider>{children}</AuthProvider>
          </Suspense>
          <Toaster />
        </ThemeProvider>
      </ConvexProvider>
    </ErrorBoundary>
  )
}
