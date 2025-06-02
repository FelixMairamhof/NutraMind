"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MealItem } from "@/components/meal-item"

interface MealEntry {
  id: string
  food: string
  description?: string
  calories: number
  protein: number
  carbs: number
  fat: number
  timestamp: Date
}

interface MealsListProps {
  onMealDeleted: () => void
}

export function MealsList({ onMealDeleted }: MealsListProps) {
  const { user } = useAuth()
  const [meals, setMeals] = useState<MealEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchTodaysMeals()
    }
  }, [user])

  const fetchTodaysMeals = async () => {
    if (!user) return

    setLoading(true)
    const today = new Date().toISOString().split("T")[0]
    const entriesRef = collection(db, "entries")
    const q = query(entriesRef, where("uid", "==", user.uid), where("date", "==", today))

    try {
      const snapshot = await getDocs(q)
      const mealsData: MealEntry[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        mealsData.push({
          id: doc.id,
          food: data.food,
          description: data.description || "",
          calories: data.calories || 0,
          protein: data.protein || 0,
          carbs: data.carbs || 0,
          fat: data.fat || 0,
          timestamp: data.timestamp.toDate(),
        })
      })

      // Sort by timestamp (newest first)
      mealsData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      setMeals(mealsData)
    } catch (error) {
      console.error("Error fetching meals:", error)
    }
    setLoading(false)
  }

  const handleMealDeleted = () => {
    fetchTodaysMeals()
    onMealDeleted()
  }

  if (loading) {
    return (
      <Card className="card-gradient glow-border">
        <CardHeader>
          <CardTitle className="high-contrast-text">Heutige Mahlzeiten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-gradient glow-border">
      <CardHeader>
        <CardTitle className="high-contrast-text">Heutige Mahlzeiten</CardTitle>
        <CardDescription>
          {meals.length} Mahlzeit{meals.length !== 1 ? "en" : ""} heute protokolliert
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {meals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Keine Mahlzeiten für heute protokolliert</p>
            <p className="text-sm">Tippe auf den + Button, um deine erste Mahlzeit hinzuzufügen</p>
          </div>
        ) : (
          meals.map((meal) => (
            <MealItem
              key={meal.id}
              id={meal.id}
              food={meal.food}
              description={meal.description}
              calories={meal.calories}
              protein={meal.protein}
              carbs={meal.carbs}
              fat={meal.fat}
              timestamp={meal.timestamp}
              onDelete={handleMealDeleted}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}
