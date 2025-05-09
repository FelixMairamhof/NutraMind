"use client"

import type React from "react"

import { useAuth } from "@/context/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isConfigured } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user && isConfigured) {
      // Speichere den aktuellen Pfad, um nach der Anmeldung zurückzukehren
      sessionStorage.setItem("redirectAfterLogin", pathname)
      router.push("/auth/login")
    }
  }, [user, loading, router, pathname, isConfigured])

  // Zeige Ladeindikator während der Authentifizierungsstatus geprüft wird
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  // Wenn Firebase nicht konfiguriert ist, zeige eine Warnung und erlaube den Zugriff im Demo-Modus
  if (!isConfigured) {
    return (
      <>
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Firebase-Konfiguration fehlt</AlertTitle>
          <AlertDescription>
            Die Firebase-Konfiguration wurde nicht gefunden. Die App wird im Demo-Modus mit Beispieldaten ausgeführt.
            Für vollständige Funktionalität, bitte die erforderlichen Umgebungsvariablen in der .env.local-Datei
            definieren.
          </AlertDescription>
        </Alert>
        {children}
      </>
    )
  }

  // Wenn der Benutzer angemeldet ist, zeige den Inhalt
  return user || !isConfigured ? <>{children}</> : null
}
