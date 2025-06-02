"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function ExportData() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Fetch food entries
      const entriesRef = collection(db, "entries")
      const entriesQuery = query(entriesRef, where("uid", "==", user.uid))
      const entriesSnapshot = await getDocs(entriesQuery)
      const entries = entriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate().toISOString(),
      }))

      // Fetch weight entries
      const weightsRef = collection(db, "weights")
      const weightsQuery = query(weightsRef, where("uid", "==", user.uid))
      const weightsSnapshot = await getDocs(weightsQuery)
      const weights = weightsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate().toISOString(),
      }))

      // Fetch user profile
      const userProfile = {
        email: user.email,
        uid: user.uid,
      }

      // Combine all data
      const exportData = {
        profile: userProfile,
        entries,
        weights,
        exportDate: new Date().toISOString(),
      }

      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

      const exportFileDefaultName = `greentrack-data-${new Date().toISOString().split("T")[0]}.json`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()

      toast({
        title: "Data Exported Successfully",
        description: "Your health data has been downloaded as a JSON file.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  return (
    <Button onClick={handleExport} disabled={loading} variant="outline" size="sm" className="flex items-center gap-2">
      <Download className="h-4 w-4" />
      {loading ? "Exporting..." : "Export Data"}
    </Button>
  )
}
