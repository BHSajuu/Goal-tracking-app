"use client"

import { useAuth } from "@/contexts/auth-context"
import { FullPageLoader } from "@/components/loading-spinner"
import { LoginForm } from "@/components/login-form"
import { Dashboard } from "@/components/dashboard"


export default function HomePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <FullPageLoader text="Loading your workspace..." />
  }

  if (!user) {
    return <LoginForm />
  }

  return <Dashboard />
}
