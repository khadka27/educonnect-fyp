"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { format } from "date-fns"
import Image from "next/image"
import { cn } from "@/lib/utils"

// UI Components
import { Button } from "src/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "src/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar"
import { Skeleton } from "src/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "src/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "src/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"

// Icons
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Eye,
  User,
  Globe,
  Users,
  Lock,
  X,
  ExternalLink,
  Download,
  Flag,
} from "lucide-react"

interface SavedPostsListProps {
  userId: string
}

interface Post {
  id: string
  content: string
  createdAt: string
  media?: string
  mediaType?: string
  author: {
    id: string
    name: string
    username: string
    profileImage?: string
  }
  likes: number
  comments: number
  isLiked: boolean
  isSaved: boolean
  privacy: "public" | "friends" | "private"
}

const SavedPostsList: React.FC<SavedPostsListProps> = ({ userId }) => {
  // State
  const [savedPosts, setSavedPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [viewingMedia, setViewingMedia] = useState<{
    url: string
    type: string
  } | null>(null)

  // Hooks
  const { data: session } = useSession()
  const { theme } = useTheme()
  const { toast } = useToast()

  const isOwnProfile = session?.user?.id === userId

  // Effects

  // Fetch saved posts
  useEffect(() => {
    fetchSavedPosts()
  }, [userId])

  // Functions

  const fetchSavedPosts = async () => {
    setLoading(true)
    try {
      // This would be a real API call in production
      // For now, we'll use mock data
      setTimeout(() => {
        const mockPosts: Post[] = Array.from({ length: 5 }).map((_, index) => ({
          id: `saved-${index}`,
          content:
            index % 2 === 0
              ? "This is a saved post with some interesting content that I wanted to keep for later reference. #education #learning"
              : "Check out this amazing resource I found! It's really helpful for studying and improving your skills.",
          createdAt: new Date(Date.now() - index * 86400000).toISOString(),
          media: index % 3 === 0 ? "/placeholder.svg?height=400&width=600" : undefined,
          mediaType: index % 3 === 0 ? "image" : undefined,
          author: {
            id: `author-${index}`,
            name: `User ${index}`,
            username: `user${index}`,
            profileImage: `/placeholder.svg?height=100&width=100&text=U${index}`,
          },
          likes: Math.floor(Math.random() * 100),
          comments: Math.floor(Math.random() * 20),
          isLiked: Math.random() > 0.5,
          isSaved: true,
          privacy: index % 3 === 0 ? "public" : index % 3 === 1 ? "friends" : "private",
        }))

        setSavedPosts(mockPosts)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error fetching saved posts:", error)
      setError("Failed to load saved posts. Please try again later.")
      setLoading(false)
    }
  }

  const handleLikePost = async (postId: string) => {
    try {
      // Optimistic update
      setSavedPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              }
            : post,
        ),
      )

      // This would be a real API call in production
      // await axios.post(`/api/posts/${postId}/like`);
    } catch (error) {
      console.error("Error liking post:", error)
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      })

      // Revert optimistic update
      setSavedPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              }
            : post,
        ),
      )
    }
  }

  const handleUnsavePost = async (postId: string) => {
    try {
      // Optimistic update
      setSavedPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId))

      toast({
        title: "Post unsaved",
        description: "The post has been removed from your saved items.",
      })

      // This would be a real API call in production
      // await axios.delete(`/api/posts/${postId}/save`);
    } catch (error) {
      console.error("Error unsaving post:", error)
      toast({
        title: "Error",
        description: "Failed to unsave post. Please try again.",
        variant: "destructive",
      })

      // Revert optimistic update
      fetchSavedPosts()
    }
  }

  const handleSharePost = (postId: string) => {
    // In a real app, this would generate a shareable link
    const shareUrl = `${window.location.origin}/posts/${postId}`

    navigator.clipboard.writeText(shareUrl)

    toast({
      title: "Link copied",
      description: "Post link copied to clipboard",
    })
  }

  const formatPostDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "MMM d, yyyy 'at' h:mm a")
    } catch (error) {
      return "Recently"
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="w-full max-w-3xl mx-auto">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-48 w-full rounded-md" />
            </CardContent>
            <CardFooter>
              <div className="flex justify-between w-full">
                <div className="flex space-x-2">
                  <Skeleton className="h-9 w-16 rounded-md" />
                  <Skeleton className="h-9 w-16 rounded-md" />
                </div>
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-destructive text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchSavedPosts}>Try Again</Button>
      </div>
    )
  }

  // Empty state
  if (savedPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-muted/50 p-6 rounded-full mb-4">
          <Bookmark className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No saved posts yet</h2>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          {isOwnProfile
            ? "When you save posts, they'll appear here for easy access later."
            : "This user hasn't saved any posts yet."}
        </p>
        {isOwnProfile && <Button onClick={() => window.history.back()}>Browse Posts</Button>}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {savedPosts.map((post) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={post.author.profileImage} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="font-medium">{post.author.name}</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span>{formatPostDate(post.createdAt)}</span>
                      <span className="mx-1">•</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              {post.privacy === "public" && <Globe className="h-3 w-3" />}
                              {post.privacy === "friends" && <Users className="h-3 w-3" />}
                              {post.privacy === "private" && <Lock className="h-3 w-3" />}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {post.privacy === "public" && "Public"}
                            {post.privacy === "friends" && "Friends Only"}
                            {post.privacy === "private" && "Private"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleUnsavePost(post.id)}>
                      <Bookmark className="h-4 w-4 mr-2 text-destructive" />
                      Unsave Post
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSharePost(post.id)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Post
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(`/posts/${post.id}`, "_blank")}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        toast({
                          title: "Post reported",
                          description: "Thank you for your report. We'll review this content.",
                        })
                      }}
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Report Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="pb-2">
              <div
                className={cn(
                  "whitespace-pre-wrap",
                  post.content.length > 300 && expandedPost !== post.id ? "line-clamp-4" : "",
                )}
              >
                {post.content}
              </div>

              {post.content.length > 300 && (
                <Button
                  variant="link"
                  className="p-0 h-auto mt-1"
                  onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                >
                  {expandedPost === post.id ? "Show less" : "Show more"}
                </Button>
              )}

              {post.media && (
                <div
                  className="mt-3 rounded-md overflow-hidden cursor-pointer"
                  onClick={() =>
                    setViewingMedia({
                      url: post.media!,
                      type: post.mediaType || "image",
                    })
                  }
                >
                  {post.mediaType === "video" ? (
                    <video src={post.media} controls className="w-full max-h-[400px] object-contain bg-muted/30" />
                  ) : (
                    <div className="relative">
                      <Image
                        src={post.media || "/placeholder.svg"}
                        alt="Post media"
                        width={600}
                        height={400}
                        className="w-full max-h-[400px] object-contain bg-muted/30"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
                        <Eye className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-2">
              <div className="flex justify-between w-full">
                <div className="flex space-x-2">
                  <Button
                    variant={post.isLiked ? "default" : "outline"}
                    size="sm"
                    className={post.isLiked ? "bg-primary/90 hover:bg-primary" : ""}
                    onClick={() => handleLikePost(post.id)}
                  >
                    <Heart className={cn("h-4 w-4 mr-2", post.isLiked ? "fill-primary-foreground" : "")} />
                    {post.likes}
                  </Button>

                  <Button variant="outline" size="sm" onClick={() => window.open(`/posts/${post.id}`, "_blank")}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {post.comments}
                  </Button>
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        onClick={() => handleSharePost(post.id)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Share Post</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      ))}

      {/* Media Viewer */}
      {viewingMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setViewingMedia(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background rounded-full"
              onClick={(e) => {
                e.stopPropagation()
                setViewingMedia(null)
              }}
            >
              <X className="h-4 w-4" />
            </Button>

            {viewingMedia.type === "video" ? (
              <video
                src={viewingMedia.url}
                controls
                autoPlay
                className="max-h-[80vh] max-w-full"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <Image
                src={viewingMedia.url || "/placeholder.svg"}
                alt="Media preview"
                width={1200}
                height={800}
                className="max-h-[80vh] max-w-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            )}

            <div className="absolute bottom-6 right-6 flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                className="bg-background/80 hover:bg-background"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(viewingMedia.url, "_blank")
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Original
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="bg-background/80 hover:bg-background"
                onClick={(e) => {
                  e.stopPropagation()
                  const a = document.createElement("a")
                  a.href = viewingMedia.url
                  a.download = "download"
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SavedPostsList

