import type { User, GoalSet, Task, TaskCompletion } from "./types"
import { SafeLocalStorage } from "./performance"

const STORAGE_KEYS = {
  USER: "goal-tracker-user",
  GOAL_SETS: "goal-tracker-goal-sets",
  TASKS: "goal-tracker-tasks",
  COMPLETIONS: "goal-tracker-completions",
} as const

export class LocalStorage {
  static get<T>(key: string): T | null {
    if (typeof window === "undefined") return null
    try {
      const item = SafeLocalStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  }

  static set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return
    try {
      const success = SafeLocalStorage.setItem(key, JSON.stringify(value))
      if (!success) {
        console.warn(`Failed to save ${key} to localStorage`)
      }
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
    }
  }

  static remove(key: string): void {
    if (typeof window === "undefined") return
    SafeLocalStorage.removeItem(key)
  }

  // User methods
  static getUser(): User | null {
    return this.get<User>(STORAGE_KEYS.USER)
  }

  static setUser(user: User): void {
    this.set(STORAGE_KEYS.USER, user)
  }

  static removeUser(): void {
    this.remove(STORAGE_KEYS.USER)
  }

  // Goal Sets methods
  static getGoalSets(): GoalSet[] {
    return this.get<GoalSet[]>(STORAGE_KEYS.GOAL_SETS) || []
  }

  static setGoalSets(goalSets: GoalSet[]): void {
    this.set(STORAGE_KEYS.GOAL_SETS, goalSets)
  }

  // Tasks methods
  static getTasks(): Task[] {
    return this.get<Task[]>(STORAGE_KEYS.TASKS) || []
  }

  static setTasks(tasks: Task[]): void {
    this.set(STORAGE_KEYS.TASKS, tasks)
  }

  // Task Completions methods
  static getCompletions(): TaskCompletion[] {
    return this.get<TaskCompletion[]>(STORAGE_KEYS.COMPLETIONS) || []
  }

  static setCompletions(completions: TaskCompletion[]): void {
    this.set(STORAGE_KEYS.COMPLETIONS, completions)
  }
}
