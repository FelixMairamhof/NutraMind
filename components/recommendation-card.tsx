import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Recommendation } from "@/types/nutramind"
import { ArrowRight, Brain, Lightbulb } from "lucide-react"

interface RecommendationCardProps {
  recommendation: Recommendation
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center">
            {recommendation.type === "food" ? (
              <Lightbulb className="mr-2 h-5 w-5 text-emerald-600" />
            ) : (
              <Brain className="mr-2 h-5 w-5 text-emerald-600" />
            )}
            {recommendation.title}
          </CardTitle>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            {recommendation.goalId === "muscle-building"
              ? "Muskelaufbau"
              : recommendation.goalId === "skin-health"
                ? "Hautgesundheit"
                : recommendation.goalId === "longevity"
                  ? "Langlebigkeit"
                  : recommendation.goalId === "energy"
                    ? "Energie"
                    : recommendation.goalId === "gut-health"
                      ? "Darmgesundheit"
                      : "Gewichtsmanagement"}
          </Badge>
        </div>
        <CardDescription>{recommendation.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 dark:text-gray-300 mb-4">{recommendation.description}</p>

        {recommendation.type === "food" && recommendation.foods && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Empfohlene Lebensmittel:</h4>
            <div className="flex flex-wrap gap-2">
              {recommendation.foods.map((food, index) => (
                <Badge key={index} variant="secondary" className="bg-gray-100 dark:bg-gray-800">
                  {food}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {recommendation.type === "recipe" && recommendation.recipe && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Zutaten:</h4>
            <ul className="text-sm space-y-1 list-disc pl-5">
              {recommendation.recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant="link"
          className="p-0 h-auto text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400"
        >
          Mehr erfahren <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  )
}
