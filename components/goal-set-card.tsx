"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Play, Pause, Calendar, Target, Plus } from "lucide-react"
import type { GoalSet } from "@/lib/types"

interface GoalSetCardProps {
  goalSet: GoalSet
  taskCount?: number
  completedTaskCount?: number
  onEdit: (goalSet: GoalSet) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string) => void
  onAddTask?: (goalSetId: string) => void
}

export function GoalSetCard({
  goalSet,
  taskCount = 0,
  completedTaskCount = 0,
  onEdit,
  onDelete,
  onToggleActive,
  onAddTask,
}: GoalSetCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = () => {
    if (isDeleting) {
      onDelete(goalSet.id)
    } else {
      setIsDeleting(true)
      setTimeout(() => setIsDeleting(false), 3000) // Reset after 3 seconds
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  const completionRate = taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0

  return (
    <Card className={`transition-all hover:shadow-md ${!goalSet.isActive ? "opacity-60" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: goalSet.color }} />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg leading-tight">{goalSet.name}</CardTitle>
              {goalSet.description && (
                <CardDescription className="mt-1 line-clamp-2">{goalSet.description}</CardDescription>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(goalSet)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {onAddTask && (
                <DropdownMenuItem onClick={() => onAddTask(goalSet.id)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onToggleActive(goalSet.id)}>
                {goalSet.isActive ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Confirm Delete" : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Progress Bar */}
          {taskCount > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{completionRate}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${completionRate}%`,
                    backgroundColor: goalSet.color,
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={getPriorityColor(goalSet.priority)}>{goalSet.priority}</Badge>
              {!goalSet.isActive && <Badge variant="outline">Paused</Badge>}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {goalSet.targetCompletionDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(goalSet.targetCompletionDate)}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {completedTaskCount}/{taskCount} tasks
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
