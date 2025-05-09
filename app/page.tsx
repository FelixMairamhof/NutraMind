"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { ArrowRight, Brain, Carrot, LineChart, MessageSquare, Target, AlertTriangle } from "lucide-react"

export default function Home() {
  const { user, loading, isConfigured } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        {!isConfigured && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Firebase-Konfiguration fehlt</AlertTitle>
            <AlertDescription>
              Die Firebase-Konfiguration wurde nicht gefunden. Bitte stelle sicher, dass du die erforderlichen
              Umgebungsvariablen in deiner .env.local-Datei definiert hast. Die App wird im Demo-Modus mit Beispieldaten
              ausgeführt.
            </AlertDescription>
          </Alert>
        )}

        <header className="flex flex-col items-center justify-center text-center py-12 md:py-20">
          <div className="flex items-center mb-4">
            <Brain className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mr-2" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Nutra<span className="text-emerald-600 dark:text-emerald-400">Mind</span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-2xl mb-8">
            Optimiere deine Ernährung mit KI-gestützten Empfehlungen für deine persönlichen Gesundheitsziele
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Link href={isConfigured ? "/auth/login" : "/dashboard"}>
                {isConfigured ? "Anmelden" : "Demo starten"} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {isConfigured && (
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/register">Registrieren</Link>
              </Button>
            )}
          </div>
        </header>

        <section className="py-12">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Wie NutraMind dir hilft
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<MessageSquare className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />}
              title="Einfache Eingabe"
              description="Tracke deine Mahlzeiten per Text oder Spracheingabe - so einfach wie eine Nachricht schreiben."
            />
            <FeatureCard
              icon={<Brain className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />}
              title="KI-Analyse"
              description="Unsere KI analysiert deine Ernährung im Hinblick auf deine persönlichen Gesundheitsziele."
            />
            <FeatureCard
              icon={<Target className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />}
              title="Zielgerichtete Empfehlungen"
              description="Erhalte personalisierte Empfehlungen für Akne-Reduktion, Muskelaufbau oder Langlebigkeit."
            />
            <FeatureCard
              icon={<Carrot className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />}
              title="Rezeptvorschläge"
              description="Entdecke Rezepte, die perfekt zu deinen Ernährungszielen passen."
            />
            <FeatureCard
              icon={<LineChart className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />}
              title="Symptomanalyse"
              description="Verfolge Symptome und entdecke mögliche Zusammenhänge mit deiner Ernährung."
            />
            <FeatureCard
              icon={<ArrowRight className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />}
              title="Fortschritt verfolgen"
              description="Behalte deinen Fortschritt im Blick und passe deine Ernährung entsprechend an."
            />
          </div>
        </section>

        <section className="py-12 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            Bereit, deine Ernährung zu optimieren?
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Starte jetzt und erhalte personalisierte Ernährungsempfehlungen basierend auf deinen Zielen.
          </p>
          <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link href={isConfigured ? "/auth/register" : "/dashboard"}>
              {isConfigured ? "Jetzt registrieren" : "Demo starten"} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>
      </div>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="border-emerald-100 dark:border-emerald-900">
      <CardHeader>
        <div className="mb-2">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}
