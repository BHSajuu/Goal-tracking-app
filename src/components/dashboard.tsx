"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useGoalSets } from "@/hooks/use-goal-sets"
import { useTasks } from "@/hooks/use-tasks"
import { useAnalytics } from "@/hooks/use-analytics"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GoalSetForm } from "@/components/goal-set-form"
import { GoalSetCard } from "@/components/goal-set-card"
import { TaskForm } from "@/components/task-form"
import { TaskCard } from "@/components/task-card"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { SmartSuggestions } from "@/components/smart-suggestions"
import { SettingsDialog } from "@/components/settings-dialog"
import { LogOut, Plus, Target, Calendar, BarChart3, Settings, TrendingUp } from "lucide-react"
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

  const activeGoalSets = goalSets.filter((gs) => gs.isActive)
  const todaysTasks = getTodaysTasks()
  const completedTasks = tasks.filter((t) => t.isCompleted)
  const totalTasks = tasks.length
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
    const goalSetTasks = getTasksByGoalSet(goalSetId)
    const completedCount = goalSetTasks.filter((t) => t.isCompleted).length
    return { total: goalSetTasks.length, completed: completedCount }
  }

  if (showGoalSetForm || editingGoalSet) {
    return (
      <div className="min-h-screen bg-background p-4">
        <GoalSetForm
          onSubmit={editingGoalSet ? handleEditGoalSet : handleCreateGoalSet}
          onCancel={handleCancelForms}
          initialData={editingGoalSet || undefined}
          isEditing={!!editingGoalSet}
        />
      </div>
    )
  }

  if (showTaskForm || editingTask) {
    return (
      <div className="min-h-screen bg-background p-4">
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
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80">
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
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-purple-600/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-100">Active Goals</CardTitle>
                <Target className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-50">{activeGoalSets.length}</div>
                <p className="text-xs text-purple-200">
                  {activeGoalSets.length === 0 ? "No goals yet" : `${goalSets.length - activeGoalSets.length} paused`}
                </p>
              </CardContent>
            </Card>
            <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-cyan-600/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-cyan-100">Tasks Today</CardTitle>
                <Calendar className="h-4 w-4 text-cyan-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-50">{todaysTasks.length}</div>
                <p className="text-xs text-cyan-200">{todaysTasks.filter((t) => t.isCompleted).length} completed</p>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-100">Completion Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-50">{completionRate}%</div>
                <p className="text-xs text-emerald-200">
                  {completedTasks.length} of {totalTasks} tasks
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-amber-600/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-100">Productivity Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-amber-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-50">{analytics.productivityScore}</div>
                <p className="text-xs text-amber-200">{analytics.streakDays} day streak</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="bg-slate-800/50 border border-slate-700/50">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="tasks" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="goals" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  Goal Sets
                </TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowTaskForm(true)}
                  variant="outline"
                  className="gap-2 border-slate-600 hover:bg-slate-700 text-slate-300"
                >
                  <Plus className="h-4 w-4" />
                  New Task
                </Button>
                <Button
                  onClick={() => setShowGoalSetForm(true)}
                  className="gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0"
                >
                  <Plus className="h-4 w-4" />
                  New Goal Set
                </Button>
              </div>
            </div>

            <TabsContent value="overview" className="space-y-6">
              <SmartSuggestions />

              {/* Today's Tasks */}
              {todaysTasks.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Today's Tasks</h3>
                  <div className="grid gap-3">
                    {todaysTasks.map((task) => {
                      const goalSet = goalSets.find((gs) => gs.id === task.goalSetId)
                      return (
                        <TaskCard
                          key={task.id}
                          task={task}
                          goalSet={goalSet}
                          onEdit={handleEditTaskClick}
                          onDelete={deleteTask}
                          onComplete={completeTask}
                          onUncomplete={uncompleteTask}
                        />
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Recent Goal Sets */}
              {goalSets.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Your Goal Sets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {goalSets.slice(0, 6).map((goalSet) => {
                      const stats = getGoalSetTaskStats(goalSet.id)
                      return (
                        <GoalSetCard
                          key={goalSet.id}
                          goalSet={goalSet}
                          taskCount={stats.total}
                          completedTaskCount={stats.completed}
                          onEdit={handleEditGoalSetClick}
                          onDelete={deleteGoalSet}
                          onToggleActive={toggleGoalSetActive}
                          onAddTask={handleAddTaskToGoalSet}
                        />
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {goalSets.length === 0 && (
                <Card className="text-center py-12">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Ready to Start Your Journey?</CardTitle>
                    <CardDescription className="max-w-md mx-auto">
                      Create your first goal set to begin tracking your progress and achieving your dreams.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="lg" className="gap-2" onClick={() => setShowGoalSetForm(true)}>
                      <Plus className="h-4 w-4" />
                      Create Your First Goal Set
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Analytics & Insights</h3>
                  <p className="text-sm text-muted-foreground">Track your progress and productivity patterns</p>
                </div>
              </div>
              <AnalyticsCharts analytics={analytics} />
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              {tasks.length > 0 ? (
                <div className="grid gap-3">
                  {tasks.map((task) => {
                    const goalSet = goalSets.find((gs) => gs.id === task.goalSetId)
                    return (
                      <TaskCard
                        key={task.id}
                        task={task}
                        goalSet={goalSet}
                        onEdit={handleEditTaskClick}
                        onDelete={deleteTask}
                        onComplete={completeTask}
                        onUncomplete={uncompleteTask}
                      />
                    )
                  })}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardHeader>
                    <CardTitle>No Tasks Yet</CardTitle>
                    <CardDescription>Create your first task to start tracking your progress.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="lg" className="gap-2" onClick={() => setShowTaskForm(true)}>
                      <Plus className="h-4 w-4" />
                      Create Your First Task
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="goals" className="space-y-4">
              {goalSets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {goalSets.map((goalSet) => {
                    const stats = getGoalSetTaskStats(goalSet.id)
                    return (
                      <GoalSetCard
                        key={goalSet.id}
                        goalSet={goalSet}
                        taskCount={stats.total}
                        completedTaskCount={stats.completed}
                        onEdit={handleEditGoalSetClick}
                        onDelete={deleteGoalSet}
                        onToggleActive={toggleGoalSetActive}
                        onAddTask={handleAddTaskToGoalSet}
                      />
                    )
                  })}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardHeader>
                    <CardTitle>No Goal Sets Yet</CardTitle>
                    <CardDescription>Create your first goal set to organize your objectives.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="lg" className="gap-2" onClick={() => setShowGoalSetForm(true)}>
                      <Plus className="h-4 w-4" />
                      Create Your First Goal Set
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </div>
  )
}
