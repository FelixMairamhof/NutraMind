"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Settings, Save, AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/context/auth-context"
import { doc, deleteDoc, collection, getDocs } from "firebase/firestore"
import { deleteUser } from "firebase/auth"
import { db } from "@/lib/firebase"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

  const [settings, setSettings] = useState({
    emailNotifications: true,
    darkMode: false,
    dataSharing: true,
    autoAnalysis: true,
  })

  const [isDeleting, setIsDeleting] = useState(false)

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }))
  }

  const saveSettings = () => {
    // Hier würden die Einstellungen in Firestore gespeichert werden
    toast({
      title: "Einstellungen gespeichert",
      description: "Deine Einstellungen wurden erfolgreich aktualisiert.",
    })
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    setIsDeleting(true)

    try {
      // Lösche alle Benutzerdaten aus Firestore
      const collections = ["foodEntries", "goals", "symptoms", "recommendations"]

      for (const collectionName of collections) {
        const collectionRef = collection(db, "users", user.uid, collectionName)
        const snapshot = await getDocs(collectionRef)

        const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref))
        await Promise.all(deletePromises)
      }

      // Lösche das Benutzerdokument
      await deleteDoc(doc(db, "users", user.uid))

      // Lösche den Benutzer aus Firebase Auth
      await deleteUser(user)

      toast({
        title: "Konto gelöscht",
        description: "Dein Konto und alle zugehörigen Daten wurden gelöscht.",
      })

      router.push("/")
    } catch (error) {
      console.error("Fehler beim Löschen des Kontos:", error)
      toast({
        title: "Fehler",
        description:
          "Beim Löschen deines Kontos ist ein Fehler aufgetreten. Bitte melde dich erneut an und versuche es noch einmal.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center mb-6">
        <Settings className="h-6 w-6 text-emerald-600 mr-2" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Einstellungen</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Benachrichtigungen</CardTitle>
          <CardDescription>Verwalte deine Benachrichtigungseinstellungen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">E-Mail-Benachrichtigungen</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Erhalte Benachrichtigungen per E-Mail</p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={() => handleToggle("emailNotifications")}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Datenschutz</CardTitle>
          <CardDescription>Verwalte deine Datenschutzeinstellungen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="data-sharing">Datenfreigabe</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Erlaube NutraMind, anonymisierte Daten zur Verbesserung des Dienstes zu verwenden
              </p>
            </div>
            <Switch
              id="data-sharing"
              checked={settings.dataSharing}
              onCheckedChange={() => handleToggle("dataSharing")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-analysis">Automatische Analyse</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Automatisch Mahlzeiten analysieren und Empfehlungen generieren
              </p>
            </div>
            <Switch
              id="auto-analysis"
              checked={settings.autoAnalysis}
              onCheckedChange={() => handleToggle("autoAnalysis")}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={saveSettings} className="bg-emerald-600 hover:bg-emerald-700 ml-auto">
            <Save className="mr-2 h-4 w-4" /> Einstellungen speichern
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Gefahrenzone</CardTitle>
          <CardDescription>Aktionen in diesem Bereich können nicht rückgängig gemacht werden</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <AlertTriangle className="mr-2 h-4 w-4" /> Konto löschen
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Bist du sicher?</AlertDialogTitle>
                <AlertDialogDescription>
                  Diese Aktion kann nicht rückgängig gemacht werden. Dein Konto und alle zugehörigen Daten werden
                  dauerhaft gelöscht.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Lösche..." : "Konto löschen"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </main>
  )
}
