"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { isNetworkError, getDocumentWithRetry, setDocumentWithRetry } from "@/lib/firebase-helpers"

type UserProfile = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  goals?: string[]
}

type AuthContextType = {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  isConfigured: boolean
  isOffline: boolean
  authError: string | null
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isConfigured, setIsConfigured] = useState(true)
  const [isOffline, setIsOffline] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const router = useRouter()

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log("Browser meldet Online-Status")
      setIsOffline(false)
    }
    const handleOffline = () => {
      console.log("Browser meldet Offline-Status")
      setIsOffline(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check initial status
    setIsOffline(!navigator.onLine)
    console.log("Initialer Online-Status:", navigator.onLine)

    // Regelmäßig den Online-Status überprüfen und bei Bedarf zurücksetzen
    const intervalId = setInterval(() => {
      if (navigator.onLine && isOffline) {
        console.log("Status-Check: Browser ist online, setze isOffline zurück")
        setIsOffline(false)
      }
    }, 5000)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(intervalId)
    }
  }, [isOffline])

  // Prüfe, ob Firebase konfiguriert ist
  useEffect(() => {
    if (!auth) {
      setIsConfigured(false)
      setLoading(false)
    }
  }, [])

  // Benutzer-Profil aus Firestore laden
  const fetchUserProfile = async (user: User) => {
    if (!db) return null

    try {
      // If offline, use basic profile from auth user
      if (isOffline) {
        const offlineProfile: UserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          goals: [],
        }
        setUserProfile(offlineProfile)
        console.log("Using offline user profile")
        return
      }

      const userDocRef = doc(db, "users", user.uid)
      
      try {
        // Versuche das Dokument mit der Retry-Funktion zu laden
        const userData = await getDocumentWithRetry<UserProfile>(userDocRef);
        
        if (userData) {
          console.log("Benutzerprofil erfolgreich geladen");
          setUserProfile(userData);
        } else {
          console.log("Benutzerprofil existiert nicht, erstelle ein neues")
          // Erstelle ein neues Profil, wenn keines existiert
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            goals: [],
          }

          // Versuche das Dokument mit der Retry-Funktion zu speichern
          const saved = await setDocumentWithRetry(userDocRef, newProfile);
          
          if (saved) {
            console.log("Neues Benutzerprofil erfolgreich erstellt");
          } else {
            console.warn("Benutzerprofil konnte nicht gespeichert werden, verwende lokales Profil");
          }
          
          setUserProfile(newProfile)
        }
      } catch (error) {
        console.error("Fehler beim Zugriff auf Firestore:", error)
        
        // Prüfe, ob es sich um einen Netzwerkfehler handelt
        const isOfflineError = isNetworkError(error);
        
        if (isOfflineError && navigator.onLine) {
          console.warn("Firebase meldet Netzwerkprobleme, obwohl der Browser online ist");
        }
        
        // Wenn der Browser sagt, dass wir offline sind, zeige offline-Meldung
        if (!navigator.onLine || isOfflineError) {
          setIsOffline(true)
          console.log("Auf Offline-Modus umgeschaltet wegen Netzwerkfehler");
          
          const offlineProfile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            goals: [],
          }
          setUserProfile(offlineProfile)
        } else {
          // Bei anderen Fehlern verwende ein lokales Profil
          console.log("Verwende lokales Profil nach Fehler");
          
          const fallbackProfile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            goals: [],
          }
          setUserProfile(fallbackProfile)
        }
      }
    } catch (error) {
      console.error("Allgemeiner Fehler beim Laden des Benutzerprofils:", error)
      
      // Fallback-Profil erstellen
      const fallbackProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        goals: [],
      }
      setUserProfile(fallbackProfile)
    }
  }

  // Auth-Status überwachen
  useEffect(() => {
    if (!auth) {
      return
    }

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        (authUser) => {
          setUser(authUser)

          if (authUser) {
            fetchUserProfile(authUser)
          } else {
            setUserProfile(null)
          }

          setLoading(false)
        },
        (error) => {
          console.error("Auth state change error:", error)
          setAuthError(error.message)
          setLoading(false)
        },
      )

      return () => unsubscribe()
    } catch (error: any) {
      console.error("Error setting up auth state listener:", error)
      setAuthError(error.message)
      setLoading(false)
      return () => {}
    }
  }, [isOffline])

  // Registrierung
  const signUp = async (email: string, password: string, name: string) => {
    if (!auth || !db) {
      throw new Error("Firebase ist nicht konfiguriert")
    }

    if (isOffline) {
      throw new Error("Registrierung ist im Offline-Modus nicht möglich")
    }

    try {
      setLoading(true)
      setAuthError(null)

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Displayname setzen
      await updateProfile(userCredential.user, {
        displayName: name,
      })

      // Benutzerprofil in Firestore erstellen
      const newProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: name,
        photoURL: null,
        goals: [],
      }

      await setDoc(doc(db, "users", userCredential.user.uid), newProfile)
      setUserProfile(newProfile)

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Fehler bei der Registrierung:", error)

      // Spezifische Fehlerbehandlung für auth/configuration-not-found
      if (error.code === "auth/configuration-not-found") {
        setAuthError(
          "Firebase Authentication ist nicht korrekt konfiguriert. Bitte aktiviere die E-Mail/Passwort-Authentifizierung in der Firebase Console.",
        )
      } else {
        setAuthError(error.message)
      }

      throw error
    } finally {
      setLoading(false)
    }
  }

  // Anmeldung
  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Firebase ist nicht konfiguriert")
    }

    if (isOffline) {
      throw new Error("Anmeldung ist im Offline-Modus nicht möglich")
    }

    try {
      setLoading(true)
      setAuthError(null)

      await signInWithEmailAndPassword(auth, email, password)
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Fehler bei der Anmeldung:", error)

      // Spezifische Fehlerbehandlung für auth/configuration-not-found
      if (error.code === "auth/configuration-not-found") {
        setAuthError(
          "Firebase Authentication ist nicht korrekt konfiguriert. Bitte aktiviere die E-Mail/Passwort-Authentifizierung in der Firebase Console.",
        )
      } else {
        setAuthError(error.message)
      }

      throw error
    } finally {
      setLoading(false)
    }
  }

  // Abmeldung
  const signOut = async () => {
    if (!auth) {
      throw new Error("Firebase ist nicht konfiguriert")
    }

    try {
      setAuthError(null)
      await firebaseSignOut(auth)
      router.push("/")
    } catch (error: any) {
      console.error("Fehler bei der Abmeldung:", error)
      setAuthError(error.message)
      throw error
    }
  }

  // Passwort zurücksetzen
  const resetPassword = async (email: string) => {
    if (!auth) {
      throw new Error("Firebase ist nicht konfiguriert")
    }

    if (isOffline) {
      throw new Error("Passwort-Zurücksetzen ist im Offline-Modus nicht möglich")
    }

    try {
      setAuthError(null)
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      console.error("Fehler beim Zurücksetzen des Passworts:", error)

      // Spezifische Fehlerbehandlung für auth/configuration-not-found
      if (error.code === "auth/configuration-not-found") {
        setAuthError(
          "Firebase Authentication ist nicht korrekt konfiguriert. Bitte aktiviere die E-Mail/Passwort-Authentifizierung in der Firebase Console.",
        )
      } else {
        setAuthError(error.message)
      }

      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isConfigured,
        isOffline,
        authError,
        signUp,
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
