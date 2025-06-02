"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface ProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userProfile: any
  onSuccess: () => void
}

const goalOptions = [
  { id: "muscle", label: "Muskelaufbau", description: "Magere Muskelmasse aufbauen" },
  { id: "diet", label: "Gewichtsverlust", description: "Gewicht und Körperfett reduzieren" },
  { id: "longevity", label: "Langlebigkeit", description: "Für langfristige Gesundheit optimieren" },
  { id: "acne", label: "Akne-Kontrolle", description: "Hautgesundheit verbessern" },
  { id: "energy", label: "Energie-Boost", description: "Tägliches Energieniveau steigern" },
  { id: "performance", label: "Sportliche Leistung", description: "Trainingsleistung verbessern" },
]

export function ProfileModal({ open, onOpenChange, userProfile, onSuccess }: ProfileModalProps) {
  const { user } = useAuth()
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [age, setAge] = useState("")
  const [sex, setSex] = useState("")
  const [activity, setActivity] = useState("moderate")
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userProfile) {
      setHeight(userProfile.height || "")
      setWeight(userProfile.weight || "")
      setAge(userProfile.age || "")
      setSex(userProfile.sex || "")
      setActivity(userProfile.activity || "moderate")
      setSelectedGoals(userProfile.goals || ["longevity"])
    }
  }, [userProfile])

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals((prev) => {
      if (prev.includes(goalId)) {
        return prev.filter((id) => id !== goalId)
      } else {
        return [...prev, goalId]
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
        updatedAt: new Date(),
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto card-gradient glow-border">
        <DialogHeader>
          <DialogTitle className="text-xl high-contrast-text">Profil Einstellungen</DialogTitle>
          <DialogDescription>Aktualisiere dein Profil für personalisierte Empfehlungen</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="space-y-2">
            <Label className="high-contrast-text">Aktivitätsniveau</Label>
            <Select value={activity} onValueChange={setActivity}>
              <SelectTrigger className="glow-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sitzend (wenig/keine Bewegung)</SelectItem>
                <SelectItem value="light">Leichte Aktivität (1-3x/Woche)</SelectItem>
                <SelectItem value="moderate">Moderate Aktivität (3-5x/Woche)</SelectItem>
                <SelectItem value="active">Sehr Aktiv (6-7x/Woche)</SelectItem>
                <SelectItem value="extreme">Extrem Aktiv (2x täglich)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold high-contrast-text">Gesundheitsziele (Mehrfachauswahl)</Label>
            <div className="space-y-3">
              {goalOptions.map((goal) => (
                <div key={goal.id} className="flex items-start space-x-3">
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

          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-primary to-primary/80">
              {loading ? "Speichern..." : "Profil Speichern"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
