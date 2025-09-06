"use client"

import { useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useTasks } from "@/hooks/use-tasks"
import { useGoalSets } from "@/hooks/use-goal-sets"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"
import type { Analytics } from "@/lib/types"

export function useAnalytics() {
  const { user } = useAuth()
  const { tasks, completions } = useTasks()
  const { goalSets } = useGoalSets()
  
  // Use Convex analytics query
  const convexAnalytics = useQuery(api.analytics.getUserAnalytics, user ? { userId: user.id as Id<"users"> } : "skip")

  const analytics = useMemo((): Analytics => {
    // Use Convex analytics if available, otherwise fall back to local calculation
    if (convexAnalytics) {
      return {
        completionRate: convexAnalytics.completionRate,
        streakDays: convexAnalytics.streakDays,
        totalTasksCompleted: convexAnalytics.totalTasksCompleted,
        averageCompletionTime: convexAnalytics.averageCompletionTime,
        productivityScore: convexAnalytics.productivityScore,
        weeklyProgress: convexAnalytics.weeklyProgress,
        goalSetProgress: convexAnalytics.goalSetProgress,
      }
    }

    // Fallback to local calculation
    if (!user || tasks.length === 0) {
      return {
        completionRate: 0,
        streakDays: 0,
        totalTasksCompleted: 0,
        averageCompletionTime: 0,
        productivityScore: 0,
        weeklyProgress: [],
        goalSetProgress: [],
      }
    }

    const completedTasks = tasks.filter((t: any) => t.isCompleted)
    const completionRate = Math.round((completedTasks.length / tasks.length) * 100)

    // Calculate streak days
    const streakDays = calculateStreakDays(completions)

    // Calculate average completion time
    const tasksWithDuration = completions.filter((c: any) => c.duration)
    const averageCompletionTime =
      tasksWithDuration.length > 0
        ? Math.round(tasksWithDuration.reduce((sum: number, c: any) => sum + (c.duration || 0), 0) / tasksWithDuration.length)
        : 0

    // Calculate productivity score (0-100)
    const productivityScore = calculateProductivityScore(tasks, completions, streakDays)

    // Generate weekly progress data
    const weeklyProgress = generateWeeklyProgress(tasks, completions)

    // Generate goal set progress
    const goalSetProgress = goalSets.map((goalSet: any) => {
      const goalSetTasks = tasks.filter((t: any) => t.goalSetId === goalSet._id)
      const completedGoalSetTasks = goalSetTasks.filter((t: any) => t.isCompleted)

      return {
        goalSetId: goalSet._id,
        name: goalSet.name,
        completionRate:
          goalSetTasks.length > 0 ? Math.round((completedGoalSetTasks.length / goalSetTasks.length) * 100) : 0,
        tasksCompleted: completedGoalSetTasks.length,
        totalTasks: goalSetTasks.length,
      }
    })

    return {
      completionRate,
      streakDays,
      totalTasksCompleted: completedTasks.length,
      averageCompletionTime,
      productivityScore,
      weeklyProgress,
      goalSetProgress,
    }
  }, [user, tasks, completions, goalSets, convexAnalytics])

  return analytics
}

function calculateStreakDays(completions: any[]): number {
  if (completions.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const completionDates = completions
    .map((c) => {
      const date = new Date(c.completedAt)
      date.setHours(0, 0, 0, 0)
      return date.getTime()
    })
    .filter((date, index, arr) => arr.indexOf(date) === index) // Remove duplicates
    .sort((a, b) => b - a) // Sort descending

  let streak = 0
  let currentDate = today.getTime()

  for (const completionDate of completionDates) {
    if (completionDate === currentDate) {
      streak++
      currentDate -= 24 * 60 * 60 * 1000 // Go back one day
    } else if (completionDate === currentDate + 24 * 60 * 60 * 1000) {
      // Skip if we're checking yesterday and today has no completions
      if (streak === 0) {
        currentDate = completionDate
        streak++
        currentDate -= 24 * 60 * 60 * 1000
      } else {
        break
      }
    } else {
      break
    }
  }

  return streak
}

function calculateProductivityScore(tasks: any[], completions: any[], streakDays: number): number {
  if (tasks.length === 0) return 0

  const completedTasks = tasks.filter((t) => t.isCompleted)
  const completionRate = completedTasks.length / tasks.length

  // Factors for productivity score
  const completionWeight = 0.4
  const streakWeight = 0.3
  const consistencyWeight = 0.3

  // Completion rate score (0-40)
  const completionScore = completionRate * 40

  // Streak score (0-30, capped at 30 days)
  const streakScore = Math.min(streakDays / 30, 1) * 30

  // Consistency score based on regular task completion
  const consistencyScore = calculateConsistencyScore(completions) * 30

  return Math.round(completionScore + streakScore + consistencyScore)
}

function calculateConsistencyScore(completions: any[]): number {
  if (completions.length === 0) return 0

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    return date.getTime()
  })

  const completionDays = completions
    .map((c) => {
      const date = new Date(c.completedAt)
      date.setHours(0, 0, 0, 0)
      return date.getTime()
    })
    .filter((date, index, arr) => arr.indexOf(date) === index)

  const activeDays = last7Days.filter((day) => completionDays.includes(day)).length
  return activeDays / 7
}

function generateWeeklyProgress(tasks: any[], completions: any[]) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date
  })

  return last7Days.map((date) => {
    const dateStr = date.toISOString().split("T")[0]
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const dayCompletions = completions.filter((c) => {
      const completionDate = new Date(c.completedAt)
      return completionDate >= dayStart && completionDate <= dayEnd
    })

    const dayTasks = tasks.filter((t) => {
      if (!t.scheduledDate) return false
      const scheduledDate = new Date(t.scheduledDate)
      scheduledDate.setHours(0, 0, 0, 0)
      return scheduledDate.getTime() === dayStart.getTime()
    })

    return {
      date: dateStr,
      completed: dayCompletions.length,
      total: dayTasks.length,
    }
  })
}
