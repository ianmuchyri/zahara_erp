"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export interface User {
  id: number
  email: string
  name: string
  role: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem("access_token")
    const userStr = localStorage.getItem("user")

    if (token && userStr) {
      try {
        setUser(JSON.parse(userStr))
      } catch (error) {
        console.error("Failed to parse user data:", error)
        logout()
      }
    }
    setLoading(false)
  }

  const login = (token: string, refreshToken: string, userData: User) => {
    localStorage.setItem("access_token", token)
    localStorage.setItem("refresh_token", refreshToken)
    localStorage.setItem("user", JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/login")
  }

  return { user, loading, login, logout, checkAuth }
}

export function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token")
  }
  return null
}

export function isAuthenticated() {
  return !!getToken()
}
