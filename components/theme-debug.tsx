"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeDebug() {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Nur auf Client-Seite rendern
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-background border border-border rounded-md p-2 text-xs z-50">
      <div>Aktuelles Theme: {theme}</div>
      <div>Aufgelöstes Theme: {resolvedTheme}</div>
    </div>
  )
}
