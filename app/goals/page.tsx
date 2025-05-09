"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { useNutraMind } from "@/context/nutramind-context"
import { useRouter } from "next/navigation"
import { Check, Target } from "lucide-react"

const AVAILABLE_GOALS = [
  {
    id: "muscle-building",
    name: "Muskelaufbau",
    description: "Optimiere deine Ernährung für Muskelwachstum und Regeneration",
    icon: "💪",
  },
  {
    id: "skin-health",
    name: "Hautgesundheit",
    description: "Verbessere deine Haut durch optimale Nährstoffversorgung",
    icon: "✨",
  },
  {
    id: "longevity",
    name: "Langlebigkeit",
    description: "Ernährung für ein langes und gesundes Leben",
    icon: "🧬",
  },
  {
    id: "energy",
    name: "Mehr Energie",
    description: "Steigere deine Energie und Konzentration durch optimale Ernährung",
    icon: "⚡",
  },
  {
    id: "gut-health",
    name: "Darmgesundheit",
    description: "Verbessere deine Verdauung und Darmflora",
    icon: "🌱",
  },
  {
    id: "weight-management",
    name: "Gewichtsmanagement",
    description: "Unterstütze dein Gewichtsziel durch ausgewogene Ernährung",
    icon: "⚖️",
  },
]

export default function GoalsPage() {
  const { toast } = useToast()
  const { goals, setGoals } = useNutraMind()
  const router = useRouter()
  const [selectedGoals, setSelectedGoals] = useState<string[]>(goals.map((goal) => goal.id))
  const [priorities, setPriorities] = useState<Record<string, number>>(
    Object.fromEntries(goals.map((goal) => [goal.id, goal.priority || 50])),
  )

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((current) =>
      current.includes(goalId) ? current.filter((id) => id !== goalId) : [...current, goalId],
    )
  }

  const handlePriorityChange = (goalId: string, value: number[]) => {
    setPriorities((current) => ({
      ...current,
      [goalId]: value[0],
    }))
  }

  const saveGoals = () => {
    if (selectedGoals.length === 0) {
      toast({
        title: "Keine Ziele ausgewählt",
        description: "Bitte wähle mindestens ein Ziel aus.",
        variant: "destructive",
      })
      return
    }

    const newGoals = selectedGoals.map((goalId) => {
      const goalInfo = AVAILABLE_GOALS.find((g) => g.id === goalId)
      const priority = priorities[goalId] || 50

      return {
        id: goalId,
        name: goalInfo?.name || "",
        priority: priority,
        progress: Math.floor(Math.random() * 60) + 20, // Simulate progress
        analysis:
          "Basierend auf deiner Ernährung machst du gute Fortschritte bei diesem Ziel. Erhöhe den Konsum von Omega-3-Fettsäuren für bessere Ergebnisse.",
      }
    })

    setGoals(newGoals)

    toast({
      title: "Ziele gespeichert",
      description: "Deine Ernährungsziele wurden aktualisiert.",
    })

    router.push("/dashboard")
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center mb-6">
        <Target className="h-6 w-6 text-emerald-600 mr-2" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Deine Ernährungsziele</h1>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Wähle die Ziele aus, die du mit deiner Ernährung erreichen möchtest. NutraMind wird dir personalisierte
        Empfehlungen geben.
      </p>

      <div className="space-y-4 mb-8">
        {AVAILABLE_GOALS.map((goal) => (
          <Card
            key={goal.id}
            className={selectedGoals.includes(goal.id) ? "border-emerald-300 dark:border-emerald-700 shadow-sm" : ""}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start">
                <Checkbox
                  id={goal.id}
                  checked={selectedGoals.includes(goal.id)}
                  onCheckedChange={() => toggleGoal(goal.id)}
                  className="mr-3 mt-1"
                />
                <div>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">{goal.icon}</span> {goal.name}
                  </CardTitle>
                  <CardDescription>{goal.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            {selectedGoals.includes(goal.id) && (
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Priorität</span>
                    <span className="font-medium">
                      {priorities[goal.id] <= 33 ? "Niedrig" : priorities[goal.id] <= 66 ? "Mittel" : "Hoch"}
                    </span>
                  </div>
                  <Slider
                    value={[priorities[goal.id] || 50]}
                    min={1}
                    max={100}
                    step={1}
                    onValueChange={(value) => handlePriorityChange(goal.id, value)}
                    className="py-2"
                  />
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Abbrechen
        </Button>
        <Button onClick={saveGoals} className="bg-emerald-600 hover:bg-emerald-700">
          <Check className="mr-2 h-4 w-4" /> Ziele speichern
        </Button>
      </div>
    </main>
  )
}
