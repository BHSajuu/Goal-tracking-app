"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, TrendingUp, Calendar, BarChart3 } from "lucide-react"

export function LoginForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const { login } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && email.trim()) {
      login(email, name)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">Goal Tracker Pro</h1>
            </div>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Transform your ambitions into achievements with intelligent goal tracking, advanced analytics, and
              personalized insights.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-card/50 rounded-lg border">
              <TrendingUp className="h-5 w-5 text-chart-1" />
              <div>
                <div className="font-medium">Smart Analytics</div>
                <div className="text-sm text-muted-foreground">Track progress</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card/50 rounded-lg border">
              <Calendar className="h-5 w-5 text-chart-2" />
              <div>
                <div className="font-medium">Auto Scheduling</div>
                <div className="text-sm text-muted-foreground">AI-powered</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card/50 rounded-lg border">
              <BarChart3 className="h-5 w-5 text-chart-3" />
              <div>
                <div className="font-medium">Visual Reports</div>
                <div className="text-sm text-muted-foreground">Rich insights</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card/50 rounded-lg border">
              <Target className="h-5 w-5 text-chart-4" />
              <div>
                <div className="font-medium">Goal Sets</div>
                <div className="text-sm text-muted-foreground">Organized</div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Enter your details to begin tracking your goals</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Start Tracking Goals
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
