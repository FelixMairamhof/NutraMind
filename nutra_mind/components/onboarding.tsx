"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, ChevronLeft, Leaf } from "lucide-react"

interface OnboardingProps {
  onComplete: () => void
}

const goalOptions = [
  { id: "muscle", label: "Muskelaufbau", description: "Magere Muskelmasse aufbauen" },
  { id: "diet", label: "Gewichtsverlust", description: "Gewicht und Körperfett reduzieren" },
  { id: "longevity", label: "Langlebigkeit", description: "Für langfristige Gesundheit optimieren" },
  { id: "acne", label: "Akne-Kontrolle", description: "Hautgesundheit verbessern" },
  { id: "energy", label: "Energie-Boost", description: "Tägliches Energieniveau steigern" },
  { id: "performance", label: "Sportliche Leistung", description: "Trainingsleistung verbessern" },
]

export function Onboarding({ onComplete }: OnboardingProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Form data
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [age, setAge] = useState("")
  const [sex, setSex] = useState("")
  const [activity, setActivity] = useState("")
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])

  const totalSteps = 3

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals((prev) => {
      if (prev.includes(goalId)) {
        return prev.filter((id) => id !== goalId)
      } else {
        return [...prev, goalId]
      }
    })
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    if (!user) return

    setLoading(true)
    try {
      await updateDoc(doc(db, "users", user.uid), {
        height: height ? Number.parseInt(height) : null,
        weight: weight ? Number.parseInt(weight) : null,
        age: age ? Number.parseInt(age) : null,
        sex,
        activity,
        goals: selectedGoals.length > 0 ? selectedGoals : ["longevity"],
        onboardingCompleted: true,
        subscriptionStatus: "active", // Set as active for now
        updatedAt: new Date(),
      })

      onComplete()
    } catch (error) {
      console.error("Error completing onboarding:", error)
    }
    setLoading(false)
  }

  const canProceedStep1 = height && weight && age && sex
  const canProceedStep2 = activity
  const canProceedStep3 = selectedGoals.length > 0

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md card-gradient glow-border">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Leaf className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-2xl font-bold high-contrast-text">GreenTrack</h1>
          </div>
          <CardTitle className="high-contrast-text">Willkommen bei GreenTrack!</CardTitle>
          <CardDescription>Lass uns dein Profil einrichten für personalisierte Empfehlungen</CardDescription>
          <Progress value={(currentStep / totalSteps) * 100} className="mt-4" />
          <p className="text-sm text-muted-foreground mt-2">
            Schritt {currentStep} von {totalSteps}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold high-contrast-text">Grundlegende Informationen</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height" className="high-contrast-text">
                    Größe (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="glow-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="high-contrast-text">
                    Gewicht (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="glow-border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="high-contrast-text">
                    Alter
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="glow-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="high-contrast-text">Geschlecht</Label>
                  <Select value={sex} onValueChange={setSex}>
                    <SelectTrigger className="glow-border">
                      <SelectValue placeholder="Wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Männlich</SelectItem>
                      <SelectItem value="female">Weiblich</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Activity Level */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold high-contrast-text">Aktivitätsniveau</h3>
              <p className="text-sm text-muted-foreground">Wie aktiv bist du normalerweise?</p>

              <Select value={activity} onValueChange={setActivity}>
                <SelectTrigger className="glow-border">
                  <SelectValue placeholder="Wähle dein Aktivitätsniveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">
                    <div>
                      <div className="font-medium">Sitzend</div>
                      <div className="text-xs text-muted-foreground">Wenig/keine Bewegung</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="light">
                    <div>
                      <div className="font-medium">Leichte Aktivität</div>
                      <div className="text-xs text-muted-foreground">1-3x pro Woche Sport</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="moderate">
                    <div>
                      <div className="font-medium">Moderate Aktivität</div>
                      <div className="text-xs text-muted-foreground">3-5x pro Woche Sport</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="active">
                    <div>
                      <div className="font-medium">Sehr Aktiv</div>
                      <div className="text-xs text-muted-foreground">6-7x pro Woche Sport</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="extreme">
                    <div>
                      <div className="font-medium">Extrem Aktiv</div>
                      <div className="text-xs text-muted-foreground">2x täglich Training</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Step 3: Goals */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold high-contrast-text">Deine Gesundheitsziele</h3>
              <p className="text-sm text-muted-foreground">
                Wähle ein oder mehrere Ziele aus (du kannst diese später ändern)
              </p>

              <div className="space-y-3">
                {goalOptions.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border border-white/10 hover:bg-white/5"
                  >
                    <Checkbox
                      id={goal.id}
                      checked={selectedGoals.includes(goal.id)}
                      onCheckedChange={() => handleGoalToggle(goal.id)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={goal.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer high-contrast-text"
                      >
                        {goal.label}
                      </label>
                      <p className="text-xs text-muted-foreground">{goal.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Zurück
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !canProceedStep1) ||
                  (currentStep === 2 && !canProceedStep2) ||
                  (currentStep === 3 && !canProceedStep3)
                }
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80"
              >
                Weiter
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading || !canProceedStep3}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                {loading ? "Wird abgeschlossen..." : "Profil erstellen"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
