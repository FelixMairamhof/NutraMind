"use client"

import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  max: number
  label: string
  unit?: string
  className?: string
  color?: "primary" | "blue" | "green" | "orange"
}

export function ProgressBar({ value, max, label, unit = "", className, color = "primary" }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  const colorClasses = {
    primary: "progress-bar-primary",
    blue: "progress-bar-blue",
    green: "progress-bar-green",
    orange: "progress-bar-orange",
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground high-contrast-text">{label}</span>
        <span className="text-sm text-foreground/90 high-contrast-text">
          {value}
          {unit} / {max}
          {unit}
        </span>
      </div>
      <div className="w-full progress-bar-bg h-2.5">
        <div
          className={cn("h-2.5 transition-all duration-300", colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
