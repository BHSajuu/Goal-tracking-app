export interface User {
  id: string
  name: string
  email: string
  createdAt: Date
  preferences: {
    theme: "light" | "dark"
    compactMode: boolean
    defaultView: "dashboard" | "analytics"
  }
}

export interface GoalSet {
  id: string
  userId: string
  name: string
  description?: string
  color: string
  icon?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  targetCompletionDate?: Date
  priority: "low" | "medium" | "high"
}

export interface Task {
  id: string
  goalSetId: string
  userId: string
  title: string
  description?: string
  isCompleted: boolean
  priority: "low" | "medium" | "high"
  estimatedDuration?: number // in minutes
  actualDuration?: number
  scheduledDate?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
  recurrence?: {
    type: "daily" | "weekly" | "monthly"
    interval: number
    daysOfWeek?: number[] // 0-6, Sunday-Saturday
    endDate?: Date
  }
  tags: string[]
}

export interface TaskCompletion {
  id: string
  taskId: string
  userId: string
  completedAt: Date
  duration?: number // actual time spent in minutes
  notes?: string
  mood?: 1 | 2 | 3 | 4 | 5 // 1-5 scale
}

export interface Analytics {
  completionRate: number
  streakDays: number
  totalTasksCompleted: number
  averageCompletionTime: number
  productivityScore: number
  weeklyProgress: Array<{
    date: string
    completed: number
    total: number
  }>
  goalSetProgress: Array<{
    goalSetId: string
    name: string
    completionRate: number
    tasksCompleted: number
    totalTasks: number
  }>
}
