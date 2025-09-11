"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import type { Task, GoalSet } from "@/lib/types"

interface TaskFormProps {
  onSubmit: (task: Omit<Task, "id" | "userId" | "createdAt" | "updatedAt">) => void
  onCancel: () => void
  goalSets: GoalSet[]
  initialData?: Partial<Task>
  isEditing?: boolean
}

export function TaskForm({ onSubmit, onCancel, goalSets, initialData, isEditing = false }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    goalSetId: initialData?.goalSetId || "",
    priority: initialData?.priority || ("medium" as const),
    estimatedDuration: initialData?.estimatedDuration?.toString() || "",
    scheduledDate: initialData?.scheduledDate ? new Date(initialData.scheduledDate).toISOString().slice(0, 16) : "",
    tags: initialData?.tags?.join(", ") || "",
    isCompleted: initialData?.isCompleted || false,
    hasRecurrence: !!initialData?.recurrence,
    recurrence: {
      type: initialData?.recurrence?.type || ("daily" as const),
      interval: initialData?.recurrence?.interval?.toString() || "1",
      daysOfWeek: initialData?.recurrence?.daysOfWeek || [],
      endDate: initialData?.recurrence?.endDate
        ? new Date(initialData.recurrence.endDate).toISOString().split("T")[0]
        : "",
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.goalSetId) return

    const taskData: Omit<Task, "id" | "userId" | "createdAt" | "updatedAt"> = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      goalSetId: formData.goalSetId,
      priority: formData.priority,
      estimatedDuration: formData.estimatedDuration ? Number.parseInt(formData.estimatedDuration) : undefined,
      scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : undefined,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      isCompleted: formData.isCompleted,
      completedAt: initialData?.completedAt,
      actualDuration: initialData?.actualDuration,
      recurrence: formData.hasRecurrence
        ? {
            type: formData.recurrence.type,
            interval: Number.parseInt(formData.recurrence.interval),
            daysOfWeek: formData.recurrence.type === "weekly" ? formData.recurrence.daysOfWeek : undefined,
            endDate: formData.recurrence.endDate ? new Date(formData.recurrence.endDate) : undefined,
          }
        : undefined,
    }

    onSubmit(taskData)
  }

  const handleDayOfWeekToggle = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        daysOfWeek: prev.recurrence.daysOfWeek.includes(day)
          ? prev.recurrence.daysOfWeek.filter((d) => d !== day)
          : [...prev.recurrence.daysOfWeek, day].sort(),
      },
    }))
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="space-y-12 p-2">
      <div className="text-sm text-muted-foreground">
        {isEditing ? "Update your task details" : "Add a new task to your goal set"}
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Morning workout, Read 20 pages, Practice guitar"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goalSet">Goal Set *</Label>
            <Select
              value={formData.goalSetId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, goalSetId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a goal set" />
              </SelectTrigger>
              <SelectContent>
                {goalSets
                  .filter((gs) => gs.isActive)
                  .map((goalSet) => (
                    <SelectItem key={goalSet.id} value={goalSet.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: goalSet.color }} />
                        {goalSet.name}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Add more details about this task..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setFormData((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <Badge variant="secondary">Low</Badge>
                  </SelectItem>
                  <SelectItem value="medium">
                    <Badge variant="default">Medium</Badge>
                  </SelectItem>
                  <SelectItem value="high">
                    <Badge variant="destructive">High</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData((prev) => ({ ...prev, estimatedDuration: e.target.value }))}
                placeholder="30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date</Label>
              <Input
                id="scheduledDate"
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, scheduledDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
              placeholder="exercise, morning, important"
            />
          </div>

          {/* Recurrence Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="recurrence"
                checked={formData.hasRecurrence}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, hasRecurrence: checked }))}
              />
              <Label htmlFor="recurrence">Recurring Task</Label>
            </div>

            {formData.hasRecurrence && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Repeat Every</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={formData.recurrence.interval}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            recurrence: { ...prev.recurrence, interval: e.target.value },
                          }))
                        }
                        className="w-20"
                      />
                      <Select
                        value={formData.recurrence.type}
                        onValueChange={(value: "daily" | "weekly" | "monthly") =>
                          setFormData((prev) => ({
                            ...prev,
                            recurrence: { ...prev.recurrence, type: value, daysOfWeek: [] },
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Day(s)</SelectItem>
                          <SelectItem value="weekly">Week(s)</SelectItem>
                          <SelectItem value="monthly">Month(s)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date (Optional)</Label>
                    <Input
                      type="date"
                      value={formData.recurrence.endDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          recurrence: { ...prev.recurrence, endDate: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>

                {formData.recurrence.type === "weekly" && (
                  <div className="space-y-2">
                    <Label>Days of Week</Label>
                    <div className="flex gap-2">
                      {dayNames.map((day, index) => (
                        <div key={index} className="flex items-center space-x-1">
                          <Checkbox
                            id={`day-${index}`}
                            checked={formData.recurrence.daysOfWeek.includes(index)}
                            onCheckedChange={() => handleDayOfWeekToggle(index)}
                          />
                          <Label htmlFor={`day-${index}`} className="text-sm">
                            {day}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {isEditing ? "Update Task" : "Create Task"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
    </div>
  )
}
