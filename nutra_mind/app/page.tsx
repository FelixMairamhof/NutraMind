"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Dashboard } from "@/components/dashboard"
import { AuthPage } from "@/components/auth-page"
import { Onboarding } from "@/components/onboarding"
import { LoadingSpinner } from "@/components/loading-spinner"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { convertUserProfile } from "@/lib/firestore-utils"

export default function Home() {
  const { user, loading } = useAuth()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserProfile()
    } else {
      setProfileLoading(false)
    }
  }, [user])

  const fetchUserProfile = async () => {
    if (!user || !db) return

    setProfileLoading(true)
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
    setProfileLoading(false)
  }

  const handleOnboardingComplete = () => {
    fetchUserProfile()
  }

  if (loading || profileLoading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <AuthPage />
  }

  // Check if user needs onboarding
  if (!userProfile?.onboardingCompleted) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  // Show dashboard directly (subscription check removed for now)
  return <Dashboard />
}
