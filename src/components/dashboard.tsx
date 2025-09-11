"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useGoalSets } from "@/hooks/use-goal-sets"
import { useTasks } from "@/hooks/use-tasks"
import { useAnalytics } from "@/hooks/use-analytics"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { GoalSetForm } from "@/components/goal-set-form"
import { TaskForm } from "@/components/task-form"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { SettingsDialog } from "@/components/settings-dialog"
import { StatsCard } from "@/components/dashboard/stats-card"
import { EmptyState } from "@/components/dashboard/empty-state"
import { TabHeader } from "@/components/dashboard/tab-header"
import { TaskList } from "@/components/dashboard/task-list"
import { GoalSetGrid } from "@/components/dashboard/goal-set-grid"
import { SectionHeader } from "@/components/dashboard/section-header"
import { LogOut, Plus, Target, Calendar, BarChart3, Settings, TrendingUp, Award } from "lucide-react"
import type { GoalSet, Task } from "@/lib/types"

export function Dashboard() {
  const { user, logout } = useAuth()
  const {
    goalSets,
    isLoading: goalSetsLoading,
    createGoalSet,
    updateGoalSet,
    deleteGoalSet,
    toggleGoalSetActive,
  } = useGoalSets()
  const { tasks, createTask, updateTask, deleteTask, completeTask, uncompleteTask, getTodaysTasks, getTasksByGoalSet } =
    useTasks()
  const analytics = useAnalytics()

  const [showGoalSetForm, setShowGoalSetForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingGoalSet, setEditingGoalSet] = useState<GoalSet | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedGoalSetId, setSelectedGoalSetId] = useState<string>("")
  const [showSettings, setShowSettings] = useState(false)

  const transformedGoalSets = goalSets.map(gs => ({
    ...gs,
    id: gs._id,
    createdAt: new Date(gs._creationTime),
    updatedAt: new Date(gs._creationTime),
    targetCompletionDate: gs.targetCompletionDate ? new Date(gs.targetCompletionDate) : undefined,
  }))
  
  const transformedTasks = tasks.map(task => ({
    ...task,
    id: task._id,
    createdAt: new Date(task._creationTime),
    updatedAt: new Date(task._creationTime),
    scheduledDate: task.scheduledDate ? new Date(task.scheduledDate) : undefined,
    completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
    recurrence: task.recurrence ? {
      ...task.recurrence,
      endDate: task.recurrence.endDate ? new Date(task.recurrence.endDate) : undefined,
    } : undefined,
  }))

  const activeGoalSets = transformedGoalSets.filter((gs) => gs.isActive)
  const todaysTasks = getTodaysTasks()
  const completedTasks = transformedTasks.filter((t) => t.isCompleted)
  const totalTasks = transformedTasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0

  const handleCreateGoalSet = (goalSetData: Omit<GoalSet, "id" | "userId" | "createdAt" | "updatedAt">) => {
    createGoalSet(goalSetData)
    setShowGoalSetForm(false)
  }

  const handleEditGoalSet = (goalSetData: Omit<GoalSet, "id" | "userId" | "createdAt" | "updatedAt">) => {
    if (editingGoalSet) {
      updateGoalSet(editingGoalSet.id, goalSetData)
      setEditingGoalSet(null)
    }
  }

  const handleCreateTask = (taskData: Omit<Task, "id" | "userId" | "createdAt" | "updatedAt">) => {
    createTask(taskData)
    setShowTaskForm(false)
    setSelectedGoalSetId("")
  }

  const handleEditTask = (taskData: Omit<Task, "id" | "userId" | "createdAt" | "updatedAt">) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData)
      setEditingTask(null)
    }
  }

  const handleEditGoalSetClick = (goalSet: GoalSet) => {
    setEditingGoalSet(goalSet)
    setShowGoalSetForm(false)
    setShowTaskForm(false)
  }

  const handleEditTaskClick = (task: Task) => {
    setEditingTask(task)
    setShowGoalSetForm(false)
    setShowTaskForm(false)
  }

  const handleAddTaskToGoalSet = (goalSetId: string) => {
    setSelectedGoalSetId(goalSetId)
    setShowTaskForm(true)
    setShowGoalSetForm(false)
  }

  const handleCancelForms = () => {
    setShowGoalSetForm(false)
    setShowTaskForm(false)
    setEditingGoalSet(null)
    setEditingTask(null)
    setSelectedGoalSetId("")
  }

  const getGoalSetTaskStats = (goalSetId: string) => {
    const goalSetTasks = transformedTasks.filter((t) => t.goalSetId === goalSetId)
    const completedCount = goalSetTasks.filter((t) => t.isCompleted).length
    return { total: goalSetTasks.length, completed: completedCount }
  }


  return (
    <div className="px-16 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border  fixed top-0 left-0 right-0 z-10 bg-opacity-95  ease-in-out mt-5 mx-36 rounded-full shadow-md shadow-purple-200/20 hover:shadow-2xl hover:shadow-blue-300/30 transition-all duration-300 border-slate-700/50 bg-slate-950 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-lg border border-purple-500/30">
              <Target className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Goal Tracker Pro</h1>
              <p className="text-sm text-slate-400">Welcome back, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="border-slate-600 hover:bg-slate-700 text-slate-300"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="border-slate-600 hover:bg-slate-700 text-slate-300 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 ">
        <div className="mt-24 grid gap-6">
          {/* Quick Stats */}
          <div className="flex flex-col md:flex-row gap-12 items-center justify-center">
            <StatsCard
              title="Active Goals"
              value={activeGoalSets.length}
              description={activeGoalSets.length === 0 ? "No goals yet" : `${goalSets.length - activeGoalSets.length} paused`}
              icon={Target}
              gradientFrom="from-purple-500/5"
              gradientTo="to-purple-600/10"
              borderColor="border-purple-500/20"
              textColor="text-purple-50"
              iconColor="text-purple-400"
              descriptionColor="text-purple-200"
            />
            <StatsCard
              title="Tasks Today"
              value={todaysTasks.length}
              description={`${todaysTasks.filter((t) => t.isCompleted).length} completed`}
              icon={Calendar}
              gradientFrom="from-cyan-500/5"
              gradientTo="to-cyan-600/10"
              borderColor="border-cyan-500/20"
              textColor="text-cyan-50"
              iconColor="text-cyan-400"
              descriptionColor="text-cyan-200"
            />
            <StatsCard
              title="Completion Rate"
              value={`${completionRate}%`}
              description={`${completedTasks.length} of ${totalTasks} tasks`}
              icon={BarChart3}
              gradientFrom="from-emerald-500/5"
              gradientTo="to-emerald-600/10"
              borderColor="border-emerald-500/20"
              textColor="text-emerald-50"
              iconColor="text-emerald-400"
              descriptionColor="text-emerald-200"
            />
            <StatsCard
              title="Current Streak"
              value={analytics.streakDays}
              description={`${analytics.streakDays} day streak`}
              icon={Award}
              gradientFrom="from-amber-500/5"
              gradientTo="to-amber-600/10"
              borderColor="border-amber-500/20"
              textColor="text-amber-50"
              iconColor="text-amber-400"
              descriptionColor="text-amber-200"
            />
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabHeader
              tabs={[
                { value: "overview", label: "Overview" },
                { value: "analytics", label: "Analytics" },
                { value: "tasks", label: "Tasks" },
                { value: "goals", label: "Goal Sets" },
              ]}
              
              activeTab="overview"
              onTabChange={() => {}}
              actions={[
                {
                  label: "New Task",
                  onClick: () => setShowTaskForm(true),
                  variant: "outline",
                  icon: Plus,
                },
                {
                  label: "New Goal Set",
                  onClick: () => setShowGoalSetForm(true),
                  variant: "default",
                  icon: Plus,
                },
              ]}
            />

            <TabsContent value="overview" className="space-y-6">
              {/* Today's Tasks */}
              {todaysTasks.length > 0 && (
                <div className="space-y-4">
                  <SectionHeader title="Today's Tasks" />
                  <TaskList
                    tasks={todaysTasks.map(task => transformedTasks.find(t => t._id === task._id)!).filter(Boolean)}
                    goalSets={transformedGoalSets}
                    onEdit={handleEditTaskClick}
                    onDelete={deleteTask}
                    onComplete={completeTask}
                    onUncomplete={uncompleteTask}
                  />
                </div>
              )}

              {/* Recent Goal Sets */}
              {goalSets.length > 0 && (
                <div className="space-y-4">
                  <SectionHeader title="Your Goal Sets" />
                  <GoalSetGrid
                    goalSets={transformedGoalSets}
                    getGoalSetTaskStats={getGoalSetTaskStats}
                    onEdit={handleEditGoalSetClick}
                    onDelete={deleteGoalSet}
                    onToggleActive={toggleGoalSetActive}
                    onAddTask={handleAddTaskToGoalSet}
                    maxItems={6}
                  />
                </div>
              )}

              {/* Empty State */}
              {goalSets.length === 0 && (
                <EmptyState
                  icon={Target}
                  title="Ready to Start Your Journey?"
                  description="Create your first goal set to begin tracking your progress and achieving your dreams."
                  buttonText="Create Your First Goal Set"
                  onButtonClick={() => setShowGoalSetForm(true)}
                  buttonIcon={Plus}
                />
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <SectionHeader
                title="Analytics & Insights"
                description="Track your progress and productivity patterns"
              />
              <AnalyticsCharts analytics={analytics} />
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <TaskList
                tasks={transformedTasks}
                goalSets={transformedGoalSets}
                onEdit={handleEditTaskClick}
                onDelete={deleteTask}
                onComplete={completeTask}
                onUncomplete={uncompleteTask}
                emptyState={{
                  title: "No Tasks Yet",
                  description: "Create your first task to start tracking your progress.",
                  buttonText: "Create Your First Task",
                  onButtonClick: () => setShowTaskForm(true),
                }}
              />
            </TabsContent>

            <TabsContent value="goals" className="space-y-4">
              <GoalSetGrid
                goalSets={transformedGoalSets}
                getGoalSetTaskStats={getGoalSetTaskStats}
                onEdit={handleEditGoalSetClick}
                onDelete={deleteGoalSet}
                onToggleActive={toggleGoalSetActive}
                onAddTask={handleAddTaskToGoalSet}
                emptyState={{
                  title: "No Goal Sets Yet",
                  description: "Create your first goal set to organize your objectives.",
                  buttonText: "Create Your First Goal Set",
                  onButtonClick: () => setShowGoalSetForm(true),
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />

      {/* Goal Set Form Dialog */}
      <Dialog open={showGoalSetForm || !!editingGoalSet} onOpenChange={(open) => {
        if (!open) {
          handleCancelForms()
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingGoalSet ? "Edit Goal Set" : "Create New Goal Set"}
            </DialogTitle>
          </DialogHeader>
          <GoalSetForm
            onSubmit={editingGoalSet ? handleEditGoalSet : handleCreateGoalSet}
            onCancel={handleCancelForms}
            initialData={editingGoalSet || undefined}
            isEditing={!!editingGoalSet}
          />
        </DialogContent>
      </Dialog>

      {/* Task Form Dialog */}
      <Dialog open={showTaskForm || !!editingTask} onOpenChange={(open) => {
        if (!open) {
          handleCancelForms()
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "Edit Task" : "Create New Task"}
            </DialogTitle>
          </DialogHeader>
          <TaskForm
            onSubmit={editingTask ? handleEditTask : handleCreateTask}
            onCancel={handleCancelForms}
            goalSets={activeGoalSets}
            initialData={
              editingTask
                ? { ...editingTask, goalSetId: editingTask.goalSetId || selectedGoalSetId }
                : { goalSetId: selectedGoalSetId }
            }
            isEditing={!!editingTask}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
