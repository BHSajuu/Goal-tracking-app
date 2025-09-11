"use client"

import { GoalSetCard } from "@/components/goal-set-card"
import { EmptyState } from "./empty-state"
import { Target, Plus } from "lucide-react"
import type { GoalSet } from "@/lib/types"

interface GoalSetGridProps {
  goalSets: GoalSet[]
  getGoalSetTaskStats: (goalSetId: string) => { total: number; completed: number }
  onEdit: (goalSet: GoalSet) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string) => void
  onAddTask: (goalSetId: string) => void
  emptyState?: {
    title: string
    description: string
    buttonText: string
    onButtonClick: () => void
  }
  maxItems?: number
}

export function GoalSetGrid({
  goalSets,
  getGoalSetTaskStats,
  onEdit,
  onDelete,
  onToggleActive,
  onAddTask,
  emptyState,
  maxItems,
}: GoalSetGridProps) {
  const displayGoalSets = maxItems ? goalSets.slice(0, maxItems) : goalSets

  if (goalSets.length === 0 && emptyState) {
    return (
      <EmptyState
        icon={Target}
        title={emptyState.title}
        description={emptyState.description}
        buttonText={emptyState.buttonText}
        onButtonClick={emptyState.onButtonClick}
        buttonIcon={Plus}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayGoalSets.map((goalSet) => {
        const stats = getGoalSetTaskStats(goalSet.id)
        return (
          <GoalSetCard
            key={goalSet.id}
            goalSet={goalSet}
            taskCount={stats.total}
            completedTaskCount={stats.completed}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
            onAddTask={onAddTask}
          />
        )
      })}
    </div>
  )
}
