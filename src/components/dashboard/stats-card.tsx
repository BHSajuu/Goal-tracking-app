"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  gradientFrom: string
  gradientTo: string
  borderColor: string
  textColor: string
  iconColor: string
  descriptionColor: string
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  gradientFrom,
  gradientTo,
  borderColor,
  textColor,
  iconColor,
  descriptionColor,
}: StatsCardProps) {
  return (
    <Card className={`w-[240px] h-[140px] rounded-full p-3 border ${borderColor} bg-gradient-to-br ${gradientFrom} ${gradientTo}`}>
      <CardHeader className="flex flex-row items-center justify-center gap-5 pt-2">
        <CardTitle className={`text-sm font-medium ${textColor}`}>{title}</CardTitle>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-center text-2xl font-bold ${textColor}`}>{value}</div>
        {description && (
          <p className={`text-center text-xs ${descriptionColor}`}>{value === 1 ? "day" : "days" } in a row</p>
        )}
      </CardContent>
    </Card>
  )
}
