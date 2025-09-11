"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  buttonText: string
  onButtonClick: () => void
  buttonIcon?: LucideIcon
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  buttonText,
  onButtonClick,
  buttonIcon: ButtonIcon,
}: EmptyStateProps) {
  return (
    <Card className="text-center py-12">
      <CardHeader>
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="max-w-md mx-auto">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button size="lg" className="gap-2" onClick={onButtonClick}>
          {ButtonIcon && <ButtonIcon className="h-4 w-4" />}
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  )
}
