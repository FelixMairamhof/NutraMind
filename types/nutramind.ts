// Food entry type
export interface FoodEntry {
  id: string
  description: string
  time: string
  date: string
  nutrients: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  analysis: string
  timestamp?: Date
}

// Goal type
export interface Goal {
  id: string
  name: string
  priority?: number
  progress: number
  analysis?: string
}

// Recommendation type
export interface Recommendation {
  id: string
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
}

// Symptom entry type
export interface SymptomEntry {
  id: string
  date: string
  categories: {
    [key: string]: string
  }
  notes?: string
  timestamp?: Date
}

// User profile type
export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  goals?: string[]
  settings?: {
    emailNotifications: boolean
    darkMode: boolean
    dataSharing: boolean
    autoAnalysis: boolean
  }
}
