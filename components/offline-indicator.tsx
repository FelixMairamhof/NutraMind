"use client"

import { useAuth } from "@/context/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { WifiOff, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function OfflineIndicator() {
  const { isOffline } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)

  if (!isOffline) {
    return null
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    window.location.reload()
  }

  return (
    <Alert variant="destructive" className="fixed bottom-4 right-4 w-auto max-w-md z-50">
      <div className="flex items-start gap-4">
        <WifiOff className="h-4 w-4 mt-0.5" />
        <div className="flex-1">
          <AlertTitle>Offline-Modus</AlertTitle>
          <AlertDescription>
            Du bist derzeit offline. Bitte überprüfe deine Internetverbindung und versuche es erneut.
          </AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                Lade...
              </>
            ) : (
              <>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Jetzt aktualisieren
              </>
            )}
          </Button>
        </div>
      </div>
    </Alert>
  )
} 