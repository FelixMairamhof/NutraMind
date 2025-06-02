import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/toaster"
import { OfflineIndicator } from "@/components/offline-indicator"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GreenTrack - Smart Health Tracking",
  description: "Track calories, macros, and weight with AI-powered insights",
  manifest: "/manifest.json",
  themeColor: "#00ff88",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
          <OfflineIndicator />
        </ThemeProvider>
      </body>
    </html>
  )
}
