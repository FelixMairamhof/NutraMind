import { initializeApp } from "firebase/app"
import { Auth, getAuth } from "firebase/auth"
import { Firestore, getFirestore } from "firebase/firestore"

// Firebase-Konfiguration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Firebase initialisieren
let app = initializeApp(firebaseConfig)
let auth : Auth = getAuth(app)
let db : Firestore = getFirestore(app)

console.log("Firebase initialisiert:", !!auth, !!db)

export { auth, db }
