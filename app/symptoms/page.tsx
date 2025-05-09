"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useNutraMind } from "@/context/nutramind-context"
import { Activity, AlertCircle, Check, Brain } from "lucide-react"

const SYMPTOM_CATEGORIES = [
  {
    id: "energy",
    name: "Energie & Konzentration",
    options: ["Sehr niedrig", "Niedrig", "Normal", "Hoch", "Sehr hoch"],
  },
  {
    id: "digestion",
    name: "Verdauung",
    options: ["Sehr schlecht", "Schlecht", "Normal", "Gut", "Sehr gut"],
  },
  {
    id: "skin",
    name: "Hautbild",
    options: ["Sehr schlecht", "Schlecht", "Normal", "Gut", "Sehr gut"],
  },
  {
    id: "sleep",
    name: "Schlafqualität",
    options: ["Sehr schlecht", "Schlecht", "Normal", "Gut", "Sehr gut"],
  },
  {
    id: "mood",
    name: "Stimmung",
    options: ["Sehr schlecht", "Schlecht", "Normal", "Gut", "Sehr gut"],
  },
]

export default function SymptomsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { addSymptom, analyzeSymptoms } = useNutraMind()
  const [symptoms, setSymptoms] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [analysis, setAnalysis] = useState<{
    analysis: string
    possibleCauses: string[]
    recommendations: string[]
  } | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)

  const handleSymptomChange = (categoryId: string, value: string) => {
    setSymptoms((prev) => ({
      ...prev,
      [categoryId]: value,
    }))
  }

  const handleSubmit = async () => {
    // Check if at least one symptom is selected
    if (Object.keys(symptoms).length === 0) {
      toast({
        title: "Keine Symptome ausgewählt",
        description: "Bitte wähle mindestens ein Symptom aus.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const today = new Date()
      const formattedDate = today.toLocaleDateString("de-DE")

      // Speichere die Symptome
      await addSymptom({
        date: formattedDate,
        categories: symptoms,
        notes: notes,
      })

      // Analysiere die Symptome mit Groq
      const symptomAnalysis = await analyzeSymptoms()
      setAnalysis(symptomAnalysis)
      setShowAnalysis(true)

      toast({
        title: "Symptome erfasst",
        description: "Deine Symptome wurden erfolgreich gespeichert und analysiert.",
      })
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Beim Speichern deiner Symptome ist ein Fehler aufgetreten.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center mb-6">
        <Activity className="h-6 w-6 text-emerald-600 mr-2" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Symptome erfassen</h1>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Durch das Erfassen deiner Symptome kann NutraMind mögliche Zusammenhänge mit deiner Ernährung erkennen.
      </p>

      {!showAnalysis ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Wie fühlst du dich heute?</CardTitle>
            <CardDescription>
              Bewerte deine Symptome, um mögliche Zusammenhänge mit deiner Ernährung zu erkennen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {SYMPTOM_CATEGORIES.map((category) => (
              <div key={category.id} className="space-y-3">
                <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
                <RadioGroup
                  value={symptoms[category.id] || ""}
                  onValueChange={(value) => handleSymptomChange(category.id, value)}
                >
                  <div className="grid grid-cols-5 gap-2">
                    {category.options.map((option, index) => (
                      <div key={index} className="flex flex-col items-center space-y-1">
                        <RadioGroupItem value={option} id={`${category.id}-${index}`} className="peer sr-only" />
                        <Label
                          htmlFor={`${category.id}-${index}`}
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-50 dark:peer-data-[state=checked]:bg-emerald-950 dark:peer-data-[state=checked]:border-emerald-700 [&:has([data-state=checked])]:border-primary cursor-pointer text-center text-xs"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            ))}

            <div className="space-y-2 pt-2">
              <Label htmlFor="notes">Zusätzliche Notizen</Label>
              <Textarea
                id="notes"
                placeholder="Beschreibe weitere Symptome oder Beobachtungen..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Abbrechen
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(symptoms).length === 0}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <>
                  <AlertCircle className="mr-2 h-4 w-4 animate-spin" /> Verarbeite...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" /> Symptome speichern
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="mr-2 h-5 w-5 text-emerald-600" />
              KI-Analyse deiner Symptome
            </CardTitle>
            <CardDescription>Basierend auf deinen Symptomen und Ernährungsgewohnheiten</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Analyse</h3>
              <p className="text-gray-700 dark:text-gray-300">{analysis?.analysis}</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Mögliche Ursachen</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                {analysis?.possibleCauses.map((cause, index) => (
                  <li key={index}>{cause}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Empfehlungen</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                {analysis?.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowAnalysis(false)}>
              Zurück
            </Button>
            <Button onClick={() => router.push("/dashboard")} className="bg-emerald-600 hover:bg-emerald-700">
              Zum Dashboard
            </Button>
          </CardFooter>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Warum Symptome erfassen?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li>• Erkennt mögliche Zusammenhänge zwischen Ernährung und Wohlbefinden</li>
            <li>• Identifiziert potenzielle Nahrungsmittelunverträglichkeiten</li>
            <li>• Verbessert die Personalisierung deiner Ernährungsempfehlungen</li>
            <li>• Hilft dir, Muster in deinem Wohlbefinden zu erkennen</li>
          </ul>
        </CardContent>
      </Card>
    </main>
  )
}
