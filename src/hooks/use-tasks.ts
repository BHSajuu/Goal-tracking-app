"use client"

import { useState, useEffect, useCallback } from "react"
import type { Task, TaskCompletion } from "@/lib/types"
import { LocalStorage } from "@/lib/storage"
import { useAuth } from "@/contexts/auth-context"

export function useTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [completions, setCompletions] = useState<TaskCompletion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load tasks and completions from storage
  useEffect(() => {
    if (!user) {
      setTasks([])
      setCompletions([])
      setIsLoading(false)
      return
    }

    const allTasks = LocalStorage.getTasks()
    const userTasks = allTasks.filter((task) => task.userId === user.id)
    setTasks(userTasks)

    const allCompletions = LocalStorage.getCompletions()
    const userCompletions = allCompletions.filter((completion) => completion.userId === user.id)
    setCompletions(userCompletions)

    setIsLoading(false)
  }, [user])

  const createTask = useCallback(
    (taskData: Omit<Task, "id" | "userId" | "createdAt" | "updatedAt">) => {
      if (!user) return

      const newTask: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const allTasks = LocalStorage.getTasks()
      const updatedTasks = [...allTasks, newTask]
      LocalStorage.setTasks(updatedTasks)

      setTasks((prev) => [...prev, newTask])
      return newTask
    },
    [user],
  )

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    const allTasks = LocalStorage.getTasks()
    const updatedTasks = allTasks.map((task) =>
      task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task,
    )
    LocalStorage.setTasks(updatedTasks)

    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task)))
  }, [])

  const deleteTask = useCallback((id: string) => {
    const allTasks = LocalStorage.getTasks()
    const updatedTasks = allTasks.filter((task) => task.id !== id)
    LocalStorage.setTasks(updatedTasks)

    setTasks((prev) => prev.filter((task) => task.id !== id))
  }, [])

  const completeTask = useCallback(
    (taskId: string, duration?: number, notes?: string, mood?: 1 | 2 | 3 | 4 | 5) => {
      if (!user) return

      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      // Create completion record
      const completion: TaskCompletion = {
        id: crypto.randomUUID(),
        taskId,
        userId: user.id,
        completedAt: new Date(),
        duration,
        notes,
        mood,
      }

      const allCompletions = LocalStorage.getCompletions()
      const updatedCompletions = [...allCompletions, completion]
      LocalStorage.setCompletions(updatedCompletions)
      setCompletions((prev) => [...prev, completion])

      // Update task
      updateTask(taskId, {
        isCompleted: true,
        completedAt: new Date(),
        actualDuration: duration,
      })

      // Handle recurring tasks
      if (task.recurrence) {
        createRecurringTask(task)
      }
    },
    [user, tasks, updateTask],
  )

  const uncompleteTask = useCallback(
    (taskId: string) => {
      // Remove completion records
      const allCompletions = LocalStorage.getCompletions()
      const updatedCompletions = allCompletions.filter((c) => c.taskId !== taskId)
      LocalStorage.setCompletions(updatedCompletions)
      setCompletions((prev) => prev.filter((c) => c.taskId !== taskId))

      // Update task
      updateTask(taskId, {
        isCompleted: false,
        completedAt: undefined,
        actualDuration: undefined,
      })
    },
    [updateTask],
  )

  const createRecurringTask = useCallback(
    (originalTask: Task) => {
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
      if (originalTask.recurrence.endDate && nextDate > originalTask.recurrence.endDate) {
        return
      }

      const newTask: Omit<Task, "id" | "userId" | "createdAt" | "updatedAt"> = {
        ...originalTask,
        isCompleted: false,
        completedAt: undefined,
        actualDuration: undefined,
        scheduledDate: nextDate,
      }

      createTask(newTask)
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
