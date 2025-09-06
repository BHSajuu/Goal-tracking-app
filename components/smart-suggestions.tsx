"use client"

import { useSmartSuggestions } from "@/hooks/use-smart-suggestions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Target, TrendingUp, Zap, Clock, Sparkles, Brain, Rocket } from "lucide-react"

export function SmartSuggestions() {
  const { suggestions, autoScheduleSuggestion } = useSmartSuggestions()

  if (suggestions.length === 0 && !autoScheduleSuggestion) {
    return null
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "schedule":
        return <Calendar className="h-4 w-4 text-purple-400" />
      case "priority":
        return <Zap className="h-4 w-4 text-amber-400" />
      case "goal":
        return <Target className="h-4 w-4 text-emerald-400" />
      case "productivity":
        return <TrendingUp className="h-4 w-4 text-cyan-400" />
      case "optimization":
        return <Brain className="h-4 w-4 text-blue-400" />
      case "motivation":
        return <Rocket className="h-4 w-4 text-pink-400" />
      default:
        return <Sparkles className="h-4 w-4 text-indigo-400" />
    }
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive" as const
      case "medium":
        return "default" as const
      case "low":
        return "secondary" as const
      default:
        return "default" as const
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-500/30 bg-red-500/5"
      case "medium":
        return "border-amber-500/30 bg-amber-500/5"
      case "low":
        return "border-emerald-500/30 bg-emerald-500/5"
      default:
        return "border-slate-500/30 bg-slate-500/5"
    }
  }

  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-indigo-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-100">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Sparkles className="h-5 w-5 text-purple-400" />
          </div>
          AI Smart Suggestions
        </CardTitle>
        <CardDescription className="text-purple-200/80">
          Intelligent recommendations powered by your productivity patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto-schedule suggestion */}
        {autoScheduleSuggestion && (
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-medium text-purple-100 flex items-center gap-2">
                    🤖 Smart Auto-Schedule
                    <Badge variant="secondary" className="bg-purple-600/50 text-purple-100 text-xs">
                      AI Powered
                    </Badge>
                  </h4>
                  <p className="text-sm text-purple-200/80">
                    Intelligently schedule {autoScheduleSuggestion.taskCount} tasks based on your productivity patterns
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={autoScheduleSuggestion.action}
                className="bg-purple-600 hover:bg-purple-700 text-white border-purple-500/50"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Schedule Now
              </Button>
            </div>
          </div>
        )}

        {/* Regular suggestions */}
        <div className="space-y-3">
          {suggestions.slice(0, 4).map((suggestion) => (
            <div
              key={suggestion.id}
              className={`flex items-start gap-3 p-4 border rounded-lg backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] ${getPriorityColor(suggestion.priority)}`}
            >
              <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                {getIcon(suggestion.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-sm text-slate-100 flex items-center gap-2">
                    {suggestion.icon && <span className="text-base">{suggestion.icon}</span>}
                    {suggestion.title}
                  </h4>
                  <Badge
                    variant={getPriorityVariant(suggestion.priority)}
                    className={`text-xs ${
                      suggestion.priority === "high"
                        ? "bg-red-600/80 text-red-100"
                        : suggestion.priority === "medium"
                          ? "bg-amber-600/80 text-amber-100"
                          : "bg-emerald-600/80 text-emerald-100"
                    }`}
                  >
                    {suggestion.priority}
                  </Badge>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{suggestion.description}</p>
              </div>
              {suggestion.action && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={suggestion.action}
                  className="border-slate-600 hover:bg-slate-700 text-slate-200 hover:text-white bg-transparent"
                >
                  Take Action
                </Button>
              )}
            </div>
          ))}
        </div>

        {suggestions.length > 4 && (
          <div className="text-center pt-2">
            <Button variant="ghost" size="sm" className="text-purple-300 hover:text-purple-100 hover:bg-purple-500/20">
              <Brain className="h-4 w-4 mr-2" />
              View {suggestions.length - 4} more AI insights
            </Button>
          </div>
        )}

        {/* AI Attribution */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-purple-500/20">
          <Sparkles className="h-3 w-3 text-purple-400" />
          <span className="text-xs text-purple-300/80">Powered by intelligent productivity analysis</span>
          <Sparkles className="h-3 w-3 text-purple-400" />
        </div>
      </CardContent>
    </Card>
  )
}
