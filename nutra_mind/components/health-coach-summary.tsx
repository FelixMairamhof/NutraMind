"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface HealthCoachSummaryProps {
  todayData: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  weekData: Array<{
    calories: number
    protein: number
    date: string
  }>
  weightData: Array<{
    weight: number
    date: string
  }>
  userProfile: any
}

export function HealthCoachSummary({ todayData, weekData, weightData, userProfile }: HealthCoachSummaryProps) {
  const generateInsight = () => {
    const insights = []

    // Calorie analysis - only if we have enough data
    if (weekData.length >= 3) {
      const avgCalories = weekData.reduce((sum, day) => sum + day.calories, 0) / weekData.length
      if (avgCalories > 0) {
        // Only analyze if there's actual data
        if (todayData.calories < avgCalories * 0.8) {
          insights.push("You're eating fewer calories than usual today. Consider a healthy snack!")
        } else if (todayData.calories > avgCalories * 1.2) {
          insights.push("Higher calorie intake today. Balance it with some activity!")
        }
      }
    }

    // Protein analysis - only if we have data
    if (weekData.length >= 2) {
      const avgProtein = weekData.reduce((sum, day) => sum + day.protein, 0) / weekData.length
      if (avgProtein > 0 && todayData.protein < avgProtein * 0.7) {
        insights.push("Protein intake is low today. Try adding lean meats, eggs, or legumes.")
      }
    }

    // Weight trend analysis - only if we have enough weight data
    if (weightData.length >= 3) {
      const recentWeights = weightData.slice(-3)
      const trend = recentWeights[recentWeights.length - 1].weight - recentWeights[0].weight

      if (Math.abs(trend) < 0.5) {
        insights.push("Weight is stable - great consistency!")
      } else if (trend > 1) {
        insights.push("Weight trending up. Consider reviewing your calorie intake.")
      } else if (trend < -1) {
        insights.push("Weight trending down. Make sure you're eating enough!")
      }
    }

    // Encourage data entry if no data
    if (weekData.length === 0 || weekData.every((day) => day.calories === 0)) {
      insights.push("Start logging your meals to get personalized insights!")
    }

    // Default positive message
    if (insights.length === 0) {
      insights.push("You're doing great! Keep up the healthy habits.")
    }

    return insights[0]
  }

  const getTrendIcon = () => {
    if (weightData.length >= 2) {
      const trend = weightData[weightData.length - 1].weight - weightData[weightData.length - 2].weight
      if (trend > 0.2) return <TrendingUp className="h-4 w-4 text-red-500" />
      if (trend < -0.2) return <TrendingDown className="h-4 w-4 text-green-500" />
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-primary" />
          <span>Health Coach Insight</span>
          {getTrendIcon()}
        </CardTitle>
        <CardDescription>AI-powered daily summary</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-foreground leading-relaxed">{generateInsight()}</p>
      </CardContent>
    </Card>
  )
}
