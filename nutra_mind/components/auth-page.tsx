"use client"

import { useState } from "react"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, setDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Leaf, Check } from "lucide-react"

export function AuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSignIn = async () => {
    setLoading(true)
    setError("")
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      setError("Anmeldung fehlgeschlagen. Bitte überprüfe deine Anmeldedaten.")
    }
    setLoading(false)
  }

  const handleSignUp = async () => {
    setLoading(true)
    setError("")
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Create user profile in Firestore with default values
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        createdAt: new Date(),
        height: null,
        weight: null,
        age: null,
        sex: null,
        activity: "moderate",
        goals: ["longevity"],
        onboardingCompleted: false,
        subscriptionStatus: "active", // Set as active for now
      })
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setError("Diese E-Mail-Adresse wird bereits verwendet.")
      } else if (error.code === "auth/weak-password") {
        setError("Das Passwort ist zu schwach. Mindestens 6 Zeichen erforderlich.")
      } else {
        setError("Registrierung fehlgeschlagen. Bitte versuche es erneut.")
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
        {/* Left side - Features */}
        <div className="space-y-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <Leaf className="h-10 w-10 text-primary mr-3" />
              <h1 className="text-3xl font-bold high-contrast-text">GreenTrack</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Intelligente Kalorie- und Makronährstoff-Verfolgung mit KI-gestützten Erkenntnissen
            </p>
          </div>

          <Card className="card-gradient glow-border">
            <CardHeader>
              <CardTitle className="high-contrast-text">Funktionen</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  "KI-gestützte Ernährungsanalyse",
                  "Personalisierte Gesundheitsempfehlungen",
                  "Erweiterte Analysen und Trends",
                  "Unbegrenzte Mahlzeitenverfolgung",
                  "Gewichtsverfolgung",
                  "Offline-Funktionalität",
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Auth form */}
        <Card className="card-gradient glow-border">
          <CardHeader className="text-center">
            <CardTitle className="high-contrast-text">Willkommen bei GreenTrack</CardTitle>
            <CardDescription>Melde dich an oder erstelle ein neues Konto</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Anmelden</TabsTrigger>
                <TabsTrigger value="signup">Registrieren</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="high-contrast-text">
                    E-Mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="deine@email.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glow-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="high-contrast-text">
                    Passwort
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Dein Passwort"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glow-border"
                  />
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <Button
                  onClick={handleSignIn}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-primary/80"
                >
                  {loading ? "Anmelden..." : "Anmelden"}
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="high-contrast-text">
                    E-Mail
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="deine@email.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glow-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="high-contrast-text">
                    Passwort
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Mindestens 6 Zeichen"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glow-border"
                  />
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <Button
                  onClick={handleSignUp}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-primary/80"
                >
                  {loading ? "Konto erstellen..." : "Konto erstellen"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Nach der Registrierung wirst du durch das Setup geführt.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
