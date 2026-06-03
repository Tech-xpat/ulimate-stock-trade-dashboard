"use client"

import { useState, useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { DashboardView } from "@/components/dashboard-view"
import { AuthPage } from "@/components/auth-page"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState("")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true)
        setUserId(user.uid)
      } else {
        setIsAuthenticated(false)
        setUserId("")
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      {isAuthenticated ? (
        <DashboardView userId={userId} />
      ) : (
        <AuthPage />
      )}
    </ThemeProvider>
  )
}
