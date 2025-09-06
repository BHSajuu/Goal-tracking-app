import type { User, GoalSet, Task, TaskCompletion } from "./types"
export interface ExportData {
  version: string
  exportDate: string
  user: User
  goalSets: GoalSet[]
  tasks: Task[]
  completions: TaskCompletion[]
}

export class DataExporter {
  static async exportData(user: User): Promise<ExportData> {
    // This will be called from a component that has access to Convex hooks
    // For now, return a placeholder - the actual implementation will be in the component
    throw new Error("DataExporter.exportData should be called from a React component with Convex hooks")
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
    // This will be called from a component that has access to Convex hooks
    // For now, return a placeholder - the actual implementation will be in the component
    throw new Error("DataImporter.importFromJSON should be called from a React component with Convex hooks")
  }
}
