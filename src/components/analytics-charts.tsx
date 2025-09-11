"use client"


import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Target,  Zap, Calendar, } from "lucide-react"
import { Analytics } from "../lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"

interface AnalyticsChartsProps {
  analytics: Analytics
}

export function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  const {
    completionRate,
    streakDays,
    averageCompletionTime,
    weeklyProgress,
    goalSetProgress,
  } = analytics

  const chartColors = {
    primary: "#8B5CF6", 
    secondary: "#06B6D4", 
    accent: "#10B981", 
    warning: "#F59E0B",
    danger: "#EF4444", 
    muted: "#6B7280", 
  }


  const pieData = goalSetProgress
    .filter((gp) => gp.totalTasks > 0)
    .map((gp, index) => ({
      name: gp.name.length > 15 ? `${gp.name.substring(0, 15)}...` : gp.name,
      value: gp.totalTasks,
      completionRate: gp.completionRate,
      color: Object.values(chartColors)[index % Object.values(chartColors).length],
    }))

  const formattedWeeklyProgress = weeklyProgress.map((day) => ({
    ...day,
    completionRate: day.total > 0 ? Math.round((day.completed / day.total) * 100) : 0,
    dayName: new Date(day.date).toLocaleDateString("en-US", { weekday: "short" }),
  }))

  return (
    <div className="grid gap-6">
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress Chart */}
        <Card className="border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Calendar className="h-5 w-5 text-purple-400" />
              Weekly Progress
            </CardTitle>
            <CardDescription className="text-slate-400">Task completion over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {formattedWeeklyProgress.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={formattedWeeklyProgress} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="dayName" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F3F4F6",
                    }}
                    labelFormatter={(value) => `${value}`}
                    formatter={(value: any, name: string) => [
                      value,
                      name === "completed" ? "Completed" : name === "total" ? "Total" : "Rate",
                    ]}
                  />
                  <Bar dataKey="total" fill={chartColors.secondary} name="total" opacity={0.6} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="completed" fill={chartColors.primary} name="completed" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-400">
                No weekly data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goal Set Progress */}
        <Card className="border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Target className="h-5 w-5 text-emerald-400" />
              Goal Set Progress
            </CardTitle>
            <CardDescription className="text-slate-400">Completion rate by goal set</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goalSetProgress.length > 0 ? (
                goalSetProgress.map((gp, index) => (
                  <div key={gp.goalSetId} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-200">{gp.name}</span>
                      <span className="text-slate-400">
                        {gp.tasksCompleted}/{gp.totalTasks} ({gp.completionRate}%)
                      </span>
                    </div>
                    <Progress
                      value={gp.completionRate}
                      className="h-2 bg-slate-800"
                      style={{
                        background: `linear-gradient(to right, ${chartColors.accent} 0%, ${chartColors.accent} ${gp.completionRate}%, #1E293B ${gp.completionRate}%, #1E293B 100%)`,
                      }}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 py-8">No goal sets with tasks yet</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Task Distribution Pie Chart */}
        {pieData.length > 0 && (
          <Card className="border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
                Task Distribution
              </CardTitle>
              <CardDescription className="text-slate-400">Tasks by goal set</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F3F4F6",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Productivity Trend */}
        <Card className="border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Zap className="h-5 w-5 text-amber-400" />
              Productivity Insights
            </CardTitle>
            <CardDescription className="text-slate-400">Your productivity breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">Task Completion</span>
                <span className="text-sm text-slate-400">{completionRate}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">Consistency</span>
                <span className="text-sm text-slate-400">
                  {streakDays > 0 ? `${streakDays} day streak` : "No streak"}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((streakDays / 7) * 100, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">Efficiency</span>
                <span className="text-sm text-slate-400">
                  {averageCompletionTime > 0 ? `${averageCompletionTime}m avg` : "No data"}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${averageCompletionTime > 0 ? Math.max(100 - (averageCompletionTime / 60) * 100, 0) : 0}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
