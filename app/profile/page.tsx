"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import { updateProfile } from "firebase/auth"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Loader2, User } from "lucide-react"

export default function ProfilePage() {
  const { user, userProfile } = useAuth()
  const { toast } = useToast()
  const [displayName, setDisplayName] = useState(userProfile?.displayName || "")
  const [isUpdating, setIsUpdating] = useState(false)

  const getInitials = () => {
    if (userProfile?.displayName) {
      return userProfile.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    }
    return "NU"
  }

  const handleUpdateProfile = async () => {
    if (!user) return

    if (!displayName.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte gib einen Namen ein.",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)

    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: displayName,
      })

      // Update Firestore user document
      const userDocRef = doc(db, "users", user.uid)
      await updateDoc(userDocRef, {
        displayName: displayName,
      })

      toast({
        title: "Profil aktualisiert",
        description: "Dein Profil wurde erfolgreich aktualisiert.",
      })
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Profils:", error)
      toast({
        title: "Fehler",
        description: "Beim Aktualisieren deines Profils ist ein Fehler aufgetreten.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center mb-6">
        <User className="h-6 w-6 text-emerald-600 mr-2" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mein Profil</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={userProfile?.photoURL || undefined} alt={userProfile?.displayName || "Benutzer"} />
              <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <CardTitle>{userProfile?.displayName || "Benutzer"}</CardTitle>
            <CardDescription>{userProfile?.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isUpdating}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input id="email" value={userProfile?.email || ""} disabled className="bg-gray-50 dark:bg-gray-800" />
            <p className="text-xs text-gray-500">Die E-Mail-Adresse kann nicht geändert werden.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleUpdateProfile}
            disabled={isUpdating || displayName === userProfile?.displayName}
            className="bg-emerald-600 hover:bg-emerald-700 ml-auto"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aktualisiere...
              </>
            ) : (
              "Profil aktualisieren"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Konto-Informationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600 dark:text-gray-400">Konto erstellt</span>
            <span>
              {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString("de-DE") : "-"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600 dark:text-gray-400">Letzte Anmeldung</span>
            <span>
              {user?.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString("de-DE") : "-"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600 dark:text-gray-400">E-Mail verifiziert</span>
            <span>{user?.emailVerified ? "Ja" : "Nein"}</span>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
