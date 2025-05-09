import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/context/auth-context"
import { NutraMindProvider } from "@/context/nutramind-context"
import { ThemeDebug } from "@/components/theme-debug"
import { OfflineIndicator } from "@/components/offline-indicator"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NutraMind - Personalisierte Ernährungsanalyse",
  description: "Optimiere deine Ernährung mit KI-gestützten Empfehlungen",
  manifest: "/manifest.json",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-512x512.png" />
        <meta name="theme-color" content="#10b981" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="nutramind-theme"
        >
          <AuthProvider>
            <NutraMindProvider>
              {children}
              <Toaster />
              <ThemeDebug />
              <OfflineIndicator />
            </NutraMindProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
