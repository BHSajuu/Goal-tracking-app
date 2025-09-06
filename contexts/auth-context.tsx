"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/lib/types"
import { LocalStorage } from "@/lib/storage"

interface AuthContextType {
  user: User | null
  login: (email: string, name: string) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load user from localStorage on mount
    const savedUser = LocalStorage.getUser()
    if (savedUser) {
      setUser(savedUser)
    }
    setIsLoading(false)
  }, [])

  const login = (email: string, name: string) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      createdAt: new Date(),
      preferences: {
        theme: "dark",
        compactMode: false,
        defaultView: "dashboard",
      },
    }
    setUser(newUser)
    LocalStorage.setUser(newUser)
  }

  const logout = () => {
    setUser(null)
    LocalStorage.removeUser()
  }

  const updateUser = (updates: Partial<User>) => {
    if (!user) return
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    LocalStorage.setUser(updatedUser)
  }

  return <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
