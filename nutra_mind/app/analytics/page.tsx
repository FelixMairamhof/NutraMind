"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { CalorieChart } from "@/components/calorie-chart"
import { MacroChart } from "@/components/macro-chart"
import { WeightChart } from "@/components/weight-chart"
import { HealthCoachWeekly } from "@/components/health-coach-weekly"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface DayData {
  calories: number
  carbs: number
  protein: number
  fat: number
  date: string
}

interface WeightEntry {
  weight: number
  date: string
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [todayData, setTodayData] = useState<DayData>({ calories: 0, carbs: 0, protein: 0, fat: 0, date: "" })
  const [weekData, setWeekData] = useState<DayData[]>([])
  const [weightData, setWeightData] = useState<WeightEntry[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      setLoading(true)
      Promise.all([fetchTodayData(), fetchWeekData(), fetchWeightData(), fetchUserProfile()]).finally(() => {
        setLoading(false)
      })
    }
  }, [user])

  const fetchUserProfile = async () => {
    if (!user) return

    const userDoc = await getDoc(doc(db, "users", user.uid))
    if (userDoc.exists()) {
      setUserProfile(userDoc.data())
    }
  }

  const fetchTodayData = async () => {
    if (!user) return

    const today = new Date().toISOString().split("T")[0]
    const entriesRef = collection(db, "entries")
    const q = query(entriesRef, where("uid", "==", user.uid), where("date", "==", today))

    const snapshot = await getDocs(q)
    let totalCalories = 0
    let totalCarbs = 0
    let totalProtein = 0
    let totalFat = 0

    snapshot.forEach((doc) => {
      const data = doc.data()
      totalCalories += data.calories || 0
      totalCarbs += data.carbs || 0
      totalProtein += data.protein || 0
      totalFat += data.fat || 0
    })

    setTodayData({
      calories: totalCalories,
      carbs: totalCarbs,
      protein: totalProtein,
      fat: totalFat,
      date: today,
    })
  }

  const fetchWeekData = async () => {
    if (!user) return

    const dates = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split("T")[0])
    }

    const dailyData: { [key: string]: DayData } = {}

    dates.forEach((date) => {
      dailyData[date] = { calories: 0, carbs: 0, protein: 0, fat: 0, date }
    })

    for (const date of dates) {
      const entriesRef = collection(db, "entries")
      const q = query(entriesRef, where("uid", "==", user.uid), where("date", "==", date))

      try {
        const snapshot = await getDocs(q)
        snapshot.forEach((doc) => {
          const data = doc.data()
          dailyData[date].calories += data.calories || 0
          dailyData[date].carbs += data.carbs || 0
          dailyData[date].protein += data.protein || 0
          dailyData[date].fat += data.fat || 0
        })
      } catch (error) {
        console.error(`Error fetching data for ${date}:`, error)
      }
    }

    const sortedData = Object.values(dailyData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    setWeekData(sortedData)
  }

  const fetchWeightData = async () => {
    if (!user) return

    const weightsRef = collection(db, "weights")
    const q = query(weightsRef, where("uid", "==", user.uid))

    try {
      const snapshot = await getDocs(q)
      const weights: WeightEntry[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        weights.push({
          weight: data.weight,
          date: data.timestamp.toDate().toISOString().split("T")[0],
        })
      })

      weights.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      setWeightData(weights.slice(-30))
    } catch (error) {
      console.error("Error fetching weight data:", error)
      setWeightData([])
    }
  }

  if (!user) {
    router.push("/")
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 header-gradient">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-sm">GT</span>
            </div>
            <h1 className="text-xl font-bold high-contrast-text">Analysen</h1>
          </div>
        </div>
      </header>

      {loading && (
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {!loading && (
        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Weekly Health Coach Summary */}
          <HealthCoachWeekly
            todayData={todayData}
            weekData={weekData}
            weightData={weightData}
            userProfile={userProfile}
          />

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <CalorieChart data={weekData} />
            <MacroChart data={weekData} />
          </div>

          <WeightChart data={weightData} />
        </main>
      )}
    </div>
  )
}
