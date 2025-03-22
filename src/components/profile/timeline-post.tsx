"use client"

import type React from "react"
import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { format, formatDistanceToNow } from "date-fns"
import { cn } from "src/lib/utils"

// UI Components
import { Button } from "src/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "src/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "src/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "src/components/ui/dropdown-menu"
import { Textarea } from "src/components/ui/textarea"
import { Dialog, DialogContent, DialogTrigger } from "src/components/ui/dialog"
import { Badge } from "src/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "src/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"

// Icons
import {
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Download,
  Share2,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Copy,
  Flag,
  AlertTriangle,
  Eye,
  Clock,
  User,
  Send,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  LinkIcon,
  ImageIcon,
  FileText,
  Smile,
  Globe,
  Lock,
  Users,
  Trash2,
} from "lucide-react"

// Social Icons
import { FacebookIcon, TwitterIcon, LinkedinIcon, WhatsappIcon, TelegramIcon, RedditIcon } from "react-share"

interface Comment {
  id: string
  user?: {
    username: string
    profileImage?: string
  }
  content: string
  createdAt: Date
  likes?: number
  isLiked?: boolean
  replies?: Comment[]
}

interface PostProps {
  post: {
    id: string
    content: string
    postUrl?: string
    fileUrl?: string
    createdAt: string
    userId: string
    user?: {
      username: string
      profileImage?: string
    }
    comments: Comment[]
    isLiked?: boolean
    isSaved?: boolean
    likes?: number
    privacy?: "public" | "friends" | "private"
    tags?: string[]
    location?: string
  }
  onLike: (postId: string) => void
  isLiked: boolean
  onSave: (postId: string) => void
  onComment: (comment: string) => void
  onShare?: (postId: string) => void
  onDelete?: (postId: string) => void
  onReport?: (postId: string, reason: string) => void
  isDetailView?: boolean
}

const MAX_CONTENT_LENGTH = 300
const INITIAL_COMMENTS_SHOWN = 2

export default function TimelinePost({
  post,
  isLiked,
  onLike,
  onSave,
  onComment,
  onShare,
  onDelete,
  onReport,
  isDetailView = false,
}: PostProps) {
  // State
  const [isCommentBoxVisible, setIsCommentBoxVisible] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isMediaPreviewOpen, setIsMediaPreviewOpen] = useState(false)
  const [isContentExpanded, setIsContentExpanded] = useState(isDetailView)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [liked, setLiked] = useState(isLiked)
  const [saved, setSaved] = useState(post.isSaved || false)
  const [commentsShown, setCommentsShown] = useState(isDetailView ? post.comments.length : INITIAL_COMMENTS_SHOWN)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [likeCount, setLikeCount] = useState(post.likes || 0)
  const [isHovered, setIsHovered] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [isVideoBuffering, setIsVideoBuffering] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  // Hooks
  const { toast } = useToast()

  // Media detection helpers
  const isVideo = useCallback((url?: string) => {
    if (!url) return false
    return url.match(/\.(mp4|webm|ogg)$/i) !== null
  }, [])

  const isYouTube = useCallback((url?: string) => {
    if (!url) return false
    return (
      url.match(
        /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^/&]{10,12})/,
      ) !== null
    )
  }, [])

  const getYouTubeVideoId = useCallback((url?: string) => {
    if (!url) return null
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^/&]{10,12})/,
    )
    return match ? match[1] : null
  }, [])

  // Video playback effects
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (videoRef.current && !isPlaying && !isMuted) {
            videoRef.current.muted = true
            videoRef.current.play().catch(() => {
              // Autoplay was prevented
            })
            setIsPlaying(true)
            setIsMuted(true)
          }
        } else {
          if (videoRef.current && isPlaying) {
            videoRef.current.pause()
            setIsPlaying(false)
          }
        }
      })
    }, options)

    if (videoContainerRef.current) {
      observer.observe(videoContainerRef.current)
    }

    return () => {
      if (videoContainerRef.current) {
        observer.unobserve(videoContainerRef.current)
      }
    }
  }, [isPlaying, isMuted])

  // Video progress tracking
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100
      setVideoProgress(progress)
    }

    const handleDurationChange = () => {
      setVideoDuration(video.duration)
    }

    const handleWaiting = () => {
      setIsVideoBuffering(true)
    }

    const handlePlaying = () => {
      setIsVideoBuffering(false)
    }

    const handleLoadedData = () => {
      setIsVideoLoaded(true)
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("durationchange", handleDurationChange)
    video.addEventListener("waiting", handleWaiting)
    video.addEventListener("playing", handlePlaying)
    video.addEventListener("loadeddata", handleLoadedData)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("durationchange", handleDurationChange)
      video.removeEventListener("waiting", handleWaiting)
      video.removeEventListener("playing", handlePlaying)
      video.removeEventListener("loadeddata", handleLoadedData)
    }
  }, [])

  // Format date helpers
  const formatCreatedAt = useCallback((date: Date) => {
    try {
      const now = new Date()
      const diff = now.getTime() - date.getTime()

      if (diff < 0) return "In the future"

      // If less than 24 hours, show relative time
      if (diff < 24 * 60 * 60 * 1000) {
        return formatDistanceToNow(date, { addSuffix: true })
      }

      // Otherwise show the date
      return format(date, "MMM d, yyyy 'at' h:mm a")
    } catch (error) {
      return "Recently"
    }
  }, [])

  const formatVideoDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Event handlers
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmittingComment(true)
    try {
      await onComment(newComment)
      setNewComment("")

      // Add optimistic update for the comment
      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        content: newComment,
        createdAt: new Date(),
        user: post.user,
        likes: 0,
        isLiked: false,
      }

      // Update local state with the new comment
      post.comments.push(optimisticComment)

      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      })
    } catch (error) {
      console.error("Error posting comment:", error)
      toast({
        title: "Error",
        description: "Failed to post your comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleLikeToggle = () => {
    setLiked(!liked)
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1))
    onLike(post.id)
  }

  const handleSaveToggle = () => {
    setSaved(!saved)
    onSave(post.id)
  }

  const handleDownload = useCallback(() => {
    if (post.fileUrl || post.postUrl) {
      const url = post.fileUrl || post.postUrl
      if (!url) return

      const link = document.createElement("a")
      link.href = url
      link.download = `post-${post.id}-media${isVideo(url) ? ".mp4" : ".jpg"}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Download started",
        description: "Your media is being downloaded.",
      })
    }
  }, [post.id, post.fileUrl, post.postUrl, isVideo, toast])

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch((error) => {
          console.error("Error playing video:", error)
        })
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])

  const handleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }, [isMuted])

  const handleFullscreen = useCallback(() => {
    if (videoRef.current) {
      if (!isFullscreen) {
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
      setIsFullscreen(!isFullscreen)
    }
  }, [isFullscreen])

  const handleProgressBarClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressBarRef.current) return

    const rect = progressBarRef.current.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    videoRef.current.currentTime = pos * videoRef.current.duration
  }, [])

  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}/posts/${post.id}`
    navigator.clipboard.writeText(url)
    toast({
      title: "Link copied",
      description: "Post link copied to clipboard",
    })
  }, [post.id, toast])

  const handleShare = useCallback(
    (platform?: string) => {
      const url = `${window.location.origin}/posts/${post.id}`

      if (platform) {
        let shareUrl = ""

        switch (platform) {
          case "facebook":
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
            break
          case "twitter":
            shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent("Check out this post!")}`
            break
          case "linkedin":
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
            break
          case "whatsapp":
            shareUrl = `https://wa.me/?text=${encodeURIComponent(`Check out this post! ${url}`)}`
            break
          case "telegram":
            shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent("Check out this post!")}`
            break
          case "reddit":
            shareUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent("Check out this post!")}`
            break
        }

        if (shareUrl) {
          window.open(shareUrl, "_blank", "noopener,noreferrer")
        }
      }

      if (onShare) {
        onShare(post.id)
      }
    },
    [post.id, onShare],
  )

  const handleReport = useCallback(() => {
    if (!reportReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for reporting this post.",
        variant: "destructive",
      })
      return
    }

    if (onReport) {
      onReport(post.id, reportReason)
    }

    toast({
      title: "Report submitted",
      description: "Thank you for your report. We'll review this content.",
    })

    setShowReportDialog(false)
    setReportReason("")
  }, [post.id, reportReason, onReport, toast])

  const handleReplyToComment = (commentId: string) => {
    setReplyingTo(commentId)
    setIsCommentBoxVisible(true)

    // Focus the comment input
    setTimeout(() => {
      if (commentInputRef.current) {
        commentInputRef.current.focus()
      }
    }, 100)
  }

  // Content processing
  const renderContent = (content: string) => {
    // Process URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const hashtagRegex = /#(\w+)/g
    const mentionRegex = /@(\w+)/g

    const parts = content.split(urlRegex)

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center"
          >
            <LinkIcon className="h-3 w-3 mr-1" />
            {part.length > 30 ? part.substring(0, 30) + "..." : part}
          </a>
        )
      }

      // Process hashtags and mentions
      const withHashtags = part.split(hashtagRegex)

      return withHashtags.map((subPart, subIndex) => {
        if (subPart.match(hashtagRegex)) {
          return (
            <a
              key={`${index}-${subIndex}`}
              href={`/hashtag/${subPart.substring(1)}`}
              className="text-primary hover:underline font-medium"
            >
              {subPart}
            </a>
          )
        }

        // Process mentions
        const withMentions = subPart.split(mentionRegex)

        return withMentions.map((mentionPart, mentionIndex) => {
          if (mentionPart.match(mentionRegex)) {
            return (
              <a
                key={`${index}-${subIndex}-${mentionIndex}`}
                href={`/profile/${mentionPart.substring(1)}`}
                className="text-primary hover:underline font-medium"
              >
                {mentionPart}
              </a>
            )
          }

          return mentionPart
        })
      })
    })
  }

  const truncatedContent = useMemo(() => {
    if (typeof post.content === "string" && post.content.length <= MAX_CONTENT_LENGTH) {
      return post.content
    }
    return typeof post.content === "string" ? `${post.content.slice(0, MAX_CONTENT_LENGTH)}...` : ""
  }, [post.content])

  // Media rendering
  const renderMedia = () => {
    if (!post.postUrl && !post.fileUrl) return null

    const mediaUrl = post.postUrl || post.fileUrl
    if (!mediaUrl) return null

    if (isVideo(mediaUrl)) {
      return (
        <div className="relative rounded-lg overflow-hidden bg-black" ref={videoContainerRef}>
          <video
            ref={videoRef}
            src={mediaUrl}
            className="w-full h-full object-contain rounded-lg"
            controls={false}
            onClick={handlePlayPause}
            muted={isMuted}
            loop
            playsInline
            onLoadedData={() => setIsVideoLoaded(true)}
          />

          {/* Video overlay controls */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Progress bar */}
            <div
              ref={progressBarRef}
              className="w-full h-1 bg-gray-600 rounded-full mb-3 cursor-pointer"
              onClick={handleProgressBarClick}
            >
              <div className="h-full bg-primary rounded-full relative" style={{ width: `${videoProgress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full transform scale-0 group-hover:scale-100 transition-transform" />
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={handlePlayPause} className="text-white hover:bg-white/20">
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>

                <Button variant="ghost" size="icon" onClick={handleMute} className="text-white hover:bg-white/20">
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>

                {isVideoLoaded && (
                  <span className="text-xs text-white">
                    {formatVideoDuration(videoRef.current?.currentTime || 0)} / {formatVideoDuration(videoDuration)}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={handleFullscreen} className="text-white hover:bg-white/20">
                  {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Play/Pause overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            {!isPlaying && (
              <Button
                variant="ghost"
                size="icon"
                className="h-16 w-16 rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={handlePlayPause}
              >
                <Play className="h-8 w-8" />
              </Button>
            )}

            {isVideoBuffering && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        </div>
      )
    } else if (isYouTube(post.content)) {
      const videoId = getYouTubeVideoId(post.content)
      return (
        <div className="relative pt-[56.25%] rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            allowFullScreen
            title="YouTube video"
          />
        </div>
      )
    } else {
      return (
        <div
          className="relative rounded-lg overflow-hidden group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            src={mediaUrl || "/placeholder.svg"}
            alt="Post Image"
            width={1200}
            height={800}
            className="w-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            onClick={() => setIsMediaPreviewOpen(true)}
          />

          {isHovered && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Eye className="h-10 w-10 text-white" />
            </div>
          )}
        </div>
      )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Card className="w-full mb-4 overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border-2 border-primary/10">
              <AvatarImage
                src={post.user?.profileImage || "/placeholder.svg?height=40&width=40"}
                alt={post.user?.username || "Unknown"}
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                {post.user?.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center">
                <h3 className="font-semibold text-foreground hover:underline cursor-pointer">
                  {post.user?.username || "Unknown"}
                </h3>

                {post.location && <span className="text-xs text-muted-foreground ml-2">• {post.location}</span>}
              </div>

              <div className="flex items-center text-xs text-muted-foreground">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <time className="flex items-center cursor-help">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatCreatedAt(new Date(post.createdAt))}
                      </time>
                    </TooltipTrigger>
                    <TooltipContent>{format(new Date(post.createdAt), "PPpp")}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {post.privacy && (
                  <span className="ml-2 flex items-center">
                    •
                    {post.privacy === "public" && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Globe className="h-3 w-3 ml-1" />
                          </TooltipTrigger>
                          <TooltipContent>Public</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {post.privacy === "friends" && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Users className="h-3 w-3 ml-1" />
                          </TooltipTrigger>
                          <TooltipContent>Friends Only</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {post.privacy === "private" && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Lock className="h-3 w-3 ml-1" />
                          </TooltipTrigger>
                          <TooltipContent>Private</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleCopyLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy link
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => handleShare("facebook")}>
                      <FacebookIcon size={16} round className="mr-2" />
                      Facebook
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare("twitter")}>
                      <TwitterIcon size={16} round className="mr-2" />
                      Twitter
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare("linkedin")}>
                      <LinkedinIcon size={16} round className="mr-2" />
                      LinkedIn
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare("whatsapp")}>
                      <WhatsappIcon size={16} round className="mr-2" />
                      WhatsApp
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare("telegram")}>
                      <TelegramIcon size={16} round className="mr-2" />
                      Telegram
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare("reddit")}>
                      <RedditIcon size={16} round className="mr-2" />
                      Reddit
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              {(post.fileUrl || post.postUrl) && (
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download media
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {onDelete && (
                <DropdownMenuItem
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this post?")) {
                      onDelete(post.id)
                    }
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete post
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={() => setShowReportDialog(true)}
                className="text-amber-500 focus:text-amber-500"
              >
                <Flag className="h-4 w-4 mr-2" />
                Report post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="pb-2 space-y-3">
          {/* Post content */}
          {post.content && (
            <div className="text-sm sm:text-base">
              <div
                className={cn(
                  "whitespace-pre-wrap break-words",
                  !isContentExpanded && post.content.length > MAX_CONTENT_LENGTH && "line-clamp-3",
                )}
              >
                {isContentExpanded ? renderContent(post.content) : renderContent(truncatedContent)}
              </div>

              {post.content.length > MAX_CONTENT_LENGTH && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setIsContentExpanded(!isContentExpanded)}
                  className="px-0 h-auto font-medium text-primary"
                >
                  {isContentExpanded ? "Show less" : "Show more"}
                </Button>
              )}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Media content */}
          {(post.postUrl || post.fileUrl) && (
            <Dialog open={isMediaPreviewOpen} onOpenChange={setIsMediaPreviewOpen}>
              <DialogTrigger asChild>
                <div className="mt-2 group cursor-pointer">{renderMedia()}</div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[80vw] p-0 border-none bg-transparent">
                <div className="relative w-full h-full flex items-center justify-center bg-black/90 rounded-lg">
                  {isVideo(post.postUrl || post.fileUrl || "") ? (
                    <video
                      src={post.postUrl || post.fileUrl}
                      className="max-w-full max-h-[80vh] object-contain"
                      controls
                      autoPlay
                    />
                  ) : isYouTube(post.content) ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(post.content)}`}
                      className="w-full h-full max-w-[80vw] max-h-[80vh] aspect-video"
                      allowFullScreen
                    />
                  ) : (
                    <Image
                      src={post.postUrl || post.fileUrl || ""}
                      alt="Post media"
                      width={1920}
                      height={1080}
                      className="max-w-full max-h-[80vh] object-contain"
                    />
                  )}

                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => setIsMediaPreviewOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <div className="absolute bottom-4 right-4 flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-black/50 hover:bg-black/70 text-white"
                      onClick={handleDownload}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-black/50 hover:bg-black/70 text-white"
                      onClick={() => handleShare()}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>

        <CardFooter className="flex flex-col pt-0">
          {/* Like, comment, save buttons */}
          <div className="flex justify-between w-full py-2">
            <div className="flex space-x-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "rounded-full px-3 transition-colors",
                        liked && "text-primary bg-primary/10 hover:bg-primary/20",
                      )}
                      onClick={handleLikeToggle}
                    >
                      <Heart className={cn("h-4 w-4 mr-2", liked && "fill-primary")} />
                      <span className="font-medium">{likeCount}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{liked ? "Unlike this post" : "Like this post"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full px-3"
                      onClick={() => setIsCommentBoxVisible(!isCommentBoxVisible)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      <span className="font-medium">{post.comments.length}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isCommentBoxVisible ? "Hide comments" : "Show comments"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "rounded-full px-3 transition-colors",
                      saved && "text-primary bg-primary/10 hover:bg-primary/20",
                    )}
                    onClick={handleSaveToggle}
                  >
                    <Bookmark className={cn("h-4 w-4", saved && "fill-primary")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{saved ? "Unsave this post" : "Save this post"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Comments section */}
          <AnimatePresence>
            {(isCommentBoxVisible || isDetailView) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full overflow-hidden"
              >
                {/* Comment list */}
                {post.comments.length > 0 && (
                  <div className="space-y-3 mb-3 max-h-[300px] overflow-y-auto p-2">
                    {post.comments.slice(0, commentsShown).map((comment) => (
                      <div key={comment.id} className="flex space-x-2 group">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage
                            src={comment.user?.profileImage || "/placeholder.svg?height=32&width=32"}
                            alt={comment.user?.username || "Unknown"}
                          />
                          <AvatarFallback className="text-xs">
                            {comment.user?.username?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-1">
                          <div className="bg-muted/50 rounded-lg p-2 text-sm">
                            <div className="font-medium text-xs">{comment.user?.username || "Anonymous User"}</div>
                            <div className="text-foreground">{comment.content}</div>
                          </div>

                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <time>{formatCreatedAt(new Date(comment.createdAt))}</time>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-xs font-medium"
                              onClick={() => handleReplyToComment(comment.id)}
                            >
                              Reply
                            </Button>

                            {comment.likes !== undefined && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "h-auto p-0 text-xs font-medium flex items-center",
                                  comment.isLiked && "text-primary",
                                )}
                              >
                                <ThumbsUp className={cn("h-3 w-3 mr-1", comment.isLiked && "fill-primary")} />
                                {comment.likes > 0 && comment.likes}
                              </Button>
                            )}
                          </div>

                          {/* Comment replies would go here */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="pl-4 border-l-2 border-muted mt-2 space-y-2">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex space-x-2">
                                  <Avatar className="h-6 w-6 flex-shrink-0">
                                    <AvatarImage
                                      src={reply.user?.profileImage || "/placeholder.svg?height=24&width=24"}
                                      alt={reply.user?.username || "Unknown"}
                                    />
                                    <AvatarFallback className="text-xs">
                                      {reply.user?.username?.[0]?.toUpperCase() || "U"}
                                    </AvatarFallback>
                                  </Avatar>

                                  <div className="flex-1 space-y-1">
                                    <div className="bg-muted/30 rounded-lg p-2 text-xs">
                                      <div className="font-medium text-xs">
                                        {reply.user?.username || "Anonymous User"}
                                      </div>
                                      <div className="text-foreground">{reply.content}</div>
                                    </div>

                                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                      <time>{formatCreatedAt(new Date(reply.createdAt))}</time>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {post.comments.length > commentsShown && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-primary"
                        onClick={() => setCommentsShown(commentsShown + 5)}
                      >
                        <ChevronDown className="h-4 w-4 mr-2" />
                        View more comments
                      </Button>
                    )}

                    {commentsShown > INITIAL_COMMENTS_SHOWN && !isDetailView && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-primary"
                        onClick={() => setCommentsShown(INITIAL_COMMENTS_SHOWN)}
                      >
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Show less
                      </Button>
                    )}
                  </div>
                )}

                {/* Comment input */}
                <div className="flex items-start space-x-2 pt-2 border-t">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage
                      src={post.user?.profileImage || "/placeholder.svg?height=32&width=32"}
                      alt={post.user?.username || "Unknown"}
                    />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    {replyingTo && (
                      <div className="flex items-center text-xs text-muted-foreground bg-muted/50 p-1 px-2 rounded">
                        <span>Replying to comment</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 ml-1"
                          onClick={() => setReplyingTo(null)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}

                    <div className="relative">
                      <Textarea
                        ref={commentInputRef}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
                        className="min-h-[80px] pr-10 resize-none"
                      />

                      <div className="absolute bottom-2 right-2 flex items-center space-x-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                              >
                                <Smile className="h-5 w-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Add emoji</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex space-x-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                <ImageIcon className="h-5 w-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Add image</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                <FileText className="h-5 w-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Add file</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <Button
                        onClick={handleCommentSubmit}
                        disabled={!newComment.trim() || isSubmittingComment}
                        size="sm"
                        className="rounded-full"
                      >
                        {isSubmittingComment ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-1" />
                            Post
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardFooter>
      </Card>

      {/* Report dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="space-y-4">
            <div className="flex items-center text-amber-500">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <h3 className="text-lg font-semibold">Report Post</h3>
            </div>

            <p className="text-sm text-muted-foreground">
              Please tell us why you're reporting this post. Your report will be kept anonymous.
            </p>

            <Textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Describe the issue with this post..."
              className="min-h-[100px]"
            />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReport} disabled={!reportReason.trim()}>
                Submit Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

