"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Brain, Loader2, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signUp, authError, isConfigured } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Wenn authError sich ändert, aktualisiere den lokalen Fehlerzustand
  useEffect(() => {
    if (authError) {
      setError(authError)
    }
  }, [authError])

  // Wenn Firebase nicht konfiguriert ist, leite zum Demo-Modus weiter
  useEffect(() => {
    if (!isConfigured) {
      router.push("/dashboard")
    }
  }, [isConfigured, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Fehler",
        description: "Bitte fülle alle Felder aus.",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Fehler",
        description: "Die Passwörter stimmen nicht überein.",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Fehler",
        description: "Das Passwort muss mindestens 6 Zeichen lang sein.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await signUp(email, password, name)
      toast({
        title: "Konto erstellt",
        description: "Dein NutraMind-Konto wurde erfolgreich erstellt!",
      })
    } catch (error: any) {
      let message = "Bei der Registrierung ist ein Fehler aufgetreten."

      if (error.code === "auth/email-already-in-use") {
        message = "Diese E-Mail-Adresse wird bereits verwendet."
      } else if (error.code === "auth/invalid-email") {
        message = "Die E-Mail-Adresse ist ungültig."
      } else if (error.code === "auth/weak-password") {
        message = "Das Passwort ist zu schwach."
      } else if (error.code === "auth/configuration-not-found") {
        message =
          "Firebase Authentication ist nicht korrekt konfiguriert. Bitte aktiviere die E-Mail/Passwort-Authentifizierung in der Firebase Console."
      }

      setError(message)

      toast({
        title: "Registrierung fehlgeschlagen",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950 dark:to-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Brain className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="text-2xl text-center">Registrieren</CardTitle>
          <CardDescription className="text-center">
            Erstelle dein NutraMind-Konto und starte deine Ernährungsoptimierung
          </CardDescription>
        </CardHeader>

        {error && (
          <div className="px-6">
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Fehler</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              {error.includes("Firebase Authentication ist nicht korrekt konfiguriert") && (
                <div className="mt-2 text-xs">
                  <p>Bitte führe folgende Schritte aus:</p>
                  <ol className="list-decimal pl-4 mt-1 space-y-1">
                    <li>
                      Gehe zur{" "}
                      <a
                        href="https://console.firebase.google.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Firebase Console
                      </a>
                    </li>
                    <li>Wähle dein Projekt aus</li>
                    <li>Navigiere zu "Authentication" im linken Menü</li>
                    <li>Klicke auf "Sign-in method"</li>
                    <li>Aktiviere "Email/Password"</li>
                    <li>Speichere die Änderungen</li>
                  </ol>
                  <p className="mt-2">
                    Alternativ kannst du den{" "}
                    <Link href="/dashboard" className="underline">
                      Demo-Modus
                    </Link>{" "}
                    verwenden.
                  </p>
                </div>
              )}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Dein Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="deine@email.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrieren...
                </>
              ) : (
                "Registrieren"
              )}
            </Button>
            <div className="text-center text-sm">
              Bereits ein Konto?{" "}
              <Link
                href="/auth/login"
                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
              >
                Anmelden
              </Link>
            </div>
            <div className="text-center text-sm">
              <Link
                href="/dashboard"
                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
              >
                Demo-Modus ohne Anmeldung
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
