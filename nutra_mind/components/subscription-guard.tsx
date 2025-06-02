"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PayPalCheckout } from "@/components/paypal-checkout"
import { Crown, Check } from "lucide-react"

interface SubscriptionGuardProps {
  children: React.ReactNode
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { user } = useAuth()
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)

  useEffect(() => {
    checkSubscription()
  }, [user])

  const checkSubscription = async () => {
    if (!user) return

    setLoading(true)
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        const status = userData.subscriptionStatus
        const endDate = userData.subscriptionEndDate?.toDate()

        // Check if subscription is active and not expired
        if (status === "active" && endDate && endDate > new Date()) {
          setSubscriptionStatus("active")
        } else {
          setSubscriptionStatus("inactive")
        }
      } else {
        setSubscriptionStatus("inactive")
      }
    } catch (error) {
      console.error("Error checking subscription:", error)
      setSubscriptionStatus("inactive")
    }
    setLoading(false)
  }

  const handlePaymentSuccess = () => {
    setSubscriptionStatus("active")
    setShowPayment(false)
  }

  const handlePaymentError = (error: any) => {
    console.error("Payment error:", error)
    // You could show a toast notification here
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Überprüfe Abonnement...</p>
        </div>
      </div>
    )
  }

  if (subscriptionStatus === "active") {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md card-gradient glow-border">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-8 w-8 text-yellow-500 mr-2" />
            <h1 className="text-2xl font-bold high-contrast-text">GreenTrack Premium</h1>
          </div>
          <CardTitle className="high-contrast-text">Upgrade zu Premium</CardTitle>
          <CardDescription>Schalte alle Funktionen frei und erhalte personalisierte KI-Empfehlungen</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!showPayment ? (
            <>
              <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-4 rounded-lg border border-primary/30">
                <h4 className="font-semibold text-primary mb-3">Premium Funktionen:</h4>
                <ul className="space-y-2">
                  {[
                    "KI-gestützte Ernährungsanalyse",
                    "Personalisierte Gesundheitsempfehlungen",
                    "Erweiterte Analysen und Trends",
                    "Unbegrenzte Mahlzeitenverfolgung",
                    "Gewichtsverfolgung",
                    "Premium Support",
                    "Offline-Funktionalität",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-primary">9,99€</div>
                <div className="text-sm text-muted-foreground">pro Monat</div>
                <div className="text-xs text-muted-foreground mt-1">Jederzeit kündbar</div>
              </div>

              <Button
                onClick={() => setShowPayment(true)}
                className="w-full bg-gradient-to-r from-primary to-primary/80"
                size="lg"
              >
                Jetzt Premium werden
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Sichere Zahlung über PayPal. Keine versteckten Kosten.
              </p>
            </>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center high-contrast-text">Zahlung abschließen</h3>
              <PayPalCheckout onSuccess={handlePaymentSuccess} onError={handlePaymentError} />
              <Button variant="outline" onClick={() => setShowPayment(false)} className="w-full">
                Zurück
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
