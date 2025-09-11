"use client"

import { TaskCard } from "@/components/task-card"
import { EmptyState } from "./empty-state"
import { Plus } from "lucide-react"
import type { Task, GoalSet } from "@/lib/types"

interface TaskListProps {
  tasks: Task[]
  goalSets: GoalSet[]
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onComplete: (id: string) => void
  onUncomplete: (id: string) => void
  emptyState?: {
    title: string
    description: string
    buttonText: string
    onButtonClick: () => void
  }
}

export function TaskList({
  tasks,
  goalSets,
  onEdit,
  onDelete,
  onComplete,
  onUncomplete,
  emptyState,
}: TaskListProps) {
  if (tasks.length === 0 && emptyState) {
    return (
      <EmptyState
        icon={Plus}
        title={emptyState.title}
        description={emptyState.description}
        buttonText={emptyState.buttonText}
        onButtonClick={emptyState.onButtonClick}
        buttonIcon={Plus}
      />
    )
  }

  return (
    <div className="grid gap-3">
      {tasks.map((task) => {
        const goalSet = goalSets.find((gs) => gs.id === task.goalSetId)
        return (
          <TaskCard
            key={task.id}
            task={task}
            goalSet={goalSet}
            onEdit={onEdit}
            onDelete={onDelete}
            onComplete={onComplete}
            onUncomplete={onUncomplete}
          />
        )
      })}
    </div>
  )
}
