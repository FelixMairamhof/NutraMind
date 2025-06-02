import { Timestamp } from "firebase/firestore"

// Konvertiert Firestore-Daten zu serialisierbaren Objekten
export function convertFirestoreData(data: any): any {
  if (!data) return data

  // Direkte Timestamp-Konvertierung
  if (data instanceof Timestamp) {
    return data.toDate()
  }

  // Timestamp-ähnliche Objekte (mit seconds und nanoseconds)
  if (data && typeof data === 'object' && 'seconds' in data && 'nanoseconds' in data) {
    return new Date(data.seconds * 1000 + data.nanoseconds / 1000000)
  }

  // Arrays
  if (Array.isArray(data)) {
    return data.map(convertFirestoreData)
  }

  // Objekte
  if (typeof data === 'object' && data !== null) {
    const converted: any = {}
    for (const [key, value] of Object.entries(data)) {
      converted[key] = convertFirestoreData(value)
    }
    return converted
  }

  return data
}

// Spezielle Konvertierung für User Profile
export function convertUserProfile(profile: any) {
  if (!profile) return null

  // Verwende die allgemeine Konvertierungsfunktion für alles
  return convertFirestoreData(profile)
} 