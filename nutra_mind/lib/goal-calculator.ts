// Calculate daily nutrition goals based on user profile with metric units
export function calculateDailyGoals(userProfile: any) {
  if (!userProfile) {
    return {
      calorieGoal: 2000,
      proteinGoal: 150,
      carbGoal: 250,
      fatGoal: 65,
    }
  }

  const { height, weight, age, sex, activity, goals = [] } = userProfile

  // If missing basic info, return defaults
  if (!height || !weight || !age || !sex) {
    return {
      calorieGoal: 2000,
      proteinGoal: 150,
      carbGoal: 250,
      fatGoal: 65,
    }
  }

  // Calculate BMR using Mifflin-St Jeor Equation
  // BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5 (for men) or -161 (for women)
  const weightKg = weight // Already in kg
  const heightCm = height // Already in cm
  const sexModifier = sex === "male" ? 5 : -161
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + sexModifier

  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    extreme: 1.9,
  }

  const activityMultiplier = activityMultipliers[activity as keyof typeof activityMultipliers] || 1.55
  let tdee = bmr * activityMultiplier

  // Adjust based on goals
  if (goals.includes("diet")) {
    tdee *= 0.85 // 15% deficit for weight loss
  } else if (goals.includes("muscle")) {
    tdee *= 1.1 // 10% surplus for muscle building
  }

  const calorieGoal = Math.round(tdee)

  // Calculate macros based on goals and sex
  let proteinRatio = 0.25 // 25% of calories from protein
  let fatRatio = 0.25 // 25% of calories from fat
  let carbRatio = 0.5 // 50% of calories from carbs

  // Adjust protein needs based on sex (men typically need slightly more)
  if (sex === "male") {
    proteinRatio += 0.02
  }

  if (goals.includes("muscle")) {
    proteinRatio = sex === "male" ? 0.32 : 0.28 // Higher protein for muscle building
    fatRatio = 0.2
    carbRatio = 0.5
  } else if (goals.includes("diet")) {
    proteinRatio = sex === "male" ? 0.32 : 0.28 // Higher protein for satiety
    fatRatio = 0.25
    carbRatio = 0.45
  } else if (goals.includes("acne")) {
    proteinRatio = 0.25
    fatRatio = 0.3 // Higher healthy fats
    carbRatio = 0.45 // Lower carbs
  }

  const proteinGoal = Math.round((calorieGoal * proteinRatio) / 4) // 4 calories per gram
  const fatGoal = Math.round((calorieGoal * fatRatio) / 9) // 9 calories per gram
  const carbGoal = Math.round((calorieGoal * carbRatio) / 4) // 4 calories per gram

  return {
    calorieGoal,
    proteinGoal,
    carbGoal,
    fatGoal,
  }
}
