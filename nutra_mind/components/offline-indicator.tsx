"use client"

import { useEffect, useState } from "react"
import { WifiOff } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast({
        title: "You're back online",
        description: "Your changes will now be saved to the cloud.",
        variant: "success",
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast({
        title: "You're offline",
        description: "Some features may be limited until you reconnect.",
        variant: "destructive",
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Set initial state
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-destructive text-destructive-foreground z-50 py-1 px-4 flex items-center justify-center gap-2">
      <WifiOff className="h-4 w-4" />
      <span className="text-sm font-medium">You're offline. Some features may be limited.</span>
    </div>
  )
}
