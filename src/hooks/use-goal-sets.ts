"use client"

import { useCallback } from "react"
import type { GoalSet } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"

export function useGoalSets() {
  const { user } = useAuth()
  
  // Use Convex queries to get data
  const goalSets = useQuery(api.goalSets.getGoalSetsByUser, user ? { userId: user.id as Id<"users"> } : "skip") || []
  
  // Use Convex mutations
  const createGoalSetMutation = useMutation(api.goalSets.createGoalSet)
  const updateGoalSetMutation = useMutation(api.goalSets.updateGoalSet)
  const deleteGoalSetMutation = useMutation(api.goalSets.deleteGoalSet)

  const isLoading = goalSets === undefined

  const createGoalSet = useCallback(
    async (goalSetData: Omit<GoalSet, "id" | "userId" | "createdAt" | "updatedAt">) => {
      if (!user) return

      const goalSetId = await createGoalSetMutation({
        userId: user.id as Id<"users">,
        name: goalSetData.name,
        description: goalSetData.description,
        color: goalSetData.color,
        icon: goalSetData.icon,
        isActive: goalSetData.isActive,
        targetCompletionDate: goalSetData.targetCompletionDate?.getTime(),
        priority: goalSetData.priority,
      })

      return goalSetId
    },
    [user, createGoalSetMutation],
  )

  const updateGoalSet = useCallback(async (id: string, updates: Partial<GoalSet>) => {
    
    const convexUpdates: any = {}
    
    if (updates.name !== undefined) convexUpdates.name = updates.name
    if (updates.description !== undefined) convexUpdates.description = updates.description
    if (updates.color !== undefined) convexUpdates.color = updates.color
    if (updates.icon !== undefined) convexUpdates.icon = updates.icon
    if (updates.isActive !== undefined) convexUpdates.isActive = updates.isActive
    if (updates.targetCompletionDate !== undefined) convexUpdates.targetCompletionDate = updates.targetCompletionDate?.getTime()
    if (updates.priority !== undefined) convexUpdates.priority = updates.priority

    await updateGoalSetMutation({
      id: id as Id<"goalSets">,
      updates: convexUpdates,
    })
  }, [updateGoalSetMutation])

  const deleteGoalSet = useCallback(async (id: string) => {
    await deleteGoalSetMutation({ id: id as Id<"goalSets"> })
  }, [deleteGoalSetMutation])

  const toggleGoalSetActive = useCallback(
    (id: string) => {
      updateGoalSet(id, { isActive: !goalSets.find((gs) => gs._id === id)?.isActive })
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
