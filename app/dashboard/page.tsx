"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { useNutraMind } from "@/context/nutramind-context"
import { useAuth } from "@/context/auth-context"
import { Plus, ArrowRight, Utensils, Brain, Target, LineChart, RefreshCw, WifiOff } from "lucide-react"
import Link from "next/link"
import { FoodEntryCard } from "@/components/food-entry-card"
import { NutritionSummaryCard } from "@/components/nutrition-summary-card"
import { RecommendationCard } from "@/components/recommendation-card"

export default function Dashboard() {
  const { toast } = useToast()
  const { foodEntries, goals, recommendations, generateRecommendations } = useNutraMind()
  const { isOffline } = useAuth()
  const [activeTab, setActiveTab] = useState("übersicht")
  const [loading, setLoading] = useState(true)
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleGenerateRecommendations = async () => {
    if (isOffline) {
      toast({
        title: "Offline-Modus",
        description: "Diese Funktion ist im Offline-Modus nicht verfügbar.",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingRecommendations(true)
    try {
      await generateRecommendations()
      toast({
        title: "Empfehlungen aktualisiert",
        description: "Deine personalisierten Empfehlungen wurden mit KI aktualisiert.",
      })
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Beim Generieren der Empfehlungen ist ein Fehler aufgetreten.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingRecommendations(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Lade deine Daten...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {isOffline && (
        <Alert variant="warning" className="mb-6">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>Offline-Modus</AlertTitle>
          <AlertDescription>
            Du bist derzeit offline. Einige Funktionen sind möglicherweise eingeschränkt. Deine Änderungen werden
            synchronisiert, sobald du wieder online bist.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Deine persönliche Ernährungsübersicht</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button asChild variant="outline">
            <Link href="/symptoms">Symptome erfassen</Link>
          </Button>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/track">
              <Plus className="mr-2 h-4 w-4" /> Mahlzeit erfassen
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="übersicht" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
          <TabsTrigger value="übersicht">Übersicht</TabsTrigger>
          <TabsTrigger value="mahlzeiten">Mahlzeiten</TabsTrigger>
          <TabsTrigger value="analyse">Analyse</TabsTrigger>
          <TabsTrigger value="empfehlungen">Empfehlungen</TabsTrigger>
        </TabsList>

        <TabsContent value="übersicht" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Utensils className="mr-2 h-5 w-5 text-emerald-600" />
                  Heutige Mahlzeiten
                </CardTitle>
                <CardDescription>Deine erfassten Mahlzeiten</CardDescription>
              </CardHeader>
              <CardContent>
                {foodEntries.length > 0 ? (
                  <div className="space-y-2">
                    {foodEntries.slice(0, 2).map((entry, index) => (
                      <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <p className="font-medium">{entry.description}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{entry.time}</p>
                      </div>
                    ))}
                    {foodEntries.length > 2 && (
                      <Button variant="link" asChild className="p-0 h-auto">
                        <Link href="#" onClick={() => setActiveTab("mahlzeiten")}>
                          Alle anzeigen <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400 mb-3">Noch keine Mahlzeiten erfasst</p>
                    <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      <Link href="/track">Mahlzeit erfassen</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5 text-emerald-600" />
                  Ziele
                </CardTitle>
                <CardDescription>Dein Fortschritt</CardDescription>
              </CardHeader>
              <CardContent>
                {goals.length > 0 ? (
                  <div className="space-y-4">
                    {goals.map((goal, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{goal.name}</span>
                          <span>{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400 mb-3">Keine Ziele definiert</p>
                    <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      <Link href="/goals">Ziele definieren</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Brain className="mr-2 h-5 w-5 text-emerald-600" />
                  KI-Empfehlungen
                </CardTitle>
                <CardDescription>Basierend auf deinen Zielen</CardDescription>
              </CardHeader>
              <CardContent>
                {recommendations.length > 0 ? (
                  <div className="space-y-2">
                    {recommendations.slice(0, 2).map((rec, index) => (
                      <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <p className="font-medium">{rec.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {rec.description.substring(0, 60)}...
                        </p>
                      </div>
                    ))}
                    {recommendations.length > 2 && (
                      <Button variant="link" asChild className="p-0 h-auto">
                        <Link href="#" onClick={() => setActiveTab("empfehlungen")}>
                          Alle anzeigen <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400">Erfasse Mahlzeiten für Empfehlungen</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <NutritionSummaryCard />
        </TabsContent>

        <TabsContent value="mahlzeiten" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Deine Mahlzeiten</h2>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/track">
                <Plus className="mr-2 h-4 w-4" /> Mahlzeit erfassen
              </Link>
            </Button>
          </div>

          {foodEntries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {foodEntries.map((entry, index) => (
                <FoodEntryCard key={index} entry={entry} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">Du hast noch keine Mahlzeiten erfasst</p>
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/track">Erste Mahlzeit erfassen</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analyse" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Ernährungsanalyse</h2>
            <Button
              variant="outline"
              onClick={() =>
                toast({ title: "Analyse aktualisiert", description: "Deine Ernährungsanalyse wurde aktualisiert." })
              }
              disabled={isOffline}
            >
              <LineChart className="mr-2 h-4 w-4" /> Aktualisieren
            </Button>
          </div>

          {foodEntries.length > 0 ? (
            <>
              <NutritionSummaryCard detailed />

              <Card>
                <CardHeader>
                  <CardTitle>Zielfortschritt</CardTitle>
                  <CardDescription>Wie deine Ernährung zu deinen Zielen beiträgt</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {goals.map((goal, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{goal.name}</h3>
                          <span className="text-sm font-medium">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-3" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">{goal.analysis}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">Erfasse Mahlzeiten, um eine Analyse zu erhalten</p>
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/track">Mahlzeit erfassen</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="empfehlungen" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Personalisierte Empfehlungen</h2>
            <Button
              variant="outline"
              onClick={handleGenerateRecommendations}
              disabled={isGeneratingRecommendations || isOffline}
            >
              {isGeneratingRecommendations ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Generiere...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" /> Neue KI-Empfehlungen
                </>
              )}
            </Button>
          </div>

          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((recommendation, index) => (
                <RecommendationCard key={index} recommendation={recommendation} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">Erfasse Mahlzeiten, um Empfehlungen zu erhalten</p>
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/track">Mahlzeit erfassen</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </main>
  )
}
