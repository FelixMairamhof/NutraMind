"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Eye, Trash2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { doc, deleteDoc } from "firebase/firestore"

interface MealItemProps {
  id: string
  food: string
  description?: string
  calories: number
  protein: number
  carbs: number
  fat: number
  timestamp: Date
  onDelete: () => void
}

export function MealItem({ id, food, description, calories, protein, carbs, fat, timestamp, onDelete }: MealItemProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteDoc(doc(db, "entries", id))
      onDelete()
    } catch (error) {
      console.error("Error deleting meal:", error)
    }
    setDeleting(false)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("de-DE", {
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    })
  }

  return (
    <>
      <Card className="cursor-pointer hover:bg-white/5 transition-colors glow-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1" onClick={() => setShowDetails(true)}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-foreground line-clamp-1 high-contrast-text">{food}</h3>
                <span className="text-sm text-muted-foreground">{formatTime(timestamp)}</span>
              </div>
              {description && <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{description}</p>}
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>{calories} kcal</span>
                <span>{protein}g Protein</span>
                <span>{carbs}g Kohlenhydrate</span>
                <span>{fat}g Fett</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button variant="ghost" size="icon" onClick={() => setShowDetails(true)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={deleting}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-md card-gradient glow-border">
          <DialogHeader>
            <DialogTitle className="high-contrast-text">{food}</DialogTitle>
            <DialogDescription>Mahlzeit Details - {formatTime(timestamp)}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {description && (
              <div>
                <h4 className="font-medium mb-2 high-contrast-text">Beschreibung</h4>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium mb-3 high-contrast-text">Nährwerte</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="text-2xl font-bold text-primary">{calories}</div>
                  <div className="text-xs text-muted-foreground">Kalorien</div>
                </div>
                <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-500">{protein}g</div>
                  <div className="text-xs text-muted-foreground">Protein</div>
                </div>
                <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="text-2xl font-bold text-green-500">{carbs}g</div>
                  <div className="text-xs text-muted-foreground">Kohlenhydrate</div>
                </div>
                <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <div className="text-2xl font-bold text-orange-500">{fat}g</div>
                  <div className="text-xs text-muted-foreground">Fett</div>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowDetails(false)} className="flex-1">
                Schließen
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDelete()
                  setShowDetails(false)
                }}
                disabled={deleting}
                className="flex-1"
              >
                {deleting ? "Löschen..." : "Löschen"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
