"use client"

import { useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"
import type { ExportData } from "@/lib/export-import"

export function useExportImport() {
  const { user } = useAuth()
  
  // Mutations
  const importDataMutation = useMutation(api.exportImport.importUserData)

  const exportData = useCallback(async (): Promise<ExportData | null> => {
    if (!user) return null

    try {
      // Use the Convex query to get export data
      const exportData = await fetch(`/api/export?userId=${user.id}`)
      if (!exportData.ok) throw new Error("Export failed")
      return await exportData.json()
    } catch (error) {
      console.error("Export failed:", error)
      return null
    }
  }, [user])

  const importData = useCallback(async (file: File) => {
    if (!user) {
      return { success: false, message: "User not logged in" }
    }

    try {
      const text = await file.text()
      const data: ExportData = JSON.parse(text)

      if (!data.version || !data.goalSets || !data.tasks) {
        return { success: false, message: "Invalid file format" }
      }

      const result = await importDataMutation({
        userId: user.id as Id<"users">,
        data: {
          version: data.version,
          exportDate: data.exportDate,
          user: {
            name: data.user.name,
            email: data.user.email,
            preferences: data.user.preferences,
          },
          goalSets: data.goalSets.map(gs => ({
            name: gs.name,
            description: gs.description,
            color: gs.color,
            icon: gs.icon,
            isActive: gs.isActive,
            targetCompletionDate: gs.targetCompletionDate?.getTime(),
            priority: gs.priority,
          })),
          tasks: data.tasks.map(task => ({
            goalSetId: task.goalSetId,
            title: task.title,
            description: task.description,
            isCompleted: task.isCompleted,
            priority: task.priority,
            estimatedDuration: task.estimatedDuration,
            actualDuration: task.actualDuration,
            scheduledDate: task.scheduledDate?.getTime(),
            completedAt: task.completedAt?.getTime(),
            recurrence: task.recurrence ? {
              ...task.recurrence,
              endDate: task.recurrence.endDate?.getTime(),
            } : undefined,
            tags: task.tags,
          })),
          completions: data.completions?.map(completion => ({
            taskId: completion.taskId,
            completedAt: completion.completedAt.getTime(),
            duration: completion.duration,
            notes: completion.notes,
            mood: completion.mood,
          })) || [],
        },
      })

      return result
    } catch (error) {
      console.error("Import failed:", error)
      return { success: false, message: "Failed to parse file" }
    }
  }, [user, importDataMutation])

  const downloadJSON = useCallback((data: ExportData, filename?: string) => {
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
  }, [])

  const downloadCSV = useCallback((tasks: any[], goalSets: any[], filename?: string) => {
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
      const goalSet = goalSets.find((gs) => gs._id === task.goalSetId)
      return [
        task.title,
        goalSet?.name || "Unknown",
        task.priority,
        task.isCompleted ? "Completed" : "Pending",
        new Date(task._creationTime).toLocaleDateString(),
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
  }, [])

  return {
    exportData,
    importData,
    downloadJSON,
    downloadCSV,
  }
}
