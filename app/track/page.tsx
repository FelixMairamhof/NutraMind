"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useNutraMind } from "@/context/nutramind-context"
import { useRouter } from "next/navigation"
import { Mic, MicOff, Send, Loader2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function TrackPage() {
  const [inputText, setInputText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const { toast } = useToast()
  const { addFoodEntry, transcribeSpeech } = useNutraMind()
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Implement real speech recognition using Web Speech API
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })

        try {
          setIsProcessing(true)
          setApiError(null)
          toast({
            title: "Verarbeite Sprachaufnahme",
            description: "Deine Aufnahme wird analysiert...",
          })

          // Use Groq to transcribe speech
          const transcription = await transcribeSpeech(audioBlob)
          setInputText((prev) => (prev ? `${prev} ${transcription}` : transcription))

          toast({
            title: "Aufnahme verarbeitet",
            description: "Deine Spracheingabe wurde erfolgreich verarbeitet.",
          })
        } catch (error) {
          console.error("Fehler bei der Spracherkennung:", error)
          toast({
            title: "Fehler",
            description: "Die Spracherkennung konnte nicht verarbeitet werden.",
            variant: "destructive",
          })

          if (error instanceof Error && error.message.includes("API key")) {
            setApiError("Groq API-Schlüssel fehlt oder ist ungültig. Die Spracherkennung verwendet Fallback-Werte.")
          }
        } finally {
          setIsProcessing(false)
          setIsRecording(false)
        }

        // Stop all tracks in the stream
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)

      toast({
        title: "Aufnahme gestartet",
        description: "Sprich jetzt, um deine Mahlzeit zu erfassen.",
      })
    } catch (error) {
      console.error("Fehler beim Starten der Aufnahme:", error)
      toast({
        title: "Fehler",
        description: "Mikrofon konnte nicht aktiviert werden. Bitte erlaube den Zugriff auf dein Mikrofon.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      toast({
        title: "Aufnahme beendet",
        description: "Deine Spracheingabe wird verarbeitet...",
      })
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Eingabe fehlt",
        description: "Bitte gib deine Mahlzeit ein oder nutze die Sprachaufnahme.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setApiError(null)

    try {
      // Aktuelles Datum und Zeit
      const now = new Date()
      const formattedDate = now.toLocaleDateString("de-DE")
      const formattedTime = now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })

      // Add the food entry with AI analysis
      await addFoodEntry({
        description: inputText,
        time: formattedTime,
        date: formattedDate,
      })

      toast({
        title: "Mahlzeit erfasst",
        description: "Deine Mahlzeit wurde erfolgreich gespeichert und analysiert.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Fehler beim Speichern:", error)

      if (error instanceof Error && error.message.includes("API key")) {
        setApiError("Groq API-Schlüssel fehlt oder ist ungültig. Die Nährwertanalyse verwendet Fallback-Werte.")

        toast({
          title: "Eingeschränkte Funktionalität",
          description: "Die Mahlzeit wurde mit eingeschränkter KI-Analyse gespeichert.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Fehler",
          description: "Beim Speichern deiner Mahlzeit ist ein Fehler aufgetreten.",
          variant: "destructive",
        })
      }
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    // Focus the textarea when the component mounts
    if (textareaRef.current) {
      textareaRef.current.focus()
    }

    // Clean up media recorder on unmount
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [isRecording])

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Mahlzeit erfassen</h1>

      {apiError && (
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Eingeschränkte KI-Funktionalität</AlertTitle>
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Was hast du gegessen?</CardTitle>
          <CardDescription>
            Beschreibe deine Mahlzeit so detailliert wie möglich für eine genaue Analyse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            ref={textareaRef}
            placeholder="z.B. 'Ich habe ein Omelett mit 2 Eiern, Spinat und etwas Käse gegessen'"
            className="min-h-[120px] resize-none"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isProcessing}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={toggleRecording}
            disabled={isProcessing}
            className={isRecording ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700" : ""}
          >
            {isRecording ? (
              <>
                <MicOff className="mr-2 h-4 w-4" /> Stoppen
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" /> Sprechen
              </>
            )}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!inputText.trim() || isProcessing}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verarbeite...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Erfassen
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tipps für genaue Erfassung</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li>• Gib Mengen an, wenn möglich (z.B. "2 Eier", "100g Haferflocken")</li>
            <li>• Erwähne Zubereitungsarten (gekocht, gebraten, roh)</li>
            <li>• Beschreibe Zusätze wie Öle, Gewürze oder Saucen</li>
            <li>• Vergiss Getränke nicht zu erwähnen</li>
          </ul>
        </CardContent>
      </Card>
    </main>
  )
}
