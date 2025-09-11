"use client"

import { Button } from "@/components/ui/button"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LucideIcon } from "lucide-react"

interface TabHeaderProps {
  tabs: Array<{
    value: string
    label: string
  }>
  activeTab: string
  onTabChange: (value: string) => void
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: "default" | "outline"
    icon?: LucideIcon
  }>
}

export function TabHeader({ tabs, activeTab, onTabChange, actions }: TabHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <TabsList className="bg-slate-800/50 border border-slate-700/50">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {actions && actions.length > 0 && (
        <div className="flex gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant={action.variant || "outline"}
              className={
                action.variant === "default"
                  ? "gap-2 bg-gradient-to-r from-purple-600 to-cyan-900 hover:from-purple-700 hover:to-cyan-700 text-white border-0"
                  : "gap-2 border-slate-600 hover:bg-slate-700 text-slate-300"
              }
            >
              {action.icon && <action.icon className="h-4 w-4" />}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
