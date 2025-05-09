import { generateText } from "ai"
import { groq, createGroq } from "@ai-sdk/groq"

// Types for AI responses
export interface NutritionAnalysis {
  calories: number
  protein: number
  carbs: number
  fat: number
  analysis: string
}

export interface RecommendationResponse {
  recommendations: Array<{
    type: "food" | "recipe" | "insight"
    goalId: string
    title: string
    subtitle: string
    description: string
    foods?: string[]
    recipe?: {
      ingredients: string[]
      instructions: string
    }
  }>
}

export interface SymptomAnalysisResponse {
  analysis: string
  possibleCauses: string[]
  recommendations: string[]
}

// AI Service class
export class AIService {
  private model
  private apiKey: string | undefined

  constructor() {
    // Get the API key from environment variables
    this.apiKey = process.env.GROQ_API_KEY || undefined

    // Initialize the model with explicit API key
    this.model = groq("llama3-70b-8192")
  }

  // Check if API key is available
  private checkApiKey(): boolean {
    if (!this.apiKey) {
      console.error("Groq API key is missing. Make sure GROQ_API_KEY environment variable is set.")
      return false
    }
    return true
  }

  // Analyze food entry and return nutrition information
  async analyzeFoodEntry(description: string): Promise<NutritionAnalysis> {
    try {
      // Check if API key is available
      if (!this.checkApiKey()) {
        // Return fallback values if API key is missing
        return this.getFallbackNutritionAnalysis(description)
      }

      const prompt = `
        As a nutrition expert, analyze the following food description and provide detailed nutritional information.
        Food description: "${description}"
        
        Return a JSON object with the following structure:
        {
          "calories": number (estimated calories),
          "protein": number (grams of protein),
          "carbs": number (grams of carbohydrates),
          "fat": number (grams of fat),
          "analysis": string (brief analysis of the nutritional value and health benefits)
        }
        
        Be realistic with your estimates and provide a thoughtful analysis.
      `

      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0.2,
        maxTokens: 1000,
      })

      // Parse the JSON response
      return JSON.parse(text) as NutritionAnalysis
    } catch (error) {
      console.error("Error analyzing food entry:", error)
      // Return fallback values if analysis fails
      return this.getFallbackNutritionAnalysis(description)
    }
  }

  // Generate personalized recommendations based on goals and food entries
  async generateRecommendations(
    goals: Array<{ id: string; name: string; priority: number }>,
    foodEntries: Array<{ description: string; nutrients: any }>,
    symptoms?: Array<{ categories: Record<string, string>; notes?: string }>,
  ): Promise<RecommendationResponse> {
    try {
      // Check if API key is available
      if (!this.checkApiKey()) {
        // Return fallback recommendations if API key is missing
        return this.getFallbackRecommendations(goals)
      }

      const prompt = `
        As a nutrition and health AI assistant, generate personalized recommendations based on the following information:
        
        User's Goals:
        ${goals.map((goal) => `- ${goal.name} (Priority: ${goal.priority}/100)`).join("\n")}
        
        Recent Food Entries:
        ${foodEntries.map((entry) => `- ${entry.description}`).join("\n")}
        
        ${
          symptoms && symptoms.length > 0
            ? `Recent Symptoms:
        ${symptoms
          .map(
            (symptom) =>
              `- Categories: ${Object.entries(symptom.categories)
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ")}${symptom.notes ? `\n  Notes: ${symptom.notes}` : ""}`,
          )
          .join("\n")}`
            : ""
        }
        
        Generate 4 personalized recommendations that will help the user achieve their goals.
        Each recommendation should be one of these types: "food", "recipe", or "insight".
        
        Return a JSON object with the following structure:
        {
          "recommendations": [
            {
              "type": "food" | "recipe" | "insight",
              "goalId": string (matching one of the user's goal IDs),
              "title": string (short, catchy title),
              "subtitle": string (brief subtitle),
              "description": string (detailed explanation),
              "foods": string[] (only for type "food", list of recommended foods),
              "recipe": {
                "ingredients": string[] (only for type "recipe", list of ingredients),
                "instructions": string (only for type "recipe", cooking instructions)
              }
            }
            // ... more recommendations
          ]
        }
        
        Make the recommendations specific, actionable, and tailored to the user's goals and food habits.
      `

      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0.7,
        maxTokens: 2000,
      })

      // Parse the JSON response
      return JSON.parse(text) as RecommendationResponse
    } catch (error) {
      console.error("Error generating recommendations:", error)
      // Return fallback recommendations if generation fails
      return this.getFallbackRecommendations(goals)
    }
  }

  // Analyze symptoms and provide insights
  async analyzeSymptoms(
    symptoms: Array<{ categories: Record<string, string>; notes?: string }>,
    foodEntries: Array<{ description: string; date: string }>,
  ): Promise<SymptomAnalysisResponse> {
    try {
      // Check if API key is available
      if (!this.checkApiKey()) {
        // Return fallback analysis if API key is missing
        return this.getFallbackSymptomAnalysis()
      }

      const prompt = `
        As a health and nutrition AI assistant, analyze the following symptoms and recent food entries to identify potential connections:
        
        Symptoms:
        ${symptoms
          .map(
            (symptom) =>
              `- Categories: ${Object.entries(symptom.categories)
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ")}${symptom.notes ? `\n  Notes: ${symptom.notes}` : ""}`,
          )
          .join("\n")}
        
        Recent Food Entries:
        ${foodEntries.map((entry) => `- ${entry.date}: ${entry.description}`).join("\n")}
        
        Provide an analysis of the symptoms, potential causes related to nutrition, and recommendations.
        
        Return a JSON object with the following structure:
        {
          "analysis": string (detailed analysis of the symptoms),
          "possibleCauses": string[] (list of potential food-related causes),
          "recommendations": string[] (list of dietary recommendations)
        }
      `

      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0.3,
        maxTokens: 1500,
      })

      // Parse the JSON response
      return JSON.parse(text) as SymptomAnalysisResponse
    } catch (error) {
      console.error("Error analyzing symptoms:", error)
      // Return fallback analysis if analysis fails
      return this.getFallbackSymptomAnalysis()
    }
  }

  // Transcribe speech to text (simulated for now)
  async transcribeSpeech(audioBlob: Blob): Promise<string> {
    // In a real implementation, you would send the audio to a speech-to-text service
    // For now, we'll simulate a successful transcription
    console.log("Transcribing speech (simulated)...")

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Return a simulated transcription
    return "Heute habe ich zum Frühstück Haferflocken mit Banane und Honig gegessen."
  }

  // Fallback methods for when the API is unavailable
  private getFallbackNutritionAnalysis(description: string): NutritionAnalysis {
    console.log("Using fallback nutrition analysis for:", description)

    // Generate somewhat realistic values based on the food description
    let calories = 350
    let protein = 15
    let carbs = 40
    let fat = 10

    // Adjust values based on keywords in the description
    const lowerDesc = description.toLowerCase()

    if (
      lowerDesc.includes("protein") ||
      lowerDesc.includes("fleisch") ||
      lowerDesc.includes("huhn") ||
      lowerDesc.includes("fisch") ||
      lowerDesc.includes("ei")
    ) {
      protein += 15
      calories += 50
    }

    if (lowerDesc.includes("salat") || lowerDesc.includes("gemüse")) {
      calories -= 100
      carbs -= 10
      fat -= 5
    }

    if (lowerDesc.includes("öl") || lowerDesc.includes("butter") || lowerDesc.includes("sahne")) {
      fat += 10
      calories += 90
    }

    if (lowerDesc.includes("pasta") || lowerDesc.includes("reis") || lowerDesc.includes("brot")) {
      carbs += 20
      calories += 100
    }

    // Ensure values are within reasonable ranges
    protein = Math.max(5, Math.min(50, protein))
    carbs = Math.max(5, Math.min(100, carbs))
    fat = Math.max(2, Math.min(50, fat))
    calories = Math.max(100, Math.min(800, calories))

    return {
      calories,
      protein,
      carbs,
      fat,
      analysis: `Diese Mahlzeit enthält schätzungsweise ${calories} Kalorien mit ${protein}g Protein, ${carbs}g Kohlenhydraten und ${fat}g Fett. Für eine genauere Analyse wird die Groq API benötigt.`,
    }
  }

  private getFallbackRecommendations(
    goals: Array<{ id: string; name: string; priority: number }>,
  ): RecommendationResponse {
    return {
      recommendations: [
        {
          type: "food",
          goalId: goals[0]?.id || "muscle-building",
          title: "Proteinreiche Lebensmittel",
          subtitle: "Für optimalen Muskelaufbau",
          description:
            "Um dein Ziel zum Muskelaufbau zu unterstützen, solltest du diese proteinreichen Lebensmittel in deinen Ernährungsplan integrieren. Sie liefern hochwertige Proteine mit allen essentiellen Aminosäuren.",
          foods: ["Hühnerbrust", "Thunfisch", "Magerquark", "Eier", "Linsen", "Tofu"],
        },
        {
          type: "recipe",
          goalId: goals[1]?.id || "skin-health",
          title: "Omega-3-reicher Lachs-Bowl",
          subtitle: "Für strahlende Haut",
          description:
            "Diese Mahlzeit ist reich an Omega-3-Fettsäuren und Antioxidantien, die Entzündungen reduzieren und deine Hautgesundheit fördern können.",
          recipe: {
            ingredients: [
              "150g Wildlachs",
              "1 Tasse Quinoa",
              "1 Avocado",
              "Handvoll Spinat",
              "1 EL Olivenöl",
              "Zitronensaft",
            ],
            instructions:
              "Lachs im Ofen garen, Quinoa kochen, alle Zutaten in einer Bowl anrichten und mit Olivenöl und Zitronensaft beträufeln.",
          },
        },
      ],
    }
  }

  private getFallbackSymptomAnalysis(): SymptomAnalysisResponse {
    return {
      analysis:
        "Basierend auf deinen Symptomen und Ernährungsgewohnheiten könnte es Zusammenhänge geben, die weitere Untersuchung verdienen. Für eine genauere Analyse wird die Groq API benötigt.",
      possibleCauses: [
        "Mögliche Unverträglichkeit gegenüber bestimmten Lebensmitteln",
        "Zu hoher Konsum von verarbeiteten Lebensmitteln",
        "Unzureichende Flüssigkeitszufuhr",
      ],
      recommendations: [
        "Führe ein Ernährungstagebuch, um Zusammenhänge besser zu erkennen",
        "Erhöhe deine Wasseraufnahme auf mindestens 2 Liter pro Tag",
        "Versuche, mehr Vollwertkost und weniger verarbeitete Lebensmittel zu essen",
      ],
    }
  }
}

// Create and export a singleton instance
export const aiService = new AIService()
