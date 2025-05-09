"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { Brain, Menu, Home, Target, Utensils, Activity, LogOut, User, Settings } from "lucide-react"

export function Navbar() {
  const { user, userProfile, signOut } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const routes = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/track", label: "Mahlzeit erfassen", icon: Utensils },
    { href: "/goals", label: "Ziele", icon: Target },
    { href: "/symptoms", label: "Symptome", icon: Activity },
  ]

  const getInitials = () => {
    if (userProfile?.displayName) {
      return userProfile.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    }
    return "NU"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader className="mb-4">
                <SheetTitle className="flex items-center">
                  <Brain className="h-6 w-6 text-emerald-600 mr-2" />
                  NutraMind
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2">
                {routes.map((route) => {
                  const Icon = route.icon
                  const isActive = pathname === route.href
                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                        isActive
                          ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-50"
                          : "hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {route.label}
                    </Link>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <span className="text-lg font-bold hidden sm:inline-block">NutraMind</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {routes.map((route) => {
              const Icon = route.icon
              const isActive = pathname === route.href
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-50"
                      : "hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {route.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userProfile?.photoURL || undefined} alt={userProfile?.displayName || "Benutzer"} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mein Konto</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Einstellungen
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="flex items-center cursor-pointer text-red-600 dark:text-red-400"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Abmelden
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
