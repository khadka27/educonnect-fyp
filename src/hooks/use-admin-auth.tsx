"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useAdmin } from "@/context/admin-context"

interface AdminAuthResponse {
  isAdmin: boolean
  user?: {
    id: string
    name: string
    email: string
    role: string
  }
  message?: string
}

export default function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { dispatch } = useAdmin()

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await axios.get<AdminAuthResponse>("/api/auth/check-admin")
        setIsAdmin(response.data.isAdmin)

        if (!response.data.isAdmin) {
          setError(response.data.message || "Unauthorized access")
          router.push("/login?callbackUrl=/admin")
        }
      } catch (err) {
        console.error("Admin auth check failed:", err)
        setError("Authentication failed. Please log in again.")
        router.push("/login?callbackUrl=/admin")
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [router, dispatch])

  return { isAdmin, isLoading, error }
}

