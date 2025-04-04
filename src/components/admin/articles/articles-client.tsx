/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2 } from "lucide-react"
import { useAdmin, adminActions } from "@/context/admin-context"
import { ArticlesGrid } from "./articles-grid"
import { ArticlesFilters } from "./articles-filters"
import { CreateArticleDialog } from "./create-article-dialog"

interface Article {
  id: string
  title: string
  abstract: string | null
  content: string
  category: string | null
  imageUrl: string | null
  createdAt: string
  updatedAt: string
  userId: string
  createdBy: {
    name: string
    email: string
  }
}

interface ArticlesResponse {
  articles: Article[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

export default function ArticlesClient() {
  const [articles, setArticles] = useState<Article[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })
  const [isCreateArticleOpen, setIsCreateArticleOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { dispatch } = useAdmin()

  const page = Number(searchParams.get("page") || "1")
  const limit = Number(searchParams.get("limit") || "10")
  const search = searchParams.get("search") || ""
  const category = searchParams.get("category") || ""

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        adminActions.setLoading(dispatch, true)
        setLoading(true)

        // Build query string
        const queryParams = new URLSearchParams()
        queryParams.set("page", page.toString())
        queryParams.set("limit", limit.toString())
        if (search) queryParams.set("search", search)
        if (category && category !== "ALL") queryParams.set("category", category)

        const response = await axios.get<ArticlesResponse>(`/api/admin/articles?${queryParams.toString()}`)

        setArticles(response.data.articles)
        setPagination(response.data.pagination)
      } catch (error) {
        console.error("Error fetching articles:", error)
        adminActions.addAlert(dispatch, "Failed to fetch articles", "error")
      } finally {
        setLoading(false)
        adminActions.setLoading(dispatch, false)
      }
    }

    fetchArticles()
  }, [page, limit, search, category, dispatch])

  const handleArticleCreated = () => {
    setIsCreateArticleOpen(false)
    adminActions.addAlert(dispatch, "Article created successfully", "success")
    // Refresh the grid
    router.refresh()
  }

  if (loading && articles.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Articles Management</h1>
        <Button onClick={() => setIsCreateArticleOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Article
        </Button>
      </div>

      <ArticlesFilters />

      <ArticlesGrid articles={articles} pagination={pagination} loading={loading} />

      <CreateArticleDialog
        open={isCreateArticleOpen}
        onOpenChange={setIsCreateArticleOpen}
        onSuccess={handleArticleCreated}
      />
    </div>
  )
}

