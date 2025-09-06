"use client"

import { useState, useEffect, useCallback } from "react"
import type { GoalSet } from "@/lib/types"
import { LocalStorage } from "@/lib/storage"
import { useAuth } from "@/contexts/auth-context"

export function useGoalSets() {
  const { user } = useAuth()
  const [goalSets, setGoalSets] = useState<GoalSet[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load goal sets from storage
  useEffect(() => {
    if (!user) {
      setGoalSets([])
      setIsLoading(false)
      return
    }

    const allGoalSets = LocalStorage.getGoalSets()
    const userGoalSets = allGoalSets.filter((gs) => gs.userId === user.id)
    setGoalSets(userGoalSets)
    setIsLoading(false)
  }, [user])

  const createGoalSet = useCallback(
    (goalSetData: Omit<GoalSet, "id" | "userId" | "createdAt" | "updatedAt">) => {
      if (!user) return

      const newGoalSet: GoalSet = {
        ...goalSetData,
        id: crypto.randomUUID(),
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const allGoalSets = LocalStorage.getGoalSets()
      const updatedGoalSets = [...allGoalSets, newGoalSet]
      LocalStorage.setGoalSets(updatedGoalSets)

      setGoalSets((prev) => [...prev, newGoalSet])
      return newGoalSet
    },
    [user],
  )

  const updateGoalSet = useCallback((id: string, updates: Partial<GoalSet>) => {
    const allGoalSets = LocalStorage.getGoalSets()
    const updatedGoalSets = allGoalSets.map((gs) => (gs.id === id ? { ...gs, ...updates, updatedAt: new Date() } : gs))
    LocalStorage.setGoalSets(updatedGoalSets)

    setGoalSets((prev) => prev.map((gs) => (gs.id === id ? { ...gs, ...updates, updatedAt: new Date() } : gs)))
  }, [])

  const deleteGoalSet = useCallback((id: string) => {
    const allGoalSets = LocalStorage.getGoalSets()
    const updatedGoalSets = allGoalSets.filter((gs) => gs.id !== id)
    LocalStorage.setGoalSets(updatedGoalSets)

    setGoalSets((prev) => prev.filter((gs) => gs.id !== id))
  }, [])

  const toggleGoalSetActive = useCallback(
    (id: string) => {
      updateGoalSet(id, { isActive: !goalSets.find((gs) => gs.id === id)?.isActive })
    },
    [goalSets, updateGoalSet],
  )

  return {
    goalSets,
    isLoading,
    createGoalSet,
    updateGoalSet,
    deleteGoalSet,
    toggleGoalSetActive,
  }
}
