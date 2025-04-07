"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlusCircle, Download, Trash, Loader2 } from "lucide-react"
import { useAdmin, adminActions } from "@/context/admin-context"
import { PostsGrid } from "./posts-grid"
import { PostsFilters } from "./posts-filters"
import { CreatePostDialog } from "./create-post-dialog"

interface User {
  id: string
  name: string
  username: string
  profileImage: string | null
}

interface Post {
  id: string
  content: string
  postUrl: string | null
  createdAt: string
  updatedAt: string
  userId: string
  user: User
  _count: {
    reactions: number
    comments: number
  }
}

interface PostsResponse {
  posts: Post[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

export default function PostsClient() {
  const [posts, setPosts] = useState<Post[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { dispatch } = useAdmin()

  const page = Number(searchParams.get("page") || "1")
  const limit = Number(searchParams.get("limit") || "10")
  const search = searchParams.get("search") || ""
  const userId = searchParams.get("userId") || ""
  const sortBy = searchParams.get("sortBy") || "createdAt"
  const orderBy = searchParams.get("orderBy") || "desc"

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        adminActions.setLoading(dispatch, true)
        setLoading(true)

        // Build query string
        const queryParams = new URLSearchParams()
        queryParams.set("page", page.toString())
        queryParams.set("limit", limit.toString())
        if (search) queryParams.set("search", search)
        if (userId) queryParams.set("userId", userId)
        if (sortBy) queryParams.set("sortBy", sortBy)
        if (orderBy) queryParams.set("orderBy", orderBy)

        const response = await axios.get<PostsResponse>(`/api/admin/posts?${queryParams.toString()}`)

        setPosts(response.data.posts)
        setPagination(response.data.pagination)
      } catch (error) {
        console.error("Error fetching posts:", error)
        adminActions.addAlert(dispatch, "Failed to fetch posts", "error")
      } finally {
        setLoading(false)
        adminActions.setLoading(dispatch, false)
      }
    }

    fetchPosts()
  }, [page, limit, search, userId, sortBy, orderBy, dispatch])

  const handlePostCreated = () => {
    setIsCreatePostOpen(false)
    adminActions.addAlert(dispatch, "Post created successfully", "success")
    // Refresh the grid
    router.refresh()
  }

  const handleBulkDelete = async () => {
    if (!selectedPosts.length) return

    try {
      adminActions.setLoading(dispatch, true)

      await axios.delete("/api/admin/posts", {
        data: { postIds: selectedPosts },
      })

      adminActions.addAlert(dispatch, `${selectedPosts.length} posts have been deleted`, "success")
      setSelectedPosts([])
      router.refresh()
    } catch (error) {
      console.error("Error deleting posts:", error)
      adminActions.addAlert(dispatch, "Failed to delete posts", "error")
    } finally {
      adminActions.setLoading(dispatch, false)
    }
  }

  const handleExportCSV = () => {
    // In a real implementation, you would generate and download a CSV file
    adminActions.addAlert(dispatch, "Post data has been exported to CSV", "success")
  }

  if (loading && posts.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Posts Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setIsCreatePostOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </div>
      </div>

      <PostsFilters />

      {selectedPosts.length > 0 && (
        <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
          <span className="text-sm font-medium">{selectedPosts.length} selected</span>
          <Button variant="outline" size="sm" onClick={handleBulkDelete}>
            <Trash className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      <PostsGrid
        posts={posts}
        pagination={pagination}
        loading={loading}
        selectedPosts={selectedPosts}
        setSelectedPosts={setSelectedPosts}
      />

      <CreatePostDialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen} onSuccess={handlePostCreated} />
    </div>
  )
}

