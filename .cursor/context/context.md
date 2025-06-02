# GreenTrack – Calorie & Macro Tracking PWA

GreenTrack is a **dark-themed progressive web app (PWA)** built with **Next.js**, **Firebase**, **Tailwind CSS**, and **shadcn/ui**. The app empowers users to track food, macros, calories, and weight trends while receiving smart, daily summaries. Designed for minimal input and maximum health insight.

---

## 🔧 Tech Stack

- **Framework:** Next.js (App Router)
- **Authentication & Database:** Firebase (Auth + Firestore)
- **Styling:** Tailwind CSS (dark mode with green accents)
- **UI Components:** shadcn/ui
- **Charts:** `recharts` or `chart.js`
- **PWA Support:** `next-pwa` or custom service worker
- **Hosting:** Firebase Hosting or Vercel

---

## 🎯 Core Features

### 1. **Authentication**
- Firebase email/password auth
- Sign up, login, logout
- User profile data stored in Firestore

### 2. **Dashboard**
- Summary at top:
  - ✅ Total Calories Consumed (large text)
  - ✅ Macronutrients (Carbs, Protein, Fat)
  - ✅ Line charts showing:
    - Calorie intake trend (7-day)
    - Protein intake trend
    - Weight trend (daily entries)
- Bottom section:
  - ✅ **Health Coach Summary** (AI-style insight)
    - Highlights trends and offers simple advice, e.g.:
      > "You're under your protein goal the past 3 days. Try adding a protein-rich snack."
      > "Weight is stable. Great job!"

### 3. **Add Food**
- Floating action button (FAB, bottom-right)
- Modal input: `"Text field (e.g. 'rice and chicken')"`
- Parses food input (manual or with API)
- Logs:
  - Estimated calories
  - Carbs, protein, fat
  - Timestamp

### 4. **Track Weight**
- User can log weight daily
- Input: FAB or separate "Add Weight" section
- Display:
  - Line chart of weight over time
  - Show weight delta

### 5. **Profile Settings**
- Accessible from top-right profile icon
- Form includes:
  - Height
  - Weight
  - Age
  - Activity level (dropdown)
  - Goal:
    - Muscle Building
    - Dieting
    - Longevity
    - Acne Control
- Used to calculate personalized daily calorie & macro targets

---

## ✅ Step-by-Step Build Plan

### Step 1: Initial Setup
- [ ] Initialize Next.js App Router project
- [ ] Add Tailwind CSS
- [ ] Install and configure shadcn/ui
- [ ] Set up Firebase (Auth + Firestore)
- [ ] Configure PWA (manifest + SW)

### Step 2: Auth & Firebase Integration
- [ ] Email/password login/signup
- [ ] Onboard new users and store profile in `/users/{uid}`
- [ ] AuthGuard for protected routes

### Step 3: Profile Page
- [ ] `/profile` route
- [ ] Inputs for user data
- [ ] Save/update in Firestore
- [ ] Logic for daily calorie & macro goal based on user profile

### Step 4: Dashboard (Main UI)
- [ ] Display today's total calories + macro breakdown
- [ ] Fetch and show:
  - 7-day line charts for:
    - Calories
    - Protein
    - Weight
- [ ] Show daily Health Coach Summary (basic rule-based logic first)
- [ ] Style with shadcn components + Tailwind dark mode

### Step 5: Add Food Modal
- [ ] Floating Action Button (FAB)
- [ ] Modal or drawer with text input
- [ ] Log food entry to Firestore with nutrition data

### Step 6: Weight Tracking
- [ ] Daily weight input (FAB or section on dashboard)
- [ ] Save weight to Firestore with timestamp
- [ ] Display 7-day weight trend (line chart)

### Step 7: Health Coach Summary
- [ ] Read today's totals and past trends
- [ ] Generate short, helpful message (rule-based to start)
- [ ] Optionally expand to use AI service later

### Step 8: Final Polish
- [ ] Responsive UI (mobile-first)
- [ ] PWA support (offline, installable)
- [ ] Add favicon, manifest, and app icons
- [ ] Deploy (Firebase Hosting or Vercel)

---

## 📁 Firestore Data Structure

```plaintext
/users/{uid}
  - email
  - height
  - weight
  - age
  - activity
  - goal
  - createdAt

/entries/{entryId}
  - uid
  - food: "chicken rice"
  - calories: 450
  - carbs: 40
  - protein: 35
  - fat: 12
  - timestamp

/weights/{entryId}
  - uid
  - weight: 74.3
  - timestamp

```

## 📊 Charts
    Use recharts (or chart.js) for the following:

    Line chart: Calories (7 days)

    Line chart: Protein (7 days)

    Line chart: Weight (7 days)

## 🌙 Theme & Design Specs
    Element	Style
    Background	#121212 (dark)
    Primary Accent	#00ff88 (green)
    Text Color	#ffffff
    Font	Sans-serif (rounded, clean)
    UI	Rounded corners, shadows
    Charts	Bright green / white lines
    Buttons	shadcn Button (green theme)

Let’s build a smart, beautiful daily health tracker ✨