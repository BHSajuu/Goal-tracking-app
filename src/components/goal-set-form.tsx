"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { GoalSet } from "@/lib/types"

interface GoalSetFormProps {
  onSubmit: (goalSet: Omit<GoalSet, "id" | "userId" | "createdAt" | "updatedAt">) => void
  onCancel: () => void
  initialData?: Partial<GoalSet>
  isEditing?: boolean
}

const GOAL_COLORS = [
  { name: "Blue", value: "#3b82f6", class: "bg-blue-500" },
  { name: "Purple", value: "#8b5cf6", class: "bg-purple-500" },
  { name: "Green", value: "#10b981", class: "bg-green-500" },
  { name: "Orange", value: "#f59e0b", class: "bg-orange-500" },
  { name: "Red", value: "#ef4444", class: "bg-red-500" },
  { name: "Pink", value: "#ec4899", class: "bg-pink-500" },
  { name: "Teal", value: "#14b8a6", class: "bg-teal-500" },
  { name: "Indigo", value: "#6366f1", class: "bg-indigo-500" },
]

export function GoalSetForm({ onSubmit, onCancel, initialData, isEditing = false }: GoalSetFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    color: initialData?.color || GOAL_COLORS[0].value,
    priority: initialData?.priority || ("medium" as const),
    isActive: initialData?.isActive ?? true,
    targetCompletionDate: initialData?.targetCompletionDate
      ? new Date(initialData.targetCompletionDate).toISOString().split("T")[0]
      : "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      color: formData.color,
      priority: formData.priority,
      isActive: formData.isActive,
      targetCompletionDate: formData.targetCompletionDate ? new Date(formData.targetCompletionDate) : undefined,
    })
  }

  return (
    <div className="space-y-10">
      <div className="text-sm text-muted-foreground">
        {isEditing ? "Update your goal set details" : "Define a new goal set to organize your objectives"}
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Goal Set Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., DSA, Web-dev, DataScience, Health & Fitness etc"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this goal set is about..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Color Theme</Label>
              <div className="grid grid-cols-4 gap-2">
                {GOAL_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, color: color.value }))}
                    className={`
                      w-10 h-10 rounded-full border-2 transition-all
                      ${
                        formData.color === color.value
                          ? "border-foreground scale-110"
                          : "border-border hover:border-muted-foreground"
                      }
                      ${color.class}
                    `}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
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
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Low</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Medium</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">High</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Completion Date (Optional)</Label>
            <Input
              id="targetDate"
              type="date"
              value={formData.targetCompletionDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, targetCompletionDate: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {isEditing ? "Update Goal Set" : "Create Goal Set"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
    </div>
  )
}
