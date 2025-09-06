"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Clock, Calendar, Repeat, Tag } from "lucide-react"
import type { Task, GoalSet } from "@/lib/types"

interface TaskCardProps {
  task: Task
  goalSet?: GoalSet
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onComplete: (id: string) => void
  onUncomplete: (id: string) => void
}

export function TaskCard({ task, goalSet, onEdit, onDelete, onComplete, onUncomplete }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = () => {
    if (isDeleting) {
      onDelete(task.id)
    } else {
      setIsDeleting(true)
      setTimeout(() => setIsDeleting(false), 3000)
    }
  }

  const handleToggleComplete = () => {
    if (task.isCompleted) {
      onUncomplete(task.id)
    } else {
      onComplete(task.id)
    }
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
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

  const isOverdue = task.scheduledDate && new Date(task.scheduledDate) < new Date() && !task.isCompleted

  return (
    <Card
      className={`transition-all hover:shadow-md ${task.isCompleted ? "opacity-60" : ""} ${isOverdue ? "border-destructive/50" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Checkbox checked={task.isCompleted} onCheckedChange={handleToggleComplete} className="mt-1" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <CardTitle
                  className={`text-lg leading-tight ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}
                >
                  {task.title}
                </CardTitle>
                {task.description && (
                  <CardDescription className="mt-1 line-clamp-2">{task.description}</CardDescription>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? "Confirm Delete" : "Delete"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Goal Set and Priority */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {goalSet && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: goalSet.color }} />
                  <span className="text-xs text-muted-foreground">{goalSet.name}</span>
                </div>
              )}
              <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                {task.priority}
              </Badge>
              {task.recurrence && (
                <Badge variant="outline" className="text-xs">
                  <Repeat className="h-3 w-3 mr-1" />
                  {task.recurrence.type}
                </Badge>
              )}
            </div>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}
          </div>

          {/* Scheduling and Duration */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {task.scheduledDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDateTime(task.scheduledDate)}
              </div>
            )}
            {task.estimatedDuration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.estimatedDuration}m
              </div>
            )}
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <Tag className="h-3 w-3 text-muted-foreground" />
              {task.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Completion Info */}
          {task.isCompleted && task.completedAt && (
            <div className="text-xs text-muted-foreground">
              Completed {formatDateTime(task.completedAt)}
              {task.actualDuration && ` • Took ${task.actualDuration}m`}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
