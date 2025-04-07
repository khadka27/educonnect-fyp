"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "src/components/ui/tabs"
import { ArrowLeft, Edit, Trash, Loader2, Heart, MessageSquare, User, MoreHorizontal } from "lucide-react"
import { format } from "date-fns"
import { useAdmin, adminActions } from "@/context/admin-context"
import { EditPostDialog } from "src/components/admin/posts/edit-post-dialog"
import { DeletePostDialog } from "src/components/admin/posts/delete-post-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar"
import { Badge } from "src/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "src/components/ui/dropdown-menu"

interface UserType {
  id: string
  name: string
  username: string
  profileImage: string | null
  email?: string
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: UserType
}

interface Reaction {
  id: string
  type: string
  user: UserType
}

interface Save {
  id: string
  createdAt: string
  user: UserType
}

interface Post {
  id: string
  content: string
  postUrl: string | null
  createdAt: string
  updatedAt: string
  userId: string
  user: UserType
  comments: Comment[]
  reactions: Reaction[]
  savedBy: Save[]
  stats: {
    commentCount: number
    reactionCount: number
    saveCount: number
    reactionTypes: Record<string, number>
  }
}

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const router = useRouter()
  const { dispatch } = useAdmin()

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const response = await axios.get<Post>(`/api/admin/posts/${params.id}`)
        setPost(response.data)
      } catch (error) {
        console.error("Error fetching post:", error)
        adminActions.addAlert(dispatch, "Failed to fetch post details", "error")
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.id, dispatch])

  const handlePostUpdated = () => {
    setIsEditDialogOpen(false)
    adminActions.addAlert(dispatch, "Post updated successfully", "success")
    // Refresh the post data
    router.refresh()
  }

  const handlePostDeleted = async () => {
    try {
      await axios.delete(`/api/admin/posts/${params.id}`)

      adminActions.addAlert(dispatch, "Post deleted successfully", "success")
      router.push("/admin/posts")
    } catch (error) {
      console.error("Error deleting post:", error)
      adminActions.addAlert(dispatch, "Failed to delete post", "error")
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await axios.delete(`/api/admin/comments/${commentId}`)

      adminActions.addAlert(dispatch, "Comment deleted successfully", "success")
      // Refresh the post data to update comments
      router.refresh()
    } catch (error) {
      console.error("Error deleting comment:", error)
      adminActions.addAlert(dispatch, "Failed to delete comment", "error")
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getReactionEmoji = (type: string) => {
    switch (type.toUpperCase()) {
      case "LIKE":
        return "👍"
      case "LOVE":
        return "❤️"
      case "HAHA":
        return "😂"
      case "WOW":
        return "😮"
      case "SAD":
        return "😢"
      case "ANGRY":
        return "😡"
      default:
        return "👍"
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Post not found</h1>
        <Button onClick={() => router.push("/admin/posts")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Posts
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/admin/posts")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Posts
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
        <CardHeader>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.user.profileImage || undefined} alt={post.user.name} />
              <AvatarFallback>{getInitials(post.user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{post.user.name}</div>
              <div className="text-sm text-muted-foreground">@{post.user.username}</div>
            </div>
            <div className="text-sm text-muted-foreground ml-auto">
              {format(new Date(post.createdAt), "MMM d, yyyy h:mm a")}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="whitespace-pre-wrap">{post.content}</div>

          {post.postUrl && (
            <div className="mt-4">
              <img
                src={post.postUrl || "/placeholder.svg"}
                alt="Post media"
                className="rounded-md max-h-[500px] object-contain"
              />
            </div>
          )}

          <div className="flex items-center gap-6 pt-4 border-t">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-rose-500" />
              <span>{post.stats.reactionCount} Reactions</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <span>{post.stats.commentCount} Comments</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4 text-green-500" />
              <span>{post.stats.saveCount} Saves</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="comments" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="comments">Comments ({post.stats.commentCount})</TabsTrigger>
          <TabsTrigger value="reactions">Reactions ({post.stats.reactionCount})</TabsTrigger>
          <TabsTrigger value="saves">Saves ({post.stats.saveCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="space-y-4">
          {post.comments.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No comments found on this post.
              </CardContent>
            </Card>
          ) : (
            post.comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.user.profileImage || undefined} alt={comment.user.name} />
                        <AvatarFallback>{getInitials(comment.user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{comment.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(comment.createdAt), "MMM d, yyyy h:mm a")}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Comment actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDeleteComment(comment.id)}>
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Comment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-2">
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="reactions">
          <Card>
            <CardHeader>
              <CardTitle>Reaction Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(post.stats.reactionTypes).map(([type, count]) => (
                  <Card key={type} className="overflow-hidden">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">{getReactionEmoji(type)}</div>
                      <p className="font-medium">{count}</p>
                      <p className="text-xs text-muted-foreground">{type.charAt(0) + type.slice(1).toLowerCase()}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                <h3 className="font-semibold">Users who reacted</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {post.reactions.map((reaction) => (
                    <div key={reaction.id} className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={reaction.user.profileImage || undefined} alt={reaction.user.name} />
                        <AvatarFallback>{getInitials(reaction.user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{reaction.user.name}</p>
                        <p className="text-xs text-muted-foreground">@{reaction.user.username}</p>
                      </div>
                      <Badge className="ml-auto">{getReactionEmoji(reaction.type)}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saves">
          <Card>
            <CardHeader>
              <CardTitle>Users who saved this post</CardTitle>
            </CardHeader>
            <CardContent>
              {post.savedBy.length === 0 ? (
                <p className="text-center text-muted-foreground">No users have saved this post.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {post.savedBy.map((save) => (
                    <div key={save.id} className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={save.user.profileImage || undefined} alt={save.user.name} />
                        <AvatarFallback>{getInitials(save.user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{save.user.name}</p>
                        <p className="text-xs text-muted-foreground">@{save.user.username}</p>
                      </div>
                      <p className="text-xs text-muted-foreground ml-auto">
                        {format(new Date(save.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {post && (
        <>
          <EditPostDialog
            post={post}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSuccess={handlePostUpdated}
          />

          <DeletePostDialog
            post={post}
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onSuccess={handlePostDeleted}
          />
        </>
      )}
    </div>
  )
}

