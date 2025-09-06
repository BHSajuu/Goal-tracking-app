"use client"

import { useMemo } from "react"
import { useTasks } from "./use-tasks"
import { useGoalSets } from "./use-goal-sets"

interface SmartSuggestion {
  id: string
  type: "schedule" | "priority" | "goal" | "productivity" | "optimization" | "motivation"
  title: string
  description: string
  action?: () => void
  priority: "high" | "medium" | "low"
  icon?: string
}

export function useSmartSuggestions() {
  const { tasks, createTask, updateTask } = useTasks()
  const { goalSets } = useGoalSets()

  const suggestions = useMemo((): SmartSuggestion[] => {
    const suggestions: SmartSuggestion[] = []

    // Time-based scheduling optimization
    const now = new Date()
    const currentHour = now.getHours()
    const unscheduledTasks = tasks.filter((t) => !t.isCompleted && !t.scheduledDate)

    if (unscheduledTasks.length > 0) {
      const timeBasedSuggestion =
        currentHour < 12
          ? "Morning is ideal for high-focus tasks. Schedule your most important work now."
          : currentHour < 17
            ? "Afternoon energy dip? Consider scheduling lighter tasks or taking a break."
            : "Evening planning: Schedule tomorrow's priorities while they're fresh in your mind."

      suggestions.push({
        id: "time-optimized-scheduling",
        type: "optimization",
        title: "Smart Time Scheduling",
        description: `${unscheduledTasks.length} tasks need scheduling. ${timeBasedSuggestion}`,
        priority: "high",
        icon: "⏰",
      })
    }

    // Workload balance analysis
    const highPriorityTasks = tasks.filter((t) => !t.isCompleted && t.priority === "high")
    const mediumPriorityTasks = tasks.filter((t) => !t.isCompleted && t.priority === "medium")
    const lowPriorityTasks = tasks.filter((t) => !t.isCompleted && t.priority === "low")

    if (highPriorityTasks.length > 5) {
      suggestions.push({
        id: "priority-overload",
        type: "optimization",
        title: "Priority Overload Detected",
        description: `${highPriorityTasks.length} high-priority tasks may cause burnout. Consider redistributing some as medium priority.`,
        priority: "high",
        icon: "⚡",
      })
    }

    // Goal momentum analysis
    const activeGoalSets = goalSets.filter((gs) => gs.isActive)
    const goalMomentum = activeGoalSets.map((goalSet) => {
      const goalTasks = tasks.filter((t) => t.goalSetId === goalSet._id)
      const recentCompletions = goalTasks.filter((t) => {
        if (!t.completedAt) return false
        const daysDiff = (Date.now() - new Date(t.completedAt).getTime()) / (1000 * 60 * 60 * 24)
        return daysDiff <= 3
      })
      return { goalSet, momentum: recentCompletions.length, totalTasks: goalTasks.length }
    })

    const stagnantGoals = goalMomentum.filter((g) => g.totalTasks > 0 && g.momentum === 0)
    if (stagnantGoals.length > 0) {
      suggestions.push({
        id: "goal-momentum",
        type: "motivation",
        title: "Reignite Your Goals",
        description: `${stagnantGoals.length} goals haven't seen progress in 3 days. Pick one small task to rebuild momentum.`,
        priority: "medium",
        icon: "🔥",
      })
    }

    // Overdue task intelligence
    const overdueTasks = tasks.filter(
      (t) => !t.isCompleted && t.scheduledDate && new Date(t.scheduledDate) < new Date(),
    )
    if (overdueTasks.length > 0) {
      const oldestOverdue = overdueTasks.reduce((oldest, task) =>
        new Date(task.scheduledDate!) < new Date(oldest.scheduledDate!) ? task : oldest,
      )
      const daysPastDue = Math.floor(
        (Date.now() - new Date(oldestOverdue.scheduledDate!).getTime()) / (1000 * 60 * 60 * 24),
      )

      suggestions.push({
        id: "overdue-analysis",
        type: "priority",
        title: "Overdue Task Strategy",
        description: `${overdueTasks.length} overdue tasks (oldest: ${daysPastDue} days). Consider breaking large tasks into smaller steps or rescheduling unrealistic deadlines.`,
        priority: "high",
        icon: "🚨",
      })
    }

    // Productivity pattern recognition
    const completedTasks = tasks.filter((t) => t.isCompleted && t.completedAt)
    if (completedTasks.length >= 5) {
      const completionTimes = completedTasks.map((t) => new Date(t.completedAt!).getHours())
      const mostProductiveHour = completionTimes.reduce((a, b, i, arr) =>
        arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length ? a : b,
      )

      const timeOfDay = mostProductiveHour < 12 ? "morning" : mostProductiveHour < 17 ? "afternoon" : "evening"
      suggestions.push({
        id: "productivity-pattern",
        type: "optimization",
        title: "Your Peak Performance Time",
        description: `You complete most tasks in the ${timeOfDay} (around ${mostProductiveHour}:00). Schedule important work during this window.`,
        priority: "medium",
        icon: "📊",
      })
    }

    // Task complexity analysis
    const tasksWithEstimates = tasks.filter((t) => !t.isCompleted && t.estimatedDuration)
    const longTasks = tasksWithEstimates.filter((t) => (t.estimatedDuration || 0) > 120) // > 2 hours

    if (longTasks.length > 0) {
      suggestions.push({
        id: "task-breakdown",
        type: "optimization",
        title: "Break Down Large Tasks",
        description: `${longTasks.length} tasks are estimated over 2 hours. Consider splitting them into smaller, manageable chunks for better progress tracking.`,
        priority: "medium",
        icon: "🔧",
      })
    }

    // Streak motivation
    const recentCompletions = completedTasks.filter((t) => {
      const daysDiff = (Date.now() - new Date(t.completedAt!).getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff <= 1
    })

    if (recentCompletions.length === 0 && completedTasks.length > 0) {
      suggestions.push({
        id: "streak-recovery",
        type: "motivation",
        title: "Rebuild Your Momentum",
        description:
          "No tasks completed today. Start with one quick win to get back on track and maintain your progress streak.",
        priority: "high",
        icon: "💪",
      })
    }

    // Goal completion celebration
    const nearCompleteGoals = goalSets.filter((gs) => {
      const goalTasks = tasks.filter((t) => t.goalSetId === gs._id)
      const completedGoalTasks = goalTasks.filter((t) => t.isCompleted)
      const completionRate = goalTasks.length > 0 ? completedGoalTasks.length / goalTasks.length : 0
      return gs.isActive && completionRate >= 0.8 && completionRate < 1
    })

    if (nearCompleteGoals.length > 0) {
      suggestions.push({
        id: "goal-completion-push",
        type: "motivation",
        title: "Victory is Within Reach! 🎯",
        description: `${nearCompleteGoals.length} goal${nearCompleteGoals.length > 1 ? "s are" : " is"} 80%+ complete. One final push will bring you to the finish line!`,
        priority: "high",
        icon: "🏆",
      })
    }

    // Empty goal sets with actionable advice
    const emptyGoalSets = goalSets.filter((gs) => {
      const goalSetTasks = tasks.filter((t) => t.goalSetId === gs._id)
      return gs.isActive && goalSetTasks.length === 0
    })
    if (emptyGoalSets.length > 0) {
      suggestions.push({
        id: "empty-goals-action",
        type: "goal",
        title: "Activate Your Goals",
        description: `${emptyGoalSets.length} goal set${emptyGoalSets.length > 1 ? "s need" : " needs"} tasks. Start with 2-3 small, specific actions to build momentum.`,
        priority: "medium",
        icon: "🎯",
      })
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }, [tasks, goalSets])

  const autoScheduleSuggestion = useMemo(() => {
    const unscheduledTasks = tasks.filter((t) => !t.isCompleted && !t.scheduledDate)
    if (unscheduledTasks.length === 0) return null

    return {
      taskCount: unscheduledTasks.length,
      action: () => {
        const now = new Date()
        const startDate = new Date(now)
        startDate.setHours(9, 0, 0, 0)

        // Smart scheduling based on task priority and estimated duration
        const sortedTasks = unscheduledTasks.sort((a, b) => {
          const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 }
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
          if (priorityDiff !== 0) return priorityDiff

          // Secondary sort by estimated duration (shorter tasks first)
          const aDuration = a.estimatedDuration || 60
          const bDuration = b.estimatedDuration || 60
          return aDuration - bDuration
        })

        const currentDate = new Date(startDate)
        let dailyWorkload = 0
        const maxDailyHours = 6 // Maximum 6 hours of scheduled work per day

        sortedTasks.forEach((task) => {
          const taskDuration = task.estimatedDuration || 60
          const taskHours = taskDuration / 60

          // If adding this task exceeds daily limit, move to next day
          if (dailyWorkload + taskHours > maxDailyHours) {
            currentDate.setDate(currentDate.getDate() + 1)
            currentDate.setHours(9, 0, 0, 0)
            dailyWorkload = 0
          }

          // Schedule the task
          const scheduleTime = new Date(currentDate)
          scheduleTime.setMinutes(scheduleTime.getMinutes() + dailyWorkload * 60)

          console.log(`[v0] Smart scheduling "${task.title}" for ${scheduleTime.toLocaleString()}`)

          updateTask(task._id, {
            scheduledDate: scheduleTime,
          })

          dailyWorkload += taskHours
        })
      },
    }
  }, [tasks, updateTask]) // Added updateTask to dependencies

  return {
    suggestions,
    autoScheduleSuggestion,
  }
}
