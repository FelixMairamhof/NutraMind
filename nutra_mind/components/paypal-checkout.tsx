"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"

interface PayPalCheckoutProps {
  onSuccess: () => void
  onError: (error: any) => void
}

declare global {
  interface Window {
    paypal: any
  }
}

export function PayPalCheckout({ onSuccess, onError }: PayPalCheckoutProps) {
  const { user } = useAuth()
  const paypalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load PayPal SDK
    const script = document.createElement("script")
    script.src = "https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=EUR"
    script.async = true
    script.onload = () => {
      if (window.paypal && paypalRef.current) {
        window.paypal
          .Buttons({
            createOrder: (data: any, actions: any) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: "9.99",
                      currency_code: "EUR",
                    },
                    description: "GreenTrack Premium - Monatliches Abonnement",
                  },
                ],
              })
            },
            onApprove: async (data: any, actions: any) => {
              try {
                const order = await actions.order.capture()
                console.log("Payment successful:", order)

                // Update user's subscription status in Firebase
                if (user) {
                  await updateDoc(doc(db, "users", user.uid), {
                    subscriptionStatus: "active",
                    subscriptionId: order.id,
                    subscriptionStartDate: new Date(),
                    subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                    paymentMethod: "paypal",
                    updatedAt: new Date(),
                  })
                }

                onSuccess()
              } catch (error) {
                console.error("Payment processing error:", error)
                onError(error)
              }
            },
            onError: (err: any) => {
              console.error("PayPal error:", err)
              onError(err)
            },
            style: {
              layout: "vertical",
              color: "blue",
              shape: "rect",
              label: "paypal",
            },
          })
          .render(paypalRef.current)
      }
    }
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [user, onSuccess, onError])

  return <div ref={paypalRef} className="w-full"></div>
}
