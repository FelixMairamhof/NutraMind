import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { FoodEntry } from "@/types/nutramind"
import { Clock, Utensils } from "lucide-react"

interface FoodEntryCardProps {
  entry: FoodEntry
}

export function FoodEntryCard({ entry }: FoodEntryCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              <Utensils className="mr-2 h-4 w-4 text-emerald-600" />
              {entry.description.length > 40 ? `${entry.description.substring(0, 40)}...` : entry.description}
            </CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Clock className="mr-1 h-3 w-3" /> {entry.date}, {entry.time}
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            {entry.nutrients.calories} kcal
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
            <p className="text-xs text-gray-500 dark:text-gray-400">Protein</p>
            <p className="font-medium">{entry.nutrients.protein}g</p>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
            <p className="text-xs text-gray-500 dark:text-gray-400">Kohlenhydrate</p>
            <p className="font-medium">{entry.nutrients.carbs}g</p>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
            <p className="text-xs text-gray-500 dark:text-gray-400">Fett</p>
            <p className="font-medium">{entry.nutrients.fat}g</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400">{entry.analysis}</p>
      </CardContent>
    </Card>
  )
}
