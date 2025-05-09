import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useNutraMind } from "@/context/nutramind-context"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Utensils } from "lucide-react"

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

interface NutritionSummaryCardProps {
  detailed?: boolean
}

export function NutritionSummaryCard({ detailed = false }: NutritionSummaryCardProps) {
  const { foodEntries } = useNutraMind()

  // Calculate total nutrients
  const totalNutrients = foodEntries.reduce(
    (acc, entry) => {
      acc.calories += entry.nutrients.calories
      acc.protein += entry.nutrients.protein
      acc.carbs += entry.nutrients.carbs
      acc.fat += entry.nutrients.fat
      return acc
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )

  // Chart data
  const chartData = {
    labels: ["Protein", "Kohlenhydrate", "Fett"],
    datasets: [
      {
        data: [totalNutrients.protein * 4, totalNutrients.carbs * 4, totalNutrients.fat * 9],
        backgroundColor: ["#10b981", "#60a5fa", "#f59e0b"],
        borderColor: ["#059669", "#3b82f6", "#d97706"],
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    plugins: {
      legend: {
        position: "right" as const,
      },
    },
    cutout: "70%",
    maintainAspectRatio: false,
  }

  if (foodEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Utensils className="mr-2 h-5 w-5 text-emerald-600" />
            Nährstoffübersicht
          </CardTitle>
          <CardDescription>Keine Daten verfügbar</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-gray-500 dark:text-gray-400">
            Erfasse deine Mahlzeiten, um eine Nährstoffübersicht zu erhalten
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Utensils className="mr-2 h-5 w-5 text-emerald-600" />
          Nährstoffübersicht
        </CardTitle>
        <CardDescription>Zusammenfassung deiner heutigen Ernährung</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Kalorien</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalNutrients.calories}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">kcal</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Protein</p>
                <p className="text-2xl font-bold text-emerald-600">{totalNutrients.protein}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">g</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Kohlenhydrate</p>
                <p className="text-2xl font-bold text-blue-500">{totalNutrients.carbs}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">g</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Fett</p>
                <p className="text-2xl font-bold text-amber-500">{totalNutrients.fat}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">g</p>
              </div>
            </div>

            {detailed && (
              <div className="space-y-2 mt-2">
                <h3 className="font-medium">Makronährstoffverteilung</h3>
                <div className="flex justify-between text-sm">
                  <span>Protein: {Math.round(((totalNutrients.protein * 4) / totalNutrients.calories) * 100)}%</span>
                  <span>
                    Kohlenhydrate: {Math.round(((totalNutrients.carbs * 4) / totalNutrients.calories) * 100)}%
                  </span>
                  <span>Fett: {Math.round(((totalNutrients.fat * 9) / totalNutrients.calories) * 100)}%</span>
                </div>
              </div>
            )}
          </div>

          <div className="h-[200px] flex items-center justify-center">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        </div>

        {detailed && (
          <div className="mt-6">
            <h3 className="font-medium mb-3">Analyse</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Deine heutige Ernährung ist ausgewogen mit einem guten Proteinanteil, der dein Ziel zum Muskelaufbau
              unterstützt. Der Kohlenhydratanteil ist moderat und liefert dir ausreichend Energie für den Tag. Für eine
              optimale Hautgesundheit könntest du mehr Omega-3-Fettsäuren und Antioxidantien zu dir nehmen.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
