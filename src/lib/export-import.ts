import type { User, GoalSet, Task, TaskCompletion } from "./types"
import { LocalStorage } from "./storage"

export interface ExportData {
  version: string
  exportDate: string
  user: User
  goalSets: GoalSet[]
  tasks: Task[]
  completions: TaskCompletion[]
}

export class DataExporter {
  static exportData(user: User): ExportData {
    const goalSets = LocalStorage.getGoalSets().filter((gs) => gs.userId === user.id)
    const tasks = LocalStorage.getTasks().filter((t) => t.userId === user.id)
    const completions = LocalStorage.getCompletions().filter((c) => c.userId === user.id)

    return {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      user,
      goalSets,
      tasks,
      completions,
    }
  }

  static downloadJSON(data: ExportData, filename?: string) {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = filename || `goal-tracker-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  static downloadCSV(tasks: Task[], goalSets: GoalSet[], filename?: string) {
    const headers = [
      "Task Title",
      "Goal Set",
      "Priority",
      "Status",
      "Created Date",
      "Scheduled Date",
      "Completed Date",
      "Estimated Duration",
      "Actual Duration",
      "Tags",
      "Description",
    ]

    const rows = tasks.map((task) => {
      const goalSet = goalSets.find((gs) => gs.id === task.goalSetId)
      return [
        task.title,
        goalSet?.name || "Unknown",
        task.priority,
        task.isCompleted ? "Completed" : "Pending",
        new Date(task.createdAt).toLocaleDateString(),
        task.scheduledDate ? new Date(task.scheduledDate).toLocaleDateString() : "",
        task.completedAt ? new Date(task.completedAt).toLocaleDateString() : "",
        task.estimatedDuration?.toString() || "",
        task.actualDuration?.toString() || "",
        task.tags.join("; "),
        task.description || "",
      ]
    })

    const csvContent = [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = filename || `goal-tracker-tasks-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export class DataImporter {
  static async importFromJSON(
    file: File,
    userId: string,
  ): Promise<{
    success: boolean
    message: string
    imported?: { goalSets: number; tasks: number; completions: number }
  }> {
    try {
      const text = await file.text()
      const data: ExportData = JSON.parse(text)

      if (!data.version || !data.goalSets || !data.tasks) {
        return { success: false, message: "Invalid file format" }
      }

      // Update IDs to avoid conflicts and assign to current user
      const idMap = new Map<string, string>()

      // Import goal sets
      const existingGoalSets = LocalStorage.getGoalSets()
      const newGoalSets = data.goalSets.map((gs) => {
        const newId = crypto.randomUUID()
        idMap.set(gs.id, newId)
        return {
          ...gs,
          id: newId,
          userId,
          createdAt: new Date(gs.createdAt),
          updatedAt: new Date(),
        }
      })
      LocalStorage.setGoalSets([...existingGoalSets, ...newGoalSets])

      // Import tasks with updated goal set IDs
      const existingTasks = LocalStorage.getTasks()
      const newTasks = data.tasks.map((task) => ({
        ...task,
        id: crypto.randomUUID(),
        userId,
        goalSetId: idMap.get(task.goalSetId) || task.goalSetId,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(),
        scheduledDate: task.scheduledDate ? new Date(task.scheduledDate) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        recurrence: task.recurrence
          ? {
              ...task.recurrence,
              endDate: task.recurrence.endDate ? new Date(task.recurrence.endDate) : undefined,
            }
          : undefined,
      }))
      LocalStorage.setTasks([...existingTasks, ...newTasks])

      // Import completions
      const existingCompletions = LocalStorage.getCompletions()
      const newCompletions =
        data.completions?.map((completion) => ({
          ...completion,
          id: crypto.randomUUID(),
          userId,
          completedAt: new Date(completion.completedAt),
        })) || []
      LocalStorage.setCompletions([...existingCompletions, ...newCompletions])

      return {
        success: true,
        message: "Data imported successfully",
        imported: {
          goalSets: newGoalSets.length,
          tasks: newTasks.length,
          completions: newCompletions.length,
        },
      }
    } catch (error) {
      return { success: false, message: "Failed to parse file" }
    }
  }
}
