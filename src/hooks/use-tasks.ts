"use client"

import { useCallback } from "react"
import type { Task, TaskCompletion } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"

export function useTasks() {
  const { user } = useAuth()
  
  // Use Convex queries to get data
  const tasks = useQuery(api.tasks.getTasksByUser, user ? { userId: user.id as Id<"users"> } : "skip") || []
  const completions = useQuery(api.taskCompletions.getCompletionsByUser, user ? { userId: user.id as Id<"users"> } : "skip") || []
  
  // Use Convex mutations
  const createTaskMutation = useMutation(api.tasks.createTask)
  const updateTaskMutation = useMutation(api.tasks.updateTask)
  const deleteTaskMutation = useMutation(api.tasks.deleteTask)
  const createCompletionMutation = useMutation(api.taskCompletions.createTaskCompletion)
  const updateCompletionMutation = useMutation(api.taskCompletions.updateTaskCompletion)
  const deleteCompletionMutation = useMutation(api.taskCompletions.deleteTaskCompletion)

  const isLoading = tasks === undefined || completions === undefined

  const createTask = useCallback(
    async (taskData: Omit<Task, "id" | "userId" | "createdAt" | "updatedAt">) => {
      if (!user) return

      const taskId = await createTaskMutation({
        goalSetId: taskData.goalSetId as Id<"goalSets">,
        userId: user.id as Id<"users">,
        title: taskData.title,
        description: taskData.description,
        isCompleted: taskData.isCompleted,
        priority: taskData.priority,
        estimatedDuration: taskData.estimatedDuration,
        actualDuration: taskData.actualDuration,
        scheduledDate: taskData.scheduledDate?.getTime(),
        completedAt: taskData.completedAt?.getTime(),
        recurrence: taskData.recurrence ? {
          ...taskData.recurrence,
          endDate: taskData.recurrence.endDate?.getTime(),
        } : undefined,
        tags: taskData.tags,
      })

      return taskId
    },
    [user, createTaskMutation],
  )

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    
    const convexUpdates: any = {}
    
    if (updates.title !== undefined) convexUpdates.title = updates.title
    if (updates.description !== undefined) convexUpdates.description = updates.description
    if (updates.isCompleted !== undefined) convexUpdates.isCompleted = updates.isCompleted
    if (updates.priority !== undefined) convexUpdates.priority = updates.priority
    if (updates.estimatedDuration !== undefined) convexUpdates.estimatedDuration = updates.estimatedDuration
    if (updates.actualDuration !== undefined) convexUpdates.actualDuration = updates.actualDuration
    if (updates.scheduledDate !== undefined) convexUpdates.scheduledDate = updates.scheduledDate?.getTime()
    if (updates.completedAt !== undefined) convexUpdates.completedAt = updates.completedAt?.getTime()
    if (updates.recurrence !== undefined) {
      convexUpdates.recurrence = updates.recurrence ? {
        ...updates.recurrence,
        endDate: updates.recurrence.endDate?.getTime(),
      } : undefined
    }
    if (updates.tags !== undefined) convexUpdates.tags = updates.tags

    await updateTaskMutation({
      id: id as Id<"tasks">,
      updates: convexUpdates,
    })
  }, [updateTaskMutation])

  const deleteTask = useCallback(async (id: string) => {
    await deleteTaskMutation({ id: id as Id<"tasks"> })
  }, [deleteTaskMutation])

  const completeTask = useCallback(
    async (taskId: string, duration?: number, notes?: string, mood?: 1 | 2 | 3 | 4 | 5) => {
      if (!user) return

      const task = tasks.find((t) => t._id === taskId)
      if (!task) return

      // Create completion record
      await createCompletionMutation({
        taskId: taskId as Id<"tasks">,
        userId: user.id as Id<"users">,
        completedAt: Date.now(),
        duration,
        notes,
        mood,
      })

      // Update task
      await updateTask(taskId, {
        isCompleted: true,
        completedAt: new Date(),
        actualDuration: duration,
      })

      // Handle recurring tasks
      if (task.recurrence) {
        createRecurringTask(task)
      }
    },
    [user, tasks, updateTask, createCompletionMutation],
  )

  const uncompleteTask = useCallback(
    async (taskId: string) => {
      
      // Remove completion records
      const taskCompletions = completions.filter((c) => c.taskId === taskId)
      for (const completion of taskCompletions) {
        await deleteCompletionMutation({ id: completion._id as Id<"taskCompletions"> })
      }

      // Update task
      await updateTask(taskId, {
        isCompleted: false,
        completedAt: undefined,
        actualDuration: undefined,
      })
    },
    [updateTask, completions, deleteCompletionMutation],
  )

  const createRecurringTask = useCallback(
    async (originalTask: any) => {
      if (!originalTask.recurrence) return

      const { type, interval } = originalTask.recurrence
      const nextDate = new Date()

      switch (type) {
        case "daily":
          nextDate.setDate(nextDate.getDate() + interval)
          break
        case "weekly":
          nextDate.setDate(nextDate.getDate() + interval * 7)
          break
        case "monthly":
          nextDate.setMonth(nextDate.getMonth() + interval)
          break
      }

      // Don't create if past end date
      if (originalTask.recurrence.endDate && nextDate > new Date(originalTask.recurrence.endDate)) {
        return
      }

      const newTask: Omit<Task, "id" | "userId" | "createdAt" | "updatedAt"> = {
        ...originalTask,
        goalSetId: originalTask.goalSetId,
        isCompleted: false,
        completedAt: undefined,
        actualDuration: undefined,
        scheduledDate: nextDate,
      }

      await createTask(newTask)
    },
    [createTask],
  )

  const getTasksForDate = useCallback(
    (date: Date) => {
      const dateStr = date.toDateString()
      return tasks.filter((task) => {
        if (!task.scheduledDate) return false
        return new Date(task.scheduledDate).toDateString() === dateStr
      })
    },
    [tasks],
  )

  const getTodaysTasks = useCallback(() => {
    return getTasksForDate(new Date())
  }, [getTasksForDate])

  const getTasksByGoalSet = useCallback(
    (goalSetId: string) => {
      return tasks.filter((task) => task.goalSetId === goalSetId)
    },
    [tasks],
  )

  return {
    tasks,
    completions,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    uncompleteTask,
    getTasksForDate,
    getTodaysTasks,
    getTasksByGoalSet,
  }
}
