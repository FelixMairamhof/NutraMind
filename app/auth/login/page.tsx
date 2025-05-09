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

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn, authError, isConfigured } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Wenn authError sich ändert, aktualisiere den lokalen Fehlerzustand
  useEffect(() => {
    if (authError) {
      setError(authError)
    }
  }, [authError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: "Fehler",
        description: "Bitte fülle alle Felder aus.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await signIn(email, password)
      toast({
        title: "Erfolgreich angemeldet",
        description: "Willkommen zurück bei NutraMind!",
      })
    } catch (error: any) {
      let message = "Bei der Anmeldung ist ein Fehler aufgetreten."

      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        message = "E-Mail oder Passwort ist falsch."
      } else if (error.code === "auth/too-many-requests") {
        message = "Zu viele Anmeldeversuche. Bitte versuche es später erneut."
      } else if (error.code === "auth/configuration-not-found") {
        message =
          "Firebase Authentication ist nicht korrekt konfiguriert. Bitte aktiviere die E-Mail/Passwort-Authentifizierung in der Firebase Console."
      }

      setError(message)

      toast({
        title: "Anmeldung fehlgeschlagen",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Wenn Firebase nicht konfiguriert ist, leite zum Demo-Modus weiter
  useEffect(() => {
    if (!isConfigured) {
      router.push("/dashboard")
    }
  }, [isConfigured, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950 dark:to-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Brain className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="text-2xl text-center">Anmelden</CardTitle>
          <CardDescription className="text-center">
            Gib deine Anmeldedaten ein, um auf dein NutraMind-Konto zuzugreifen
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Passwort</Label>
                <Link
                  href="/auth/reset-password"
                  className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  Passwort vergessen?
                </Link>
              </div>
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
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Anmelden...
                </>
              ) : (
                "Anmelden"
              )}
            </Button>
            <div className="text-center text-sm">
              Noch kein Konto?{" "}
              <Link
                href="/auth/register"
                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
              >
                Registrieren
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
