"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { generateHealthInsightAction } from "@/lib/actions"

interface HealthCoachDailyProps {
  todayData: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  userProfile: any
  calorieGoal: number
  proteinGoal: number
  carbGoal: number
  fatGoal: number
}

export function HealthCoachDaily({
  todayData,
  userProfile,
  calorieGoal,
  proteinGoal,
  carbGoal,
  fatGoal,
}: HealthCoachDailyProps) {
  const [insight, setInsight] = useState("Personalisierte Erkenntnisse werden geladen...")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInsight = async () => {
      if (userProfile) {
        setLoading(true)
        try {
          // Extrahiere nur die benötigten Daten ohne Timestamp-Objekte
          const safeUserProfile = {
            age: userProfile.age,
            activity: userProfile.activity,
            goals: userProfile.goals || [],
            sex: userProfile.sex,
            weight: userProfile.weight,
            height: userProfile.height,
          }
          
          const aiInsight = await generateHealthInsightAction(todayData, [], safeUserProfile, false)
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
  }, [todayData, userProfile])

  const getTrendIcon = () => {
    const caloriePercentage = (todayData.calories / calorieGoal) * 100
    if (caloriePercentage > 110) return <TrendingUp className="h-4 w-4 text-orange-500" />
    if (caloriePercentage < 70) return <TrendingDown className="h-4 w-4 text-blue-500" />
    return <Minus className="h-4 w-4 text-green-500" />
  }

  return (
    <Card className="card-highlight glow-border">
      <CardHeader className="bg-gradient-to-r from-primary/20 to-transparent rounded-t-lg">
        <CardTitle className="flex items-center space-x-2 high-contrast-text">
          <Brain className="h-5 w-5 text-primary" />
          <span>KI Gesundheitscoach</span>
          {getTrendIcon()}
        </CardTitle>
        <CardDescription>Personalisierte tägliche Beratung durch KI</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-muted-foreground">Generiere personalisierte Erkenntnisse...</span>
          </div>
        ) : (
          <p className="text-foreground leading-relaxed high-contrast-text">{insight}</p>
        )}
      </CardContent>
    </Card>
  )
}
