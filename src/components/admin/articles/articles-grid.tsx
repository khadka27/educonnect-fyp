"use client"

import { useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Card, CardContent, CardFooter } from "src/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "src/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu"
import { ChevronLeft, ChevronRight, MoreHorizontal, Edit, Trash, Eye, FileText } from "lucide-react"
import { format } from "date-fns"
import { EditArticleDialog } from "./edit-article-dialog"
import { DeleteArticleDialog } from "./delete-article-dialog"
import { useAdmin, adminActions } from "@/context/admin-context"
import axios from "axios"

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

interface PaginationData {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

interface ArticlesGridProps {
  articles: Article[]
  pagination: PaginationData
  loading: boolean
}

export function ArticlesGrid({ articles, pagination, loading }: ArticlesGridProps) {
  const [articleToEdit, setArticleToEdit] = useState<Article | null>(null)
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { dispatch } = useAdmin()

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleArticleUpdated = () => {
    setArticleToEdit(null)
    adminActions.addAlert(dispatch, "Article updated successfully", "success")
    router.refresh()
  }

  const handleArticleDeleted = async () => {
    if (!articleToDelete) return

    try {
      adminActions.setLoading(dispatch, true)
      await axios.delete(`/api/admin/articles/${articleToDelete.id}`)

      setArticleToDelete(null)
      adminActions.addAlert(dispatch, "Article deleted successfully", "success")
      router.refresh()
    } catch (error) {
      console.error("Error deleting article:", error)
      adminActions.addAlert(dispatch, "Failed to delete article", "error")
    } finally {
      adminActions.setLoading(dispatch, false)
    }
  }

  const handleViewArticle = (articleId: string) => {
    router.push(`/admin/articles/${articleId}`)
  }

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return ""
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <div className="space-y-4">
      {loading && articles.length === 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: pagination.itemsPerPage }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video w-full animate-pulse bg-muted"></div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted"></div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <div className="h-9 w-full animate-pulse rounded bg-muted"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <h3 className="text-lg font-medium">No articles found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Card key={article.id} className="overflow-hidden flex flex-col">
              <div className="relative aspect-video w-full overflow-hidden">
                {article.imageUrl ? (
                  <img
                    src={article.imageUrl || "/placeholder.svg"}
                    alt={article.title}
                    className="h-full w-full object-cover transition-all hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <FileText className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                {article.category && <Badge className="absolute right-2 top-2">{article.category}</Badge>}
              </div>
              <CardContent className="p-4 flex-grow">
                <h3 className="font-semibold line-clamp-1">{article.title}</h3>
                {article.abstract && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                    {truncateText(article.abstract, 150)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  By {article.createdBy.name} on {format(new Date(article.createdAt), "MMM d, yyyy")}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <div className="flex w-full justify-between">
                  <Button variant="outline" size="sm" onClick={() => handleViewArticle(article.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setArticleToEdit(article)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setArticleToDelete(article)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-
          {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>

      {articleToEdit && (
        <EditArticleDialog
          article={articleToEdit}
          open={!!articleToEdit}
          onOpenChange={() => setArticleToEdit(null)}
          onSuccess={handleArticleUpdated}
        />
      )}

      {articleToDelete && (
        <DeleteArticleDialog
          article={articleToDelete}
          open={!!articleToDelete}
          onOpenChange={() => setArticleToDelete(null)}
          onSuccess={handleArticleDeleted}
        />
      )}
    </div>
  )
}

