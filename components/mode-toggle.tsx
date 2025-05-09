"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Farbmodus wechseln">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Farbmodus wechseln</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Hell {theme === "light" && "✓"}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dunkel {theme === "dark" && "✓"}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System {theme === "system" && "✓"}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
