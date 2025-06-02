"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { generateHealthInsightAction } from "@/lib/actions"

interface HealthCoachWeeklyProps {
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

export function HealthCoachWeekly({ todayData, weekData, weightData, userProfile }: HealthCoachWeeklyProps) {
  const [insight, setInsight] = useState("Wöchentliche Analyse wird geladen...")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInsight = async () => {
      if (userProfile && weekData.length > 0) {
        setLoading(true)
        try {
          const aiInsight = await generateHealthInsightAction(todayData, weekData, userProfile, true)
          setInsight(aiInsight)
        } catch (error) {
          console.error("Error fetching insight:", error)
          setInsight(
            "Mach weiter mit deiner Ernährungsverfolgung! Konsistenz ist der Schlüssel, um deine Gesundheitsziele zu erreichen.",
          )
        }
        setLoading(false)
      }
    }

    fetchInsight()
  }, [todayData, weekData, userProfile])

  const getTrendIcon = () => {
    if (weightData.length >= 2) {
      const trend = weightData[weightData.length - 1].weight - weightData[weightData.length - 2].weight
      if (trend > 0.2) return <TrendingUp className="h-4 w-4 text-red-500" />
      if (trend < -0.2) return <TrendingDown className="h-4 w-4 text-green-500" />
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <Card className="card-highlight glow-border">
      <CardHeader className="bg-gradient-to-r from-primary/20 to-transparent rounded-t-lg">
        <CardTitle className="flex items-center space-x-2 high-contrast-text">
          <Brain className="h-5 w-5 text-primary" />
          <span>KI Wochenanalyse</span>
          {getTrendIcon()}
        </CardTitle>
        <CardDescription>KI-gestützte wöchentliche Erkenntnisse und Trends</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-muted-foreground">Analysiere wöchentliche Muster...</span>
          </div>
        ) : (
          <p className="text-foreground leading-relaxed high-contrast-text">{insight}</p>
        )}
      </CardContent>
    </Card>
  )
}
