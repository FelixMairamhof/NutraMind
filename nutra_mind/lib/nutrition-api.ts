import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"

// Initialize GROQ client with API key
const groqClient = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

interface NutritionData {
  calories: number
  protein: number
  carbs: number
  fat: number
  description: string
}

export async function analyzeFood(foodText: string, userGoals: string[] = []): Promise<NutritionData | null> {
  try {
    const goalsContext = userGoals.length > 0 ? `User goals: ${userGoals.join(", ")}` : ""

    const prompt = `Analyze this food: "${foodText}"

${goalsContext}

Provide a JSON response with:
1. Estimated nutrition per typical serving (calories, protein in grams, carbs in grams, fat in grams)
2. A health description (2-3 sentences) that considers the user's goals if provided

Focus on:
- Accurate nutrition estimates for a standard serving
- Health benefits/concerns relevant to the user's goals
- Practical advice (e.g., "good for muscle building" or "may trigger acne in sensitive individuals")

Return only valid JSON in this format:
{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "description": "health description here"
}`

    const { text } = await generateText({
      model: groqClient("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.3,
    })

    // Parse the JSON response
    const cleanedText = text.trim().replace(/```json\n?|\n?```/g, "")
    const nutritionData = JSON.parse(cleanedText)

    // Validate the response structure
    if (
      typeof nutritionData.calories === "number" &&
      typeof nutritionData.protein === "number" &&
      typeof nutritionData.carbs === "number" &&
      typeof nutritionData.fat === "number" &&
      typeof nutritionData.description === "string"
    ) {
      return nutritionData
    }

    return null
  } catch (error) {
    console.error("Error analyzing food with GROQ:", error)
    return null
  }
}

export async function generateHealthInsight(
  todayData: { calories: number; protein: number; carbs: number; fat: number },
  weekData: Array<{ calories: number; protein: number; date: string }>,
  userProfile: any,
  isWeekly = false,
): Promise<string> {
  try {
    const goals = userProfile?.goals || []
    const timeframe = isWeekly ? "this week" : "today"
    const dataContext = isWeekly
      ? `Weekly average: ${Math.round(weekData.reduce((sum, day) => sum + day.calories, 0) / weekData.length)} calories`
      : `Today's intake: ${todayData.calories} calories, ${todayData.protein}g protein, ${todayData.carbs}g carbs, ${todayData.fat}g fat`

    const prompt = `Generate a personalized health insight for a user with these goals: ${goals.join(", ")}

User profile:
- Age: ${userProfile?.age || "not specified"}
- Activity level: ${userProfile?.activity || "moderate"}
- Goals: ${goals.join(", ")}

Nutrition data ${timeframe}:
${dataContext}

Provide a single, actionable health insight (1-2 sentences) that:
1. Is encouraging and positive
2. Gives specific, practical advice
3. Considers their goals (muscle building, weight loss, acne control, etc.)
4. References their current nutrition patterns

Examples:
- "Your protein intake is excellent for muscle building! Consider adding some complex carbs post-workout for better recovery."
- "Great calorie control today for your weight loss goals. Adding more fiber-rich vegetables could help you feel more satisfied."
- "Your low-carb approach aligns well with acne management. Try incorporating more omega-3 rich foods like salmon for additional skin benefits."

Return only the insight text, no JSON or formatting.`

    const { text } = await generateText({
      model: groqClient("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.7,
    })

    return text.trim()
  } catch (error) {
    console.error("Error generating health insight:", error)
    return "Keep up the great work with your nutrition tracking! Consistency is key to reaching your health goals."
  }
}

export async function suggestFoods(partialText: string): Promise<string[]> {
  try {
    const prompt = `Suggest 5 common foods that match or contain: "${partialText}"

Return only a JSON array of food names, like:
["apple", "banana", "chicken breast", "rice", "broccoli"]

Focus on:
- Common, recognizable foods
- Foods that partially match the input
- Variety in food types (proteins, carbs, vegetables, etc.)

Return only the JSON array, no other text.`

    const { text } = await generateText({
      model: groqClient("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.5,
    })

    const cleanedText = text.trim().replace(/```json\n?|\n?```/g, "")
    const suggestions = JSON.parse(cleanedText)

    if (Array.isArray(suggestions)) {
      return suggestions.slice(0, 5)
    }

    return []
  } catch (error) {
    console.error("Error getting food suggestions:", error)
    return []
  }
}
