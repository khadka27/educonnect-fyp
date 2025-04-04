"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card"
import { Badge } from "src/components/ui/badge"
import { ArrowLeft, Edit, Trash, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useAdmin, adminActions } from "@/context/admin-context"
import { EditArticleDialog } from "src/components/admin/articles/edit-article-dialog"
import { DeleteArticleDialog } from "src/components/admin/articles/delete-article-dialog"

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
    id: string
    name: string
    email: string
  }
}

export default function ArticleDetailPage({ params }: { params: { id: string } }) {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const router = useRouter()
  const { dispatch } = useAdmin()

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)
        const response = await axios.get<Article>(`/api/admin/articles/${params.id}`)
        setArticle(response.data)
      } catch (error) {
        console.error("Error fetching article:", error)
        adminActions.addAlert(dispatch, "Failed to fetch article details", "error")
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [params.id, dispatch])

  const handleArticleUpdated = () => {
    setIsEditDialogOpen(false)
    adminActions.addAlert(dispatch, "Article updated successfully", "success")
    // Refresh the article data
    router.refresh()
  }

  const handleArticleDeleted = async () => {
    try {
      await axios.delete(`/api/admin/articles/${params.id}`)

      adminActions.addAlert(dispatch, "Article deleted successfully", "success")
      router.push("/admin/articles")
    } catch (error) {
      console.error("Error deleting article:", error)
      adminActions.addAlert(dispatch, "Failed to delete article", "error")
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Article not found</h1>
        <Button onClick={() => router.push("/admin/articles")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Articles
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/admin/articles")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Articles
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{article.title}</CardTitle>
            {article.category && <Badge>{article.category}</Badge>}
          </div>
          <div className="text-sm text-muted-foreground">
            By {article.createdBy.name} ({article.createdBy.email})
            <br />
            Created: {format(new Date(article.createdAt), "PPP p")}
            <br />
            {article.updatedAt !== article.createdAt && <>Updated: {format(new Date(article.updatedAt), "PPP p")}</>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {article.imageUrl && (
            <div className="overflow-hidden rounded-md">
              <img src={article.imageUrl || "/placeholder.svg"} alt={article.title} className="w-full object-cover" />
            </div>
          )}

          {article.abstract && <div className="rounded-md bg-muted p-4 italic">{article.abstract}</div>}

          <div className="prose max-w-none dark:prose-invert">
            {article.content.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      {article && (
        <>
          <EditArticleDialog
            article={article}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSuccess={handleArticleUpdated}
          />

          <DeleteArticleDialog
            article={article}
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onSuccess={handleArticleDeleted}
          />
        </>
      )}
    </div>
  )
}

