"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddFoodModal } from "@/components/add-food-modal"
import { AddWeightModal } from "@/components/add-weight-modal"
import { ProfileModal } from "@/components/profile-modal"
import { MealsList } from "@/components/meals-list"
import { ProgressBar } from "@/components/progress-bar"
import { HealthCoachDaily } from "@/components/health-coach-daily"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Plus, User, LogOut, Scale, BarChart3 } from "lucide-react"
import { PWARegister } from "@/components/pwa-register"
import { useRouter } from "next/navigation"
import { calculateDailyGoals } from "@/lib/goal-calculator"
import { convertUserProfile } from "@/lib/firestore-utils"

interface DayData {
  calories: number
  carbs: number
  protein: number
  fat: number
  date: string
}

export function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [todayData, setTodayData] = useState<DayData>({ calories: 0, carbs: 0, protein: 0, fat: 0, date: "" })
  const [showAddFood, setShowAddFood] = useState(false)
  const [showAddWeight, setShowAddWeight] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      setLoading(true)
      Promise.all([fetchTodayData(), fetchUserProfile()]).finally(() => {
        setLoading(false)
      })
    }
  }, [user])

  const fetchUserProfile = async () => {
    if (!user || !db) return

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (userDoc.exists()) {
        // Konvertiere Firestore Timestamps zu JavaScript Dates
        const rawProfile = userDoc.data()
        const convertedProfile = convertUserProfile(rawProfile)
        setUserProfile(convertedProfile)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
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

  const handleSignOut = () => {
    signOut(auth)
  }

  const refreshData = () => {
    fetchTodayData()
  }

  // Calculate goals based on user profile
  const { calorieGoal, proteinGoal, carbGoal, fatGoal } = calculateDailyGoals(userProfile)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 header-gradient">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-sm">GT</span>
            </div>
            <h1 className="text-xl font-bold high-contrast-text">GreenTrack</h1>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/analytics")} className="hover:bg-white/10">
              <BarChart3 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowProfile(true)} className="hover:bg-white/10">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="hover:bg-white/10">
              <LogOut className="h-5 w-5" />
            </Button>
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
          {/* Today's Summary */}
          <Card className="card-gradient glow-border">
            <CardHeader>
              <CardTitle className="high-contrast-text">Tagesübersicht</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString("de-DE", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Calories Progress */}
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary high-contrast-text">{todayData.calories}</div>
                  <div className="text-sm text-muted-foreground">Kalorien konsumiert</div>
                </div>
                <ProgressBar
                  value={todayData.calories}
                  max={calorieGoal}
                  label="Tägliches Kalorienziel"
                  color="primary"
                />
              </div>

              {/* Macros Progress */}
              <div className="space-y-4">
                <h3 className="font-semibold text-center high-contrast-text">Makronährstoffe</h3>
                <div className="space-y-3">
                  <ProgressBar value={todayData.protein} max={proteinGoal} label="Protein" unit="g" color="blue" />
                  <ProgressBar value={todayData.carbs} max={carbGoal} label="Kohlenhydrate" unit="g" color="green" />
                  <ProgressBar value={todayData.fat} max={fatGoal} label="Fett" unit="g" color="orange" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Health Coach */}
          <HealthCoachDaily
            todayData={todayData}
            userProfile={userProfile}
            calorieGoal={calorieGoal}
            proteinGoal={proteinGoal}
            carbGoal={carbGoal}
            fatGoal={fatGoal}
          />

          {/* Meals List */}
          <MealsList onMealDeleted={refreshData} />
        </main>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
        <Button
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg floating-button bg-gradient-to-r from-blue-500 to-blue-600"
          onClick={() => setShowAddWeight(true)}
        >
          <Scale className="h-6 w-6" />
        </Button>
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg floating-button bg-gradient-to-r from-primary to-primary/80"
          onClick={() => setShowAddFood(true)}
        >
          <Plus className="h-7 w-7" />
        </Button>
      </div>

      {/* Modals */}
      <AddFoodModal open={showAddFood} onOpenChange={setShowAddFood} onSuccess={refreshData} />
      <AddWeightModal open={showAddWeight} onOpenChange={setShowAddWeight} onSuccess={refreshData} />
      <ProfileModal
        open={showProfile}
        onOpenChange={setShowProfile}
        userProfile={userProfile}
        onSuccess={fetchUserProfile}
      />
      <PWARegister />
    </div>
  )
}
