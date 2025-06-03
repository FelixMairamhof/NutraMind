# GreenTrack - Smart Health Tracking
![Dashboard](/.cursor/context/image.png)
GreenTrack is a comprehensive health and nutrition tracking application built with Next.js that helps users monitor their daily calorie intake, macronutrients, weight, and receive AI-powered health insights.

## ✨ Features

### 🍎 Nutrition Tracking
- **Smart Food Logging**: Add meals and track calories, carbs, protein, and fat
- **AI-Powered Analysis**: Get nutritional insights powered by Groq AI
- **Daily Goals**: Set and track personalized daily nutrition targets
- **Macro Breakdown**: Detailed visualization of macronutrient distribution

### 📊 Health Analytics
- **Weight Tracking**: Monitor weight changes over time
- **Progress Visualization**: Interactive charts showing nutrition trends
- **Daily Health Coach**: AI-powered daily recommendations and insights
- **Goal Achievement**: Track progress toward your health and fitness goals

### 👤 User Management
- **Firebase Authentication**: Secure user accounts with email/password
- **User Profiles**: Personalized settings and health information
- **Onboarding Flow**: Guided setup for new users
- **Data Persistence**: All data securely stored in Firestore

### 🎨 Modern UI/UX
- **Dark Theme**: Eye-friendly dark interface
- **Responsive Design**: Works seamlessly on desktop and mobile
- **PWA Support**: Install as a Progressive Web App
- **Offline Indicator**: Shows connection status
- **Modern Components**: Built with Radix UI and Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS + Radix UI components
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI Integration**: Groq API for nutritional analysis
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **Package Manager**: pnpm

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- pnpm (recommended) or npm
- Firebase project with Firestore and Authentication enabled
- Groq API key for AI features

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd nutra_mind
   ```

2. **Navigate to the project directory**
   ```bash
   cd nutra_mind
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

4. **Set up environment variables** (see Environment Variables section below)

5. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Firebase Configuration
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### AI Integration
```env
GROQ_API_KEY=your_groq_api_key
```

### How to get these values:

#### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Authentication** and configure Sign-in methods (Email/Password)
4. Enable **Firestore Database** in production mode
5. Go to **Project Settings** → **General** → **Your apps**
6. Add a web app and copy the config values

#### Groq API Key
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up/login and create an API key
3. Use this key for the `GROQ_API_KEY` environment variable

## 📝 Available Scripts

- `pnpm dev` - Start development server with Turbo mode
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint to check code quality

## 🏗️ Project Structure

```
nutra_mind/
├── app/                    # Next.js App Router pages
│   ├── analytics/         # Analytics dashboard page
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components (Radix + Tailwind)
│   ├── auth-provider.tsx # Authentication context
│   ├── dashboard.tsx     # Main dashboard component
│   └── ...               # Other feature components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
│   ├── firebase.ts       # Firebase configuration
│   ├── actions.ts        # Server actions
│   └── ...              # Other utilities
├── public/               # Static assets
└── styles/               # Additional styling files
```

## 🎯 Key Features Explained

### User Flow
1. **Authentication**: Users sign up/login via Firebase Auth
2. **Onboarding**: New users complete profile setup with health goals
3. **Dashboard**: Main interface showing daily nutrition summary
4. **Food Logging**: Add meals with AI-powered nutritional analysis
5. **Analytics**: View progress charts and historical data
6. **Health Coach**: Receive daily AI-powered recommendations

### Data Models
- **Users**: Profile information, goals, preferences
- **Entries**: Daily food/meal entries with nutritional data
- **Weights**: Weight tracking entries over time

## 🔧 Configuration

### Firebase Security Rules
Make sure your Firestore rules allow authenticated users to read/write their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
    }
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📱 PWA Support

The app supports Progressive Web App features:
- Install on mobile devices
- Offline functionality indicators
- App-like experience on mobile

## 🔒 Security Notes

- All environment variables with `NEXT_PUBLIC_` prefix are exposed to the client
- Firebase API keys are safe to expose as they're protected by Firebase Security Rules
- Groq API key is server-side only and not exposed to the client

## 📄 License

This project is private and proprietary.

---

**Built with ❤️ using Next.js, Firebase, and modern web technologies.** 