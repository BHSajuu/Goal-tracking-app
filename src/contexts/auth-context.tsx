"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/lib/types"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"

interface AuthContextType {
  user: User | null
  login: (email: string, name: string) => Promise<void>
  logout: () => void
  updateUser: (updates: Partial<User>) => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Query for user by email
  const convexUser = useQuery(api.users.getUserByEmail, userEmail ? { email: userEmail } : "skip")
  
  // Mutations
  const createUserMutation = useMutation(api.users.createUser)
  const updateUserMutation = useMutation(api.users.updateUser)

  useEffect(() => {
    // Check for saved email in localStorage
    const savedEmail = localStorage.getItem("goal-tracker-user-email")
    if (savedEmail) {
      setUserEmail(savedEmail)
    } else {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (convexUser) {
      // Convert Convex user to our User type
      const userData: User = {
        id: convexUser._id,
        name: convexUser.name,
        email: convexUser.email,
        createdAt: new Date(convexUser._creationTime),
        preferences: convexUser.preferences,
      }
      setUser(userData)
      setIsLoading(false)
    } else if (userEmail && convexUser === null) {
      // User doesn't exist in database
      setIsLoading(false)
    }
  }, [convexUser, userEmail])

  const login = async (email: string, name: string) => {
    try {
      // Check if user exists
      let userId: Id<"users">
      
      if (convexUser) {
        // User exists, use their ID
        userId = convexUser._id
      } else {
        // Create new user
        userId = await createUserMutation({
          name,
          email,
          preferences: {
            theme: "dark",
            compactMode: false,
            defaultView: "dashboard",
          },
        })
      }
      
      // Save email to localStorage for persistence
      localStorage.setItem("goal-tracker-user-email", email)
      setUserEmail(email)
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setUserEmail(null)
    localStorage.removeItem("goal-tracker-user-email")
  }

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return
    
    try {
      const convexUpdates: any = {}
      
      if (updates.name !== undefined) convexUpdates.name = updates.name
      if (updates.email !== undefined) convexUpdates.email = updates.email
      if (updates.preferences !== undefined) convexUpdates.preferences = updates.preferences

      await updateUserMutation({
        id: user.id as Id<"users">,
        updates: convexUpdates,
      })
    } catch (error) {
      console.error("Update user failed:", error)
      throw error
    }
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
