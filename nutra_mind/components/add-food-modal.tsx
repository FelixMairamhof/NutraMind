"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { collection, addDoc, doc, getDoc } from "firebase/firestore"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { analyzeFoodAction } from "@/lib/actions"

interface AddFoodModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddFoodModal({ open, onOpenChange, onSuccess }: AddFoodModalProps) {
  const { user } = useAuth()
  const [food, setFood] = useState("")
  const [description, setDescription] = useState("")
  const [calories, setCalories] = useState("")
  const [protein, setProtein] = useState("")
  const [carbs, setCarbs] = useState("")
  const [fat, setFat] = useState("")
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  const analyzeUserInput = async () => {
    if (!food) return

    setAnalyzing(true)
    try {
      // Get user profile for goals
      let userGoals: string[] = []
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          userGoals = userDoc.data().goals || []
        }
      }

      const nutritionData = await analyzeFoodAction(food, userGoals)
      if (nutritionData) {
        setCalories(nutritionData.calories.toString())
        setProtein(nutritionData.protein.toString())
        setCarbs(nutritionData.carbs.toString())
        setFat(nutritionData.fat.toString())
        setDescription(nutritionData.description)
      }
    } catch (error) {
      console.error("Error analyzing food:", error)
    }
    setAnalyzing(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !food) return

    setLoading(true)
    try {
      await addDoc(collection(db, "entries"), {
        uid: user.uid,
        food: food,
        description: description,
        calories: Number.parseInt(calories) || 0,
        protein: Number.parseInt(protein) || 0,
        carbs: Number.parseInt(carbs) || 0,
        fat: Number.parseInt(fat) || 0,
        timestamp: new Date(),
        date: new Date().toISOString().split("T")[0],
      })

      // Reset form
      setFood("")
      setDescription("")
      setCalories("")
      setProtein("")
      setCarbs("")
      setFat("")

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error adding food:", error)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Food Entry</DialogTitle>
          <DialogDescription>Log your food and get AI-powered nutrition analysis</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="food">Food Name</Label>
            <div className="flex gap-2">
              <Input
                id="food"
                placeholder="e.g., grilled chicken breast with rice"
                value={food}
                onChange={(e) => setFood(e.target.value)}
                required
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={analyzeUserInput}
                disabled={!food || analyzing}
                className="self-start"
              >
                {analyzing ? "Analyzing..." : "AI Analyze"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Health Description</Label>
            <Textarea
              id="description"
              placeholder="AI will generate a personalized health description based on your goals..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                placeholder="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                placeholder="0"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                placeholder="0"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat">Fat (g)</Label>
              <Input id="fat" type="number" placeholder="0" value={fat} onChange={(e) => setFat(e.target.value)} />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !food} className="flex-1">
              {loading ? "Adding..." : "Add Food"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
