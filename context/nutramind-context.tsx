"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { FoodEntry, Goal, Recommendation, SymptomEntry } from "@/types/nutramind"
import { useAuth } from "@/context/auth-context"
import { db } from "@/lib/firebase"
import { aiService } from "@/lib/ai-service"
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
} from "firebase/firestore"

// Sample data
const sampleFoodEntries: FoodEntry[] = [
  {
    id: "1",
    description: "Proteinshake mit Banane und Haferflocken",
    time: "08:30",
    date: "08.05.2023",
    nutrients: {
      calories: 350,
      protein: 30,
      carbs: 45,
      fat: 5,
    },
    analysis:
      "Diese Mahlzeit ist reich an Protein und unterstützt dein Ziel zum Muskelaufbau. Die Banane liefert wichtige Kalium und die Haferflocken komplexe Kohlenhydrate für langanhaltende Energie.",
  },
  {
    id: "2",
    description: "Gemischter Salat mit Hühnerbrust und Olivenöl",
    time: "13:15",
    date: "08.05.2023",
    nutrients: {
      calories: 420,
      protein: 35,
      carbs: 15,
      fat: 22,
    },
    analysis:
      "Ausgezeichnete Proteinquelle durch die Hühnerbrust. Das Olivenöl liefert gesunde Fette, die gut für deine Hautgesundheit sind. Der Salat enthält Antioxidantien, die Entzündungen reduzieren können.",
  },
]

const sampleGoals: Goal[] = [
  {
    id: "muscle-building",
    name: "Muskelaufbau",
    priority: 80,
    progress: 65,
    analysis:
      "Du nimmst ausreichend Protein zu dir, was dein Muskelwachstum unterstützt. Erhöhe deinen Kalorienüberschuss leicht für bessere Ergebnisse.",
  },
  {
    id: "skin-health",
    name: "Hautgesundheit",
    priority: 60,
    progress: 45,
    analysis:
      "Deine Aufnahme von Antioxidantien ist gut, aber du könntest mehr Omega-3-Fettsäuren und Zink zu dir nehmen, um deine Hautgesundheit zu verbessern.",
  },
]

const sampleRecommendations: Recommendation[] = [
  {
    id: "1",
    type: "food",
    goalId: "muscle-building",
    title: "Proteinreiche Lebensmittel",
    subtitle: "Für optimalen Muskelaufbau",
    description:
      "Um dein Ziel zum Muskelaufbau zu unterstützen, solltest du diese proteinreichen Lebensmittel in deinen Ernährungsplan integrieren. Sie liefern hochwertige Proteine mit allen essentiellen Aminosäuren.",
    foods: ["Hühnerbrust", "Thunfisch", "Magerquark", "Eier", "Linsen", "Tofu"],
  },
  {
    id: "2",
    type: "recipe",
    goalId: "skin-health",
    title: "Omega-3-reicher Lachs-Bowl",
    subtitle: "Für strahlende Haut",
    description:
      "Diese Mahlzeit ist reich an Omega-3-Fettsäuren und Antioxidantien, die Entzündungen reduzieren und deine Hautgesundheit fördern können.",
    recipe: {
      ingredients: [
        "150g Wildlachs",
        "1 Tasse Quinoa",
        "1 Avocado",
        "Handvoll Spinat",
        "1 EL Olivenöl",
        "Zitronensaft",
      ],
      instructions:
        "Lachs im Ofen garen, Quinoa kochen, alle Zutaten in einer Bowl anrichten und mit Olivenöl und Zitronensaft beträufeln.",
    },
  },
]

// Context type
interface NutraMindContextType {
  foodEntries: FoodEntry[]
  goals: Goal[]
  recommendations: Recommendation[]
  symptoms: SymptomEntry[]
  loading: boolean
  pendingChanges: boolean
  addFoodEntry: (entry: Omit<FoodEntry, "id" | "timestamp" | "nutrients" | "analysis">) => Promise<void>
  updateFoodEntry: (id: string, entry: Partial<FoodEntry>) => Promise<void>
  deleteFoodEntry: (id: string) => Promise<void>
  setGoals: (goals: Omit<Goal, "id">[]) => Promise<void>
  addSymptom: (symptom: Omit<SymptomEntry, "id" | "timestamp">) => Promise<void>
  generateRecommendations: () => Promise<void>
  analyzeSymptoms: () => Promise<any>
  transcribeSpeech: (audioBlob: Blob) => Promise<string>
}

// Create context
const NutraMindContext = createContext<NutraMindContextType | undefined>(undefined)

// Provider component
export function NutraMindProvider({ children }: { children: ReactNode }) {
  const { user, isConfigured, isOffline } = useAuth()
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>(sampleFoodEntries)
  const [goals, setGoalsState] = useState<Goal[]>(sampleGoals)
  const [recommendations, setRecommendations] = useState<Recommendation[]>(sampleRecommendations)
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingChanges, setPendingChanges] = useState(false)

  // Queue for storing operations that need to be synced when back online
  const [offlineQueue, setOfflineQueue] = useState<
    Array<{
      type: "add" | "update" | "delete"
      collection: string
      data: any
      id?: string
    }>
  >([])

  // Handle online/offline status changes
  useEffect(() => {
    const syncOfflineChanges = async () => {
      if (!isOffline && offlineQueue.length > 0 && user && db) {
        setPendingChanges(true)

        try {
          // Process each queued operation
          for (const op of offlineQueue) {
            const collectionRef = collection(db, "users", user.uid, op.collection)

            if (op.type === "add") {
              await addDoc(collectionRef, { ...op.data, timestamp: serverTimestamp() })
            } else if (op.type === "update" && op.id) {
              await updateDoc(doc(db, "users", user.uid, op.collection, op.id), op.data)
            } else if (op.type === "delete" && op.id) {
              await deleteDoc(doc(db, "users", user.uid, op.collection, op.id))
            }
          }

          // Clear the queue after successful sync
          setOfflineQueue([])
        } catch (error) {
          console.error("Error syncing offline changes:", error)
        } finally {
          setPendingChanges(false)
        }
      }
    }

    syncOfflineChanges()
  }, [isOffline, user, db, offlineQueue])

  // Daten aus Firestore laden, wenn der Benutzer sich ändert
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !db || !isConfigured || isOffline) {
        // Wenn Firebase nicht konfiguriert ist, kein Benutzer angemeldet ist oder offline,
        // verwenden wir die Beispieldaten
        setFoodEntries(sampleFoodEntries)
        setGoalsState(sampleGoals)
        setRecommendations(sampleRecommendations)
        setSymptoms([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        // Mahlzeiten laden
        const foodQuery = query(collection(db, "users", user.uid, "foodEntries"), orderBy("timestamp", "desc"))
        const foodSnapshot = await getDocs(foodQuery)
        const foodData = foodSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            description: data.description,
            time: data.time,
            date: data.date,
            nutrients: data.nutrients,
            analysis: data.analysis,
            timestamp: data.timestamp?.toDate() || new Date(),
          } as FoodEntry
        })
        setFoodEntries(foodData)

        // Ziele laden
        const goalsQuery = query(collection(db, "users", user.uid, "goals"))
        const goalsSnapshot = await getDocs(goalsQuery)
        const goalsData = goalsSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.name,
            priority: data.priority,
            progress: data.progress,
            analysis: data.analysis,
          } as Goal
        })
        setGoalsState(goalsData)

        // Symptome laden
        const symptomsQuery = query(collection(db, "users", user.uid, "symptoms"), orderBy("timestamp", "desc"))
        const symptomsSnapshot = await getDocs(symptomsQuery)
        const symptomsData = symptomsSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            date: data.date,
            categories: data.categories,
            notes: data.notes,
            timestamp: data.timestamp?.toDate() || new Date(),
          } as SymptomEntry
        })
        setSymptoms(symptomsData)

        // Empfehlungen laden
        const recommendationsQuery = query(collection(db, "users", user.uid, "recommendations"))
        const recommendationsSnapshot = await getDocs(recommendationsQuery)
        if (recommendationsSnapshot.docs.length > 0) {
          const recommendationsData = recommendationsSnapshot.docs.map((doc) => {
            return { id: doc.id, ...doc.data() } as Recommendation
          })
          setRecommendations(recommendationsData)
        }
      } catch (error) {
        console.error("Fehler beim Laden der Daten:", error)
        // Fallback to sample data if loading fails
        setFoodEntries(sampleFoodEntries)
        setGoalsState(sampleGoals)
        setRecommendations(sampleRecommendations)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, isConfigured, isOffline])

  // Mahlzeit hinzufügen mit KI-Analyse
  const addFoodEntry = async (entry: Omit<FoodEntry, "id" | "timestamp" | "nutrients" | "analysis">) => {
    try {
      setLoading(true)

      // KI-Analyse der Mahlzeit durchführen
      const nutritionAnalysis = await aiService.analyzeFoodEntry(entry.description)

      const completeEntry = {
        ...entry,
        nutrients: {
          calories: nutritionAnalysis.calories,
          protein: nutritionAnalysis.protein,
          carbs: nutritionAnalysis.carbs,
          fat: nutritionAnalysis.fat,
        },
        analysis: nutritionAnalysis.analysis,
      }

      // Generate a temporary ID for offline mode
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

      if (!user || !db || !isConfigured || isOffline) {
        // Simuliere Hinzufügen ohne Firebase oder im Offline-Modus
        const newEntry = {
          ...completeEntry,
          id: tempId,
          timestamp: new Date(),
        } as FoodEntry

        setFoodEntries((prev) => [newEntry, ...prev])

        // If offline but authenticated, queue the operation for later sync
        if (isOffline && user) {
          setOfflineQueue((prev) => [
            ...prev,
            {
              type: "add",
              collection: "foodEntries",
              data: completeEntry,
            },
          ])
          setPendingChanges(true)
        }

        return
      }

      const entryWithTimestamp = {
        ...completeEntry,
        timestamp: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "users", user.uid, "foodEntries"), entryWithTimestamp)

      setFoodEntries((prev) => [
        {
          ...completeEntry,
          id: docRef.id,
          timestamp: new Date(),
        } as FoodEntry,
        ...prev,
      ])
    } catch (error) {
      console.error("Fehler beim Hinzufügen der Mahlzeit:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Mahlzeit aktualisieren
  const updateFoodEntry = async (id: string, entry: Partial<FoodEntry>) => {
    if (!user || !db || !isConfigured || isOffline) {
      // Simuliere Aktualisieren ohne Firebase oder im Offline-Modus
      setFoodEntries((prev) => prev.map((item) => (item.id === id ? { ...item, ...entry } : item)))

      // If offline but authenticated, queue the operation for later sync
      if (isOffline && user) {
        setOfflineQueue((prev) => [
          ...prev,
          {
            type: "update",
            collection: "foodEntries",
            data: entry,
            id,
          },
        ])
        setPendingChanges(true)
      }

      return
    }

    try {
      await updateDoc(doc(db, "users", user.uid, "foodEntries", id), { ...entry, updatedAt: serverTimestamp() })

      setFoodEntries((prev) => prev.map((item) => (item.id === id ? { ...item, ...entry } : item)))
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Mahlzeit:", error)
      throw error
    }
  }

  // Mahlzeit löschen
  const deleteFoodEntry = async (id: string) => {
    if (!user || !db || !isConfigured || isOffline) {
      // Simuliere Löschen ohne Firebase oder im Offline-Modus
      setFoodEntries((prev) => prev.filter((item) => item.id !== id))

      // If offline but authenticated, queue the operation for later sync
      if (isOffline && user && !id.startsWith("temp_")) {
        setOfflineQueue((prev) => [
          ...prev,
          {
            type: "delete",
            collection: "foodEntries",
            data: {},
            id,
          },
        ])
        setPendingChanges(true)
      }

      return
    }

    try {
      await deleteDoc(doc(db, "users", user.uid, "foodEntries", id))
      setFoodEntries((prev) => prev.filter((item) => item.id !== id))
    } catch (error) {
      console.error("Fehler beim Löschen der Mahlzeit:", error)
      throw error
    }
  }

  // Ziele setzen
  const setGoals = async (newGoals: Omit<Goal, "id">[]) => {
    if (!user || !db || !isConfigured || isOffline) {
      // Simuliere Ziele setzen ohne Firebase oder im Offline-Modus
      const goalsWithIds = newGoals.map((goal) => ({
        ...goal,
        id: Math.random().toString(36).substring(2, 9),
      })) as Goal[]

      setGoalsState(goalsWithIds)

      // If offline but authenticated, queue the operations for later sync
      if (isOffline && user) {
        // First queue deletion of all existing goals
        setOfflineQueue((prev) => [
          ...prev,
          {
            type: "delete",
            collection: "goals",
            data: { deleteAll: true },
          },
        ])

        // Then queue addition of new goals
        newGoals.forEach((goal) => {
          setOfflineQueue((prev) => [
            ...prev,
            {
              type: "add",
              collection: "goals",
              data: goal,
            },
          ])
        })

        setPendingChanges(true)
      }

      return
    }

    try {
      // Bestehende Ziele löschen
      const goalsQuery = query(collection(db, "users", user.uid, "goals"))
      const goalsSnapshot = await getDocs(goalsQuery)

      const deletePromises = goalsSnapshot.docs.map((doc) => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      // Neue Ziele hinzufügen
      const addPromises = newGoals.map(async (goal) => {
        const docRef = await addDoc(collection(db, "users", user.uid, "goals"), goal)
        return { ...goal, id: docRef.id }
      })

      const addedGoals = await Promise.all(addPromises)
      setGoalsState(addedGoals as Goal[])
    } catch (error) {
      console.error("Fehler beim Setzen der Ziele:", error)
      throw error
    }
  }

  // Symptom hinzufügen
  const addSymptom = async (symptom: Omit<SymptomEntry, "id" | "timestamp">) => {
    // Generate a temporary ID for offline mode
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    if (!user || !db || !isConfigured || isOffline) {
      // Simuliere Symptom hinzufügen ohne Firebase oder im Offline-Modus
      const newSymptom = {
        ...symptom,
        id: tempId,
        timestamp: new Date(),
      } as SymptomEntry

      setSymptoms((prev) => [newSymptom, ...prev])

      // If offline but authenticated, queue the operation for later sync
      if (isOffline && user) {
        setOfflineQueue((prev) => [
          ...prev,
          {
            type: "add",
            collection: "symptoms",
            data: symptom,
          },
        ])
        setPendingChanges(true)
      }

      return
    }

    try {
      const symptomWithTimestamp = {
        ...symptom,
        timestamp: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "users", user.uid, "symptoms"), symptomWithTimestamp)

      setSymptoms((prev) => [
        {
          ...symptom,
          id: docRef.id,
          timestamp: new Date(),
        } as SymptomEntry,
        ...prev,
      ])
    } catch (error) {
      console.error("Fehler beim Hinzufügen des Symptoms:", error)
      throw error
    }
  }

  // Empfehlungen mit Groq KI generieren
  const generateRecommendations = async () => {
    if (isOffline) {
      throw new Error("Diese Funktion ist im Offline-Modus nicht verfügbar")
    }

    try {
      setLoading(true)

      // KI-Empfehlungen generieren
      const aiRecommendations = await aiService.generateRecommendations(goals, foodEntries, symptoms)

      // Empfehlungen mit IDs versehen
      const recommendationsWithIds = aiRecommendations.recommendations.map((rec, index) => ({
        ...rec,
        id: (index + 1).toString(),
      }))

      if (!user || !db || !isConfigured) {
        // Simuliere Empfehlungen speichern ohne Firebase
        setRecommendations(recommendationsWithIds)
        return
      }

      // Speichere Empfehlungen in Firestore
      const recommendationsRef = collection(db, "users", user.uid, "recommendations")

      // Lösche alte Empfehlungen
      const oldRecsQuery = query(recommendationsRef)
      const oldRecsSnapshot = await getDocs(oldRecsQuery)
      const deletePromises = oldRecsSnapshot.docs.map((doc) => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      // Füge neue Empfehlungen hinzu
      const addPromises = recommendationsWithIds.map(async (rec) => {
        await setDoc(doc(recommendationsRef, rec.id), rec)
      })
      await Promise.all(addPromises)

      setRecommendations(recommendationsWithIds)
    } catch (error) {
      console.error("Fehler beim Generieren der Empfehlungen:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Symptome mit Groq KI analysieren
  const analyzeSymptoms = async () => {
    if (isOffline) {
      return {
        analysis:
          "Diese Funktion ist im Offline-Modus nicht verfügbar. Bitte versuche es erneut, wenn du wieder online bist.",
        possibleCauses: ["Offline-Modus aktiv"],
        recommendations: ["Stelle eine Internetverbindung her, um eine vollständige Analyse zu erhalten."],
      }
    }

    if (symptoms.length === 0) {
      return {
        analysis: "Keine Symptome zur Analyse vorhanden.",
        possibleCauses: [],
        recommendations: [],
      }
    }

    try {
      setLoading(true)

      // Symptome mit KI analysieren
      const analysis = await aiService.analyzeSymptoms(
        symptoms,
        foodEntries.map((entry) => ({ description: entry.description, date: entry.date })),
      )

      return analysis
    } catch (error) {
      console.error("Fehler bei der Symptomanalyse:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Spracherkennung mit Groq KI
  const transcribeSpeech = async (audioBlob: Blob) => {
    if (isOffline) {
      return "Spracherkennung ist im Offline-Modus nicht verfügbar. Bitte gib deine Mahlzeit manuell ein."
    }

    try {
      return await aiService.transcribeSpeech(audioBlob)
    } catch (error) {
      console.error("Fehler bei der Spracherkennung:", error)
      throw error
    }
  }

  return (
    <NutraMindContext.Provider
      value={{
        foodEntries,
        goals,
        recommendations,
        symptoms,
        loading,
        pendingChanges,
        addFoodEntry,
        updateFoodEntry,
        deleteFoodEntry,
        setGoals,
        addSymptom,
        generateRecommendations,
        analyzeSymptoms,
        transcribeSpeech,
      }}
    >
      {children}
    </NutraMindContext.Provider>
  )
}

// Hook for using the context
export function useNutraMind() {
  const context = useContext(NutraMindContext)
  if (context === undefined) {
    throw new Error("useNutraMind must be used within a NutraMindProvider")
  }
  return context
}
