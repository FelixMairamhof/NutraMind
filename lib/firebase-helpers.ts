import { db } from './firebase';
import { collection, doc, getDoc, setDoc, getDocs, DocumentReference } from 'firebase/firestore';

/**
 * Prüft, ob ein Firestore-Fehler auf Netzwerkprobleme zurückzuführen ist
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message || String(error);
  return (
    errorMessage.includes('offline') ||
    errorMessage.includes('network') ||
    errorMessage.includes('failed to get document') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout')
  );
}

/**
 * Liest ein Dokument aus Firestore mit Wiederholungsversuchen
 */
export async function getDocumentWithRetry<T>(
  docRef: DocumentReference,
  maxRetries = 3,
  retryDelay = 2000
): Promise<T | null> {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      console.log(`Versuche Dokument zu laden (Versuch ${retries + 1}/${maxRetries})`, docRef.path);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as T;
      } else {
        console.log(`Dokument existiert nicht: ${docRef.path}`);
        return null;
      }
    } catch (error) {
      retries++;
      console.error(`Fehler beim Laden des Dokuments (Versuch ${retries}/${maxRetries}):`, error);
      
      if (isNetworkError(error)) {
        console.log(`Netzwerkfehler beim Laden, warte ${retryDelay/1000}s vor dem nächsten Versuch...`);
        // Wenn es sich um einen Netzwerkfehler handelt und weitere Versuche möglich sind, warten
        if (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
      }
      
      // Bei anderen Fehlern oder wenn keine Versuche mehr übrig sind, den Fehler weitergeben
      throw error;
    }
  }
  
  return null;
}

/**
 * Speichert ein Dokument in Firestore mit Wiederholungsversuchen
 */
export async function setDocumentWithRetry(
  docRef: DocumentReference,
  data: any,
  maxRetries = 3,
  retryDelay = 2000
): Promise<boolean> {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      console.log(`Versuche Dokument zu speichern (Versuch ${retries + 1}/${maxRetries})`, docRef.path);
      await setDoc(docRef, data);
      console.log(`Dokument erfolgreich gespeichert: ${docRef.path}`);
      return true;
    } catch (error) {
      retries++;
      console.error(`Fehler beim Speichern des Dokuments (Versuch ${retries}/${maxRetries}):`, error);
      
      if (isNetworkError(error)) {
        console.log(`Netzwerkfehler beim Speichern, warte ${retryDelay/1000}s vor dem nächsten Versuch...`);
        // Wenn es sich um einen Netzwerkfehler handelt und weitere Versuche möglich sind, warten
        if (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
      }
      
      // Bei anderen Fehlern oder wenn keine Versuche mehr übrig sind, den Fehler weitergeben
      throw error;
    }
  }
  
  return false;
} 