"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useTasks } from "@/hooks/use-tasks"
import { useGoalSets } from "@/hooks/use-goal-sets"
import { DataExporter, DataImporter } from "@/lib/export-import"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Download, Trash2, User, Palette, Database } from "lucide-react"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { user, updateUser, logout } = useAuth()
  const { tasks } = useTasks()
  const { goalSets } = useGoalSets()
  
  // Transform Convex data to match expected types
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
  
  const transformedGoalSets = goalSets.map(gs => ({
    ...gs,
    id: gs._id,
    createdAt: new Date(gs._creationTime),
    updatedAt: new Date(gs._creationTime),
    targetCompletionDate: gs.targetCompletionDate ? new Date(gs.targetCompletionDate) : undefined,
  }))
  const { toast } = useToast()
  const [isImporting, setIsImporting] = useState(false)

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    compactMode: user?.preferences.compactMode || false,
    defaultView: user?.preferences.defaultView || "dashboard",
  })

  const handleSaveSettings = () => {
    if (!user) return

    updateUser({
      name: formData.name,
      email: formData.email,
      preferences: {
        ...user.preferences,
        compactMode: formData.compactMode,
        defaultView: formData.defaultView as "dashboard" | "analytics",
      },
    })

    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    })
  }

  const handleExportJSON = async () => {
    if (!user) return

    const exportData = await DataExporter.exportData(user)
    DataExporter.downloadJSON(exportData)

    toast({
      title: "Data exported",
      description: "Your data has been exported as JSON file.",
    })
  }

  const handleExportCSV = () => {
    if (!user) return

    DataExporter.downloadCSV(transformedTasks, transformedGoalSets)

    toast({
      title: "Tasks exported",
      description: "Your tasks have been exported as CSV file.",
    })
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setIsImporting(true)

    try {
      const result = await DataImporter.importFromJSON(file, user.id)

      if (result.success) {
        toast({
          title: "Import successful",
          description: `Imported ${result.imported?.goalSets} goal sets, ${result.imported?.tasks} tasks, and ${result.imported?.completions} completions.`,
        })
        // Refresh the page to show imported data
        window.location.reload()
      } else {
        toast({
          title: "Import failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: "An error occurred while importing the file.",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
      event.target.value = "" // Reset file input
    }
  }

  const handleClearAllData = () => {
    if (!confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      return
    }

    localStorage.clear()
    toast({
      title: "Data cleared",
      description: "All data has been cleared. You will be logged out.",
    })

    setTimeout(() => {
      logout()
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Manage your account settings, preferences, and data.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Preferences
              </CardTitle>
              <CardDescription>Customize your app experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">Show more content in less space</p>
                </div>
                <Switch
                  checked={formData.compactMode}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, compactMode: checked }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Default View</Label>
                <div className="flex gap-2">
                  <Button
                    variant={formData.defaultView === "dashboard" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData((prev) => ({ ...prev, defaultView: "dashboard" }))}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant={formData.defaultView === "analytics" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData((prev) => ({ ...prev, defaultView: "analytics" }))}
                  >
                    Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>Export, import, or manage your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Export Data</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportJSON} className="flex-1 bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      JSON
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex-1 bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Import Data</Label>
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      disabled={isImporting}
                      className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-muted file:text-muted-foreground"
                    />
                    {isImporting && (
                      <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                        <div className="text-sm">Importing...</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-destructive">Danger Zone</Label>
                <Button variant="destructive" size="sm" onClick={handleClearAllData} className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
                <p className="text-xs text-muted-foreground">
                  This will permanently delete all your goal sets, tasks, and progress data.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Your Data</CardTitle>
              <CardDescription>Overview of your stored information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{transformedGoalSets.length}</div>
                  <div className="text-sm text-muted-foreground">Goal Sets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{transformedTasks.length}</div>
                  <div className="text-sm text-muted-foreground">Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{transformedTasks.filter((t) => t.isCompleted).length}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {user ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Days Active</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
