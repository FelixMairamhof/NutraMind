"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AddWeightModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddWeightModal({ open, onOpenChange, onSuccess }: AddWeightModalProps) {
  const { user } = useAuth()
  const [weight, setWeight] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !weight) return

    setLoading(true)
    try {
      await addDoc(collection(db, "weights"), {
        uid: user.uid,
        weight: Number.parseFloat(weight),
        timestamp: new Date(),
        date: new Date().toISOString().split("T")[0],
      })

      setWeight("")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error adding weight:", error)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md card-gradient glow-border">
        <DialogHeader>
          <DialogTitle className="text-xl high-contrast-text">Gewicht Eintragen</DialogTitle>
          <DialogDescription>Zeichne dein aktuelles Gewicht auf</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weight" className="high-contrast-text">
              Gewicht (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="70.0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
              className="glow-border"
            />
          </div>

          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={loading || !weight}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80"
            >
              {loading ? "Speichern..." : "Gewicht Speichern"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
