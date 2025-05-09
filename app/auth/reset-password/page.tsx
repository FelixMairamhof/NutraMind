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
import { Brain, Loader2, ArrowLeft, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { resetPassword, authError, isConfigured } = useAuth()
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

    if (!email) {
      toast({
        title: "Fehler",
        description: "Bitte gib deine E-Mail-Adresse ein.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await resetPassword(email)
      setIsSuccess(true)
      toast({
        title: "E-Mail gesendet",
        description: "Eine Anleitung zum Zurücksetzen deines Passworts wurde an deine E-Mail-Adresse gesendet.",
      })
    } catch (error: any) {
      let message = "Beim Zurücksetzen des Passworts ist ein Fehler aufgetreten."

      if (error.code === "auth/user-not-found") {
        message = "Es wurde kein Konto mit dieser E-Mail-Adresse gefunden."
      } else if (error.code === "auth/invalid-email") {
        message = "Die E-Mail-Adresse ist ungültig."
      } else if (error.code === "auth/configuration-not-found") {
        message =
          "Firebase Authentication ist nicht korrekt konfiguriert. Bitte aktiviere die E-Mail/Passwort-Authentifizierung in der Firebase Console."
      }

      setError(message)

      toast({
        title: "Zurücksetzen fehlgeschlagen",
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
          <CardTitle className="text-2xl text-center">Passwort zurücksetzen</CardTitle>
          <CardDescription className="text-center">
            Gib deine E-Mail-Adresse ein, um einen Link zum Zurücksetzen deines Passworts zu erhalten
          </CardDescription>
        </CardHeader>

        {error && !isSuccess && (
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

        {!isSuccess ? (
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
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Senden...
                  </>
                ) : (
                  "Link zum Zurücksetzen senden"
                )}
              </Button>
              <Button variant="ghost" asChild className="w-full">
                <Link href="/auth/login">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Zurück zur Anmeldung
                </Link>
              </Button>
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
        ) : (
          <CardContent className="space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-lg text-center">
              <p className="text-emerald-700 dark:text-emerald-300">
                Eine E-Mail mit Anweisungen zum Zurücksetzen deines Passworts wurde gesendet.
              </p>
            </div>
            <Button variant="ghost" asChild className="w-full mt-4">
              <Link href="/auth/login">
                <ArrowLeft className="mr-2 h-4 w-4" /> Zurück zur Anmeldung
              </Link>
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
