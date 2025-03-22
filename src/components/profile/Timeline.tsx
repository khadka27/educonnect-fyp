// "use client";

// import React, {
//   useState,
//   useCallback,
//   useMemo,
//   useRef,
//   useEffect,
// } from "react";
// import Image from "next/image";
// import { Button } from "src/components/ui/button";
// import { Avatar, AvatarImage, AvatarFallback } from "src/components/ui/avatar";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
// } from "src/components/ui/card";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "src/components/ui/dropdown-menu";
// import { Textarea } from "src/components/ui/textarea";
// import { Dialog, DialogContent, DialogTrigger } from "src/components/ui/dialog";
// import {
//   Heart,
//   MessageCircle,
//   Bookmark,
//   MoreHorizontal,
//   Download,
//   Share2,
//   X,
//   Play,
//   Pause,
//   Volume2,
//   VolumeX,
//   Maximize,
//   Minimize,
// } from "lucide-react";
// import { FacebookIcon, TwitterIcon, LinkedinIcon } from "react-share";
// import axios from "axios";
// import { useToast } from "src/hooks/use-toast";

// interface PostProps {
//   post: {
//     id: string;
//     content: string;
//     postUrl?: string;
//     fileUrl?: string;
//     createdAt: string;
//     userId: string;
//     user?: {
//       username: string;
//       profileImage?: string;
//     };
//     comments: Array<{
//       id: string;
//       user?: {
//         username: string;
//         profileImage?: string;
//       };
//       content: string;
//       createdAt: Date;
//     }>;
//     isLiked?: boolean;
//     isSaved?: boolean;
//   };
//   onLike: (postId: string) => void;
//   isLiked: boolean;
//   onSave: (postId: string) => void;
//   onComment: (comment: string) => void;
// }

// const MAX_CONTENT_LENGTH = 300;
// const INITIAL_COMMENTS_SHOWN = 2;

// export default function TimelineComponent({
//   post,
//   isLiked,
//   onLike,
//   onSave,
//   onComment,
// }: PostProps) {
//   const [isCommentBoxVisible, setIsCommentBoxVisible] = useState(false);
//   const [newComment, setNewComment] = useState("");
//   const [isMediaPreviewOpen, setIsMediaPreviewOpen] = useState(false);
//   const [isContentExpanded, setIsContentExpanded] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [liked, setLiked] = useState(isLiked);
//   const [commentsShown, setCommentsShown] = useState(INITIAL_COMMENTS_SHOWN);


//   const videoRef = useRef<HTMLVideoElement>(null);
//   const videoContainerRef = useRef<HTMLDivElement>(null);


//   const isVideo = useCallback((url: string) => {
//     return url?.match(/\.(mp4|webm|ogg)$/);
//   }, []);

//   const isYouTube = useCallback((url: string) => {
//     return url?.match(
//       /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&]{10,12})/
//     );
//   }, []);

//   const getYouTubeVideoId = useCallback((url: string) => {
//     const match = url.match(
//       /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&]{10,12})/
//     );
//     return match ? match[1] : null;
//   }, []);

//   useEffect(() => {
//     const options = {
//       root: null,
//       rootMargin: "0px",
//       threshold: 0.5,
//     };

//     const observer = new IntersectionObserver((entries) => {
//       entries.forEach((entry) => {
//         if (entry.isIntersecting) {
//           if (videoRef.current && !isPlaying) {
//             videoRef.current.play();
//             setIsPlaying(true);
//           }
//         } else {
//           if (videoRef.current && isPlaying) {
//             videoRef.current.pause();
//             setIsPlaying(false);
//           }
//         }
//       });
//     }, options);

//     if (videoContainerRef.current) {
//       observer.observe(videoContainerRef.current);
//     }

//     return () => {
//       if (videoContainerRef.current) {
//         observer.unobserve(videoContainerRef.current);
//       }
//     };
//   }, [isPlaying]);

//   const formatCreatedAt = useCallback((date: Date) => {
//     const now = new Date();
//     const diff = now.getTime() - date.getTime();

//     if (diff < 0) return "In the future";
//     const minutes = Math.floor(diff / 60000);
//     const hours = Math.floor(minutes / 60);
//     const days = Math.floor(hours / 24);
//     const months = Math.floor(days / 30.44);
//     const years = Math.floor(months / 12);

//     if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
//     if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""}`;
//     if (days < 30) return `${days} day${days !== 1 ? "s" : ""}`;
//     if (months < 12) return `${months} month${months !== 1 ? "s" : ""}`;
//     return `${years} year${years !== 1 ? "s" : ""}`;
//   }, []);

//   const handleCommentSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (newComment.trim()) {
//       await onComment(newComment);
//       setNewComment("");
//     }
//   };

//   useEffect(() => {
//     // Fetch initial like status on component mount
//     const fetchLikeStatus = async () => {
//       try {
//         const userId = post.userId; // Initialize userId
//         const response = await axios.get(`/api/posts/${post.id}/like`, {
//           params: { userId },
//         });
//         setLiked(response.data.isLiked);
//       } catch (error) {
//         console.error("Error fetching like status:", error);
//       }
//     };

//     fetchLikeStatus();
//   }, [post.id, post.userId]);

//   // const handleSave = async () => {
//   //   if (post.isSaved) {
//   //     const userId = post.userId; // Initialize userId
//   //     await axios.delete(`/api/posts/${post.id}/saved-posts`, { data: { userId } });
//   //     toast({
//   //       title: "Post unsaved",
//   //       description: "The post has been unsaved.",
//   //       variant: "default",
//   //     });
//   //   } else {
//   //     const userId = post.userId; // Initialize userId
//   //     await axios.post(`/api/posts/${post.id}/saved-posts`, { userId });
//   //     toast({
//   //       title: "Post saved",
//   //       description: "The post has been saved.",
//   //       variant: "default",
//   //     });
//   //   }
//   //   onSave(post.id); // This updates the UI state
//   // };

//   const handleDownload = useCallback(() => {
//     if (post.fileUrl) {
//       const link = document.createElement("a");
//       link.href = post.fileUrl;
//       link.download = `post-${post.id}-media${
//         isVideo(post.fileUrl) ? ".mp4" : ".jpg"
//       }`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     }
//   }, [post.id, post.fileUrl, isVideo]);

//   const handlePlayPause = useCallback(() => {
//     if (videoRef.current) {
//       if (isPlaying) {
//         videoRef.current.pause();
//       } else {
//         videoRef.current.play();
//       }
//       setIsPlaying(!isPlaying);
//     }
//   }, [isPlaying]);

//   const handleMute = useCallback(() => {
//     if (videoRef.current) {
//       videoRef.current.muted = !isMuted;
//       setIsMuted(!isMuted);
//     }
//   }, [isMuted]);

//   const handleFullscreen = useCallback(() => {
//     if (videoRef.current) {
//       if (!isFullscreen) {
//         if (videoRef.current.requestFullscreen) {
//           videoRef.current.requestFullscreen();
//         }
//       } else {
//         if (document.exitFullscreen) {
//           document.exitFullscreen();
//         }
//       }
//       setIsFullscreen(!isFullscreen);
//     }
//   }, [isFullscreen]);

//   const shareUrl = `https://localhost:3000/posts/${post.id}`;

//   const renderContent = (content: string) => {
//     const urlRegex = /(https?:\/\/[^\s]+)/g;
//     const parts = content.split(urlRegex);
//     return parts.map((part, index) => {
//       if (part.match(urlRegex)) {
//         return (
//           <a
//             key={index}
//             href={part}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-blue-500 hover:underline"
//           >
//             {part}
//           </a>
//         );
//       }
//       return part;
//     });
//   };

//   const truncatedContent = useMemo(() => {
//     if (
//       typeof post.content === "string" &&
//       post.content.length <= MAX_CONTENT_LENGTH
//     ) {
//       return post.content;
//     }
//     return typeof post.content === "string"
//       ? `${post.content.slice(0, MAX_CONTENT_LENGTH)}...`
//       : "";
//   }, [post.content]);

//   const renderMedia = () => {
//     if (!post.postUrl) return null;

//     if (isVideo(post.postUrl)) {
//       return (
//         <div className="relative" ref={videoContainerRef}>
//           <video
//             ref={videoRef}
//             src={post.postUrl}
//             className="w-full h-full object-cover rounded-md"
//             controls={false}
//             onClick={handlePlayPause}
//             muted={isMuted}
//             loop
//             playsInline
//           />
//           <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
//             <Button variant="secondary" size="icon" onClick={handlePlayPause}>
//               {isPlaying ? (
//                 <Pause className="h-4 w-4" />
//               ) : (
//                 <Play className="h-4 w-4" />
//               )}
//             </Button>
//             <Button variant="secondary" size="icon" onClick={handleMute}>
//               {isMuted ? (
//                 <VolumeX className="h-4 w-4" />
//               ) : (
//                 <Volume2 className="h-4 w-4" />
//               )}
//             </Button>
//             <Button variant="secondary" size="icon" onClick={handleFullscreen}>
//               {isFullscreen ? (
//                 <Minimize className="h-4 w-4" />
//               ) : (
//                 <Maximize className="h-4 w-4" />
//               )}
//             </Button>
//           </div>
//         </div>
//       );
//     } else if (isYouTube(post.content)) {
//       const videoId = getYouTubeVideoId(post.content);
//       return (
//         <div className="relative pt-[56.25%]">
//           <iframe
//             src={`https://www.youtube.com/embed/${videoId}`}
//             className="absolute top-0 left-0 w-full h-full rounded-md"
//             allowFullScreen
//           />
//         </div>
//       );
//     } else {
//       return (
//         <Image
//           src={post.postUrl}
//           alt="Post Image"
//           layout="fill"
//           // width={1920}
//           // height={1080}
//           objectFit="contain"
//           className="rounded-md cursor-pointer transition-transform duration-300 hover:scale-105"
//           sizes="(max-width: 640px) 360px, (max-width: 1280px) 720px, 1080px"
//           onClick={() => setIsMediaPreviewOpen(true)}
//         />
//       );
//     }
//   };

//   return (
//     <Card className="w-full mb-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 shadow-lg transition-all duration-300 hover:shadow-xl">
//       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//         <div className="flex items-center space-x-4">
//           <Avatar>
//             <AvatarImage
//               src={
//                 post.user?.profileImage || "/placeholder.svg?height=40&width=40"
//               }
//               alt={post.user?.username || "Unknown"}
//             />
//             <AvatarFallback>{post.user?.username?.[0] || "U"}</AvatarFallback>
//           </Avatar>
//           <div>
//             <h3 className="font-semibold text-gray-800 dark:text-gray-200">
//               {post.user?.username || "Unknown"}
//             </h3>
//             <p className="text-sm text-gray-600 dark:text-gray-400">
//               {formatCreatedAt(new Date(post.createdAt))}
//             </p>
//           </div>
//         </div>
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="ghost" size="icon" aria-label="More options">
//               <MoreHorizontal className="h-4 w-4" />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <DropdownMenuItem>
//                   <Share2 className="h-4 w-4 mr-2" />
//                   Share
//                 </DropdownMenuItem>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent>
//                 <DropdownMenuItem>
//                   <FacebookIcon size={24} round className="mr-2" />
//                   Facebook
//                 </DropdownMenuItem>
//                 <DropdownMenuItem>
//                   <TwitterIcon size={24} round className="mr-2" />
//                   Twitter
//                 </DropdownMenuItem>
//                 <DropdownMenuItem>
//                   <LinkedinIcon size={24} round className="mr-2" />
//                   LinkedIn
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//             {post.fileUrl && (
//               <DropdownMenuItem onSelect={handleDownload}>
//                 <Download className="h-4 w-4 mr-2" />
//                 Download Media
//               </DropdownMenuItem>
//             )}
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </CardHeader>
//       <CardContent>
//         <p>
//           {isContentExpanded
//             ? post.content
//               ? renderContent(post.content)
//               : ""
//             : renderContent(truncatedContent)}
//         </p>
//         {typeof post.content === "string" &&
//           post.content.length > MAX_CONTENT_LENGTH && (
//             <Button
//               variant="link"
//               onClick={() => setIsContentExpanded(!isContentExpanded)}
//             >
//               {isContentExpanded ? "Show less" : "Show more"}
//             </Button>
//           )}

//         {post.postUrl && (
//           <Dialog
//             open={isMediaPreviewOpen}
//             onOpenChange={setIsMediaPreviewOpen}
//           >
//             <DialogTrigger asChild>
//               <div className="relative h-52 sm:h-80 md:h-96 cursor-pointer overflow-hidden rounded-md">
//                 {renderMedia()}
//               </div>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[60vw] sm:max-h-[60vh] p-0">
//               <div className="relative w-full h-full flex items-center justify-center bg-black bg-opacity-75">
//                 {isVideo(post.postUrl) ? (
//                   <video
//                     src={post.postUrl}
//                     className="max-w-full max-h-full object-contain"
//                     controls
//                     autoPlay
//                   />
//                 ) : isYouTube(post.content) ? (
//                   <iframe
//                     src={`https://www.youtube.com/embed/${getYouTubeVideoId(
//                       post.postUrl
//                     )}`}
//                     className="w-full h-full max-w-[80vw] max-h-[80vh]"
//                     allowFullScreen
//                   />
//                 ) : (
//                   <div className="relative overflow-hidden">
//                     <Image
//                       src={post.postUrl}
//                       alt="Post Image"
//                       layout="responsive"
//                       width={1500}
//                       height={1500}
//                       objectFit="contain"
//                       className="w-full h-auto rounded-md cursor-pointer"
//                       sizes="(max-width: 640px) 360px, (max-width: 1280px) 720px, 1080px"
//                     />
//                   </div>
//                 )}
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white"
//                   onClick={() => setIsMediaPreviewOpen(false)}
//                 >
//                   <X className="h-4 w-4" />
//                 </Button>
//               </div>
//             </DialogContent>
//           </Dialog>
//         )}
//       </CardContent>
//       <CardFooter className="flex flex-col">
//         <div className="flex justify-between w-full mb-4">
//           <div className="flex space-x-2">
//             <Button
//               variant="ghost"
//               size="sm"
//               className={`${
//                 liked ? "text-green-600 dark:text-green-400" : ""
//               } px-2`}
//               onClick={() => {
//                 onLike(post.id);
//                 setLiked(!liked);
//               }}
//               aria-label={liked ? "Unlike post" : "Like post"}
//             >
//               <Heart
//                 className={`h-5 w-5 ${liked ? "fill-current" : ""} mr-1`}
//               />
//               Like
//             </Button>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => setIsCommentBoxVisible(!isCommentBoxVisible)}
//               aria-label="Toggle comment box"
//               className="px-2"
//             >
//               <MessageCircle className="h-5 w-5 mr-1" />
//               Comment
//             </Button>
//           </div>
//           {/* <Button
//             variant="ghost"
//             size="sm"
//             className={`${
//               post.isSaved ? "text-green-600 dark:text-green-400" : ""
//             } px-2`}
//             onClick={() => onSave(post.id)}
//             aria-label={post.isSaved ? "Unsave post" : "Save post"}
//           >
//             <Bookmark
//               className={`h-5 w-5 ${post.isSaved ? "fill-current" : ""} mr-1`}
//             />
//             Save
//           </Button> */}

//           <Button
//             variant="ghost"
//             size="sm"
//             className={`${
//               post.isSaved ? "text-green-600 dark:text-green-400" : ""
//             } px-2`}
//             onClick={() => onSave(post.id)}
//             aria-label={post.isSaved ? "Unsave post" : "Save post"}
//           >
//             <Bookmark
//               className={`h-5 w-5 ${post.isSaved ? "fill-current" : ""} mr-1`}
//             />
//             Save
//           </Button>
//         </div>
//         <div className="w-full">
//           {post.comments.slice(0, commentsShown).map((comment) => (
//             <div key={comment.id} className="flex items-start space-x-2 mb-2">
//               <Avatar>
//                 <AvatarImage
//                   src={
//                     comment.user?.profileImage ||
//                     "/placeholder.svg?height=40&width=40"
//                   }
//                   alt={comment.user?.username || "Unknown"}
//                 />
//                 <AvatarFallback>
//                   {comment.user?.username?.[0] || "U"}
//                 </AvatarFallback>
//               </Avatar>
//               <div>
//                 <p className="font-semibold text-gray-800 dark:text-gray-200">
//                   {comment.user?.username || "Anonymous User"}
//                 </p>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   {comment.content}
//                 </p>
//                 <p className="text-xs text-gray-500 dark:text-gray-600">
//                   {formatCreatedAt(new Date(comment.createdAt))}
//                 </p>
//               </div>
//             </div>
//           ))}

//           {post.comments.length > commentsShown && (
//             <Button
//               variant="link"
//               onClick={() => setCommentsShown(commentsShown + 5)}
//               className="p-0 text-green-600 dark:text-green-400"
//             >
//               View more comments
//             </Button>
//           )}
//         </div>
//       </CardFooter>
//       {isCommentBoxVisible && (
//         <div className="px-4 pb-4">
//           <Textarea
//             value={newComment}
//             onChange={(e) => setNewComment(e.target.value)}
//             placeholder="Add a comment..."
//             className="mb-2 border-green-200 focus:border-green-400"
//           />
//           <Button
//             onClick={handleCommentSubmit}
//             disabled={!newComment.trim()}
//             className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white"
//           >
//             Post Comment
//           </Button>
//         </div>
//       )}
//     </Card>
//   );
// }


"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import axios from "axios"
import { useTheme } from "next-themes"
import { useInView } from "react-intersection-observer"
import { motion, AnimatePresence } from "framer-motion"
import TimelinePost from "src/components/profile/timeline-post"
import { Skeleton } from "src/components/ui/skeleton"
import { Button } from "src/components/ui/button"
import { Card } from "src/components/ui/card"
import { useToast } from "src/hooks/use-toast"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

// Icons
import { RefreshCw, Filter, Search, AlertCircle } from "lucide-react"

interface Post {
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
  comments: Array<{
    id: string
    user: {
      username: string
      profileImage?: string
    }
    content: string
    createdAt: Date
    likes?: number
    isLiked?: boolean
    replies?: Array<{
      id: string
      user: {
        username: string
        profileImage?: string
      }
      content: string
      createdAt: Date
    }>
  }>
  isLiked?: boolean
  isSaved?: boolean
  likes?: number
  privacy?: "public" | "friends" | "private"
  tags?: string[]
  location?: string
}

interface TimelineListProps {
  userId: string
  filter?: string
  isProfile?: boolean
}

const TimelineList: React.FC<TimelineListProps> = ({ userId, filter, isProfile = false }) => {
  // State
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [activeFilter, setActiveFilter] = useState(filter || "all")
  const [showFilters, setShowFilters] = useState(false)
  const [postLikes, setPostLikes] = useState<Record<string, boolean>>({})
  const [postSaves, setPostSaves] = useState<Record<string, boolean>>({})

  // Refs
  const timelineRef = useRef<HTMLDivElement>(null)

  // Hooks
  const { theme } = useTheme()
  const { toast } = useToast()
  const { data: session } = useSession()
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })

  // Effects

  // Initialize post likes and saves
  useEffect(() => {
    if (posts.length > 0) {
      const likes: Record<string, boolean> = {}
      const saves: Record<string, boolean> = {}

      posts.forEach((post) => {
        likes[post.id] = post.isLiked || false
        saves[post.id] = post.isSaved || false
      })

      setPostLikes(likes)
      setPostSaves(saves)
    }
  }, [posts])

  // Fetch posts on mount and when filter changes
  useEffect(() => {
    if (userId) {
      setPage(1)
      setPosts([])
      setIsLoading(true)
      setError(null)
      fetchPosts(1, activeFilter)
    }
  }, [userId, activeFilter])

  // Load more posts when scrolling to the bottom
  useEffect(() => {
    if (inView && hasMore && !isLoading && !isLoadingMore) {
      loadMorePosts()
    }
  }, [inView, hasMore, isLoading, isLoadingMore])

  // Functions

  const fetchPosts = useCallback(
    async (pageNumber: number, filterType: string) => {
      try {
        setError(null)

        // Construct the API endpoint based on the filter
        let endpoint = `/api/posts/timeline?userId=${userId}&page=${pageNumber}`

        if (filterType !== "all") {
          endpoint += `&filter=${filterType}`
        }

        if (isProfile) {
          endpoint = `/api/posts/user/${userId}?page=${pageNumber}`
          if (filterType === "saved") {
            endpoint = `/api/posts/saved?userId=${userId}&page=${pageNumber}`
          }
        }

        const response = await axios.get(endpoint)
        const fetchedPosts = response.data

        if (Array.isArray(fetchedPosts.posts)) {
          if (pageNumber === 1) {
            setPosts(fetchedPosts.posts)
          } else {
            setPosts((prevPosts) => {
              // Create a set of existing post IDs
              const existingPostIds = new Set(prevPosts.map((post) => post.id))

              // Filter out duplicates from the new posts
              const uniquePosts = fetchedPosts.posts.filter((post: { id: string }) => !existingPostIds.has(post.id))

              return [...prevPosts, ...uniquePosts]
            })
          }

          setHasMore(fetchedPosts.hasMore)
        } else {
          console.error("Error: 'posts' is not an array", fetchedPosts)
          setError("There was an error fetching posts. Please try again later.")
        }
      } catch (error) {
        console.error("Error fetching posts:", error)
        setError("There was an error fetching posts. Please try again later.")
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
        setIsLoadingMore(false)
      }
    },
    [userId, isProfile],
  )

  const refreshPosts = useCallback(() => {
    setIsRefreshing(true)
    setPage(1)
    fetchPosts(1, activeFilter)
  }, [fetchPosts, activeFilter])

  const loadMorePosts = useCallback(() => {
    if (hasMore && !isLoading && !isLoadingMore) {
      setIsLoadingMore(true)
      const nextPage = page + 1
      setPage(nextPage)
      fetchPosts(nextPage, activeFilter)
    }
  }, [hasMore, isLoading, isLoadingMore, page, fetchPosts, activeFilter])

  const handleFilterChange = (filter: string) => {
    if (filter !== activeFilter) {
      setActiveFilter(filter)
      setShowFilters(false)
      // Scroll to top when changing filters
      if (timelineRef.current) {
        timelineRef.current.scrollTo({ top: 0, behavior: "smooth" })
      }
    }
  }

  const handleLike = async (postId: string) => {
    try {
      // Optimistically update the UI
      setPostLikes((prev) => ({ ...prev, [postId]: !prev[postId] }))

      // Update the like count in the posts array
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            const newLikeCount = (post.likes || 0) + (postLikes[postId] ? -1 : 1)
            return { ...post, likes: newLikeCount, isLiked: !postLikes[postId] }
          }
          return post
        }),
      )

      // Make the API call
      await axios.post(`/api/posts/${postId}/like`, {
        userId: session?.user?.id || userId,
        type: postLikes[postId] ? "unlike" : "like",
      })
    } catch (error) {
      console.error("Error liking post:", error)

      // Revert the optimistic update
      setPostLikes((prev) => ({ ...prev, [postId]: !prev[postId] }))

      // Revert the like count
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            const newLikeCount = (post.likes || 0) + (postLikes[postId] ? 1 : -1)
            return { ...post, likes: newLikeCount, isLiked: postLikes[postId] }
          }
          return post
        }),
      )

      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSave = async (postId: string) => {
    try {
      // Optimistically update the UI
      setPostSaves((prev) => ({ ...prev, [postId]: !prev[postId] }))

      // Update the saved status in the posts array
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return { ...post, isSaved: !postSaves[postId] }
          }
          return post
        }),
      )

      // Make the API call
      if (postSaves[postId]) {
        await axios.delete(`/api/posts/${postId}/saved-posts`, {
          data: { userId: session?.user?.id || userId },
        })

        toast({
          title: "Post unsaved",
          description: "The post has been removed from your saved items.",
        })
      } else {
        await axios.post(`/api/posts/${postId}/saved-posts`, {
          userId: session?.user?.id || userId,
        })

        toast({
          title: "Post saved",
          description: "The post has been saved to your profile.",
        })
      }
    } catch (error) {
      console.error("Error saving/unsaving post:", error)

      // Revert the optimistic update
      setPostSaves((prev) => ({ ...prev, [postId]: !prev[postId] }))

      // Revert the saved status
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return { ...post, isSaved: postSaves[postId] }
          }
          return post
        }),
      )

      toast({
        title: "Error",
        description: "Failed to update save status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleComment = useCallback(
    async (postId: string, comment: string) => {
      if (!session?.user?.id) {
        toast({
          title: "Error",
          description: "You need to be logged in to comment.",
          variant: "destructive",
        })
        return
      }

      try {
        const response = await axios.post(`/api/posts/${postId}/comments`, {
          postId,
          content: comment,
          userId: session.user.id,
        })

        const newComment = response.data

        // Update the comments in the posts array
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                comments: [...post.comments, newComment],
              }
            }
            return post
          }),
        )

        toast({
          title: "Comment added",
          description: "Your comment has been posted successfully.",
        })
      } catch (error) {
        console.error("Error adding comment:", error)
        toast({
          title: "Error",
          description: "Failed to add your comment. Please try again.",
          variant: "destructive",
        })
      }
    },
    [session, toast],
  )

  const handleShare = useCallback(
    (postId: string) => {
      const url = `${window.location.origin}/posts/${postId}`

      if (navigator.share) {
        navigator
          .share({
            title: "Check out this post",
            text: "I found this interesting post",
            url: url,
          })
          .catch((err) => {
            console.error("Error sharing:", err)
            navigator.clipboard.writeText(url)
            toast({
              title: "Link copied",
              description: "Post link copied to clipboard",
            })
          })
      } else {
        navigator.clipboard.writeText(url)
        toast({
          title: "Link copied",
          description: "Post link copied to clipboard",
        })
      }
    },
    [toast],
  )

  const handleDelete = useCallback(
    async (postId: string) => {
      try {
        // Optimistically remove the post from the UI
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId))

        // Make the API call
        await axios.delete(`/api/posts/${postId}`)

        toast({
          title: "Post deleted",
          description: "Your post has been deleted successfully.",
        })
      } catch (error) {
        console.error("Error deleting post:", error)

        // Fetch posts again to restore the UI
        refreshPosts()

        toast({
          title: "Error",
          description: "Failed to delete the post. Please try again.",
          variant: "destructive",
        })
      }
    },
    [refreshPosts, toast],
  )

  const handleReport = useCallback(
    async (postId: string, reason: string) => {
      try {
        await axios.post(`/api/posts/${postId}/report`, {
          userId: session?.user?.id || userId,
          reason,
        })

        toast({
          title: "Report submitted",
          description: "Thank you for your report. We'll review this content.",
        })
      } catch (error) {
        console.error("Error reporting post:", error)
        toast({
          title: "Error",
          description: "Failed to submit your report. Please try again.",
          variant: "destructive",
        })
      }
    },
    [session, userId, toast],
  )

  // Render functions

  const renderFilters = () => {
    const filters = [
      { id: "all", label: "All Posts" },
      { id: "trending", label: "Trending" },
      { id: "latest", label: "Latest" },
      { id: "media", label: "Media" },
    ]

    if (isProfile) {
      filters.push({ id: "saved", label: "Saved" })
    }

    return (
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map((filter) => (
          <Button
            key={filter.id}
            variant={activeFilter === filter.id ? "default" : "outline"}
            size="sm"
            className={cn(
              "rounded-full whitespace-nowrap",
              activeFilter === filter.id && "bg-primary text-primary-foreground",
            )}
            onClick={() => handleFilterChange(filter.id)}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    )
  }

  const renderPostSkeleton = () => (
    <Card className="w-full mb-4 overflow-hidden animate-pulse">
      <div className="p-4">
        <div className="flex items-center space-x-4 mb-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-3 w-[100px]" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-[200px] w-full mt-4 rounded-md" />
        <div className="flex justify-between mt-4">
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-16 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </Card>
  )

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-muted/50 p-6 rounded-full mb-4">
        <Search className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">No posts found</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        {activeFilter === "all"
          ? "There are no posts to display at the moment. Check back later!"
          : `No posts found with the "${activeFilter}" filter. Try a different filter.`}
      </p>
      {activeFilter !== "all" && <Button onClick={() => handleFilterChange("all")}>View all posts</Button>}
    </div>
  )

  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-destructive/10 p-6 rounded-full mb-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        {error || "There was an error loading posts. Please try again."}
      </p>
      <Button onClick={refreshPosts}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Try again
      </Button>
    </div>
  )

  return (
    <div
      ref={timelineRef}
      className={cn(
        "w-full px-4 sm:px-6 md:px-8 lg:px-0 py-6 min-h-screen",
        isProfile ? "max-w-full" : "max-w-2xl mx-auto",
      )}
    >
      {/* Header with filters */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm pb-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">
            {isProfile ? (activeFilter === "saved" ? "Saved Posts" : "Posts") : "Timeline"}
          </h1>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={refreshPosts}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              <span className="sr-only">Refresh</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filters</span>
            </Button>
          </div>
        </div>

        {/* Filters - always visible on md+ screens, toggleable on mobile */}
        <div className={cn("md:block", showFilters ? "block" : "hidden")}>{renderFilters()}</div>
      </div>

      {/* Main content */}
      <div className="space-y-4">
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {renderPostSkeleton()}
              </motion.div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && renderErrorState()}

        {/* Empty state */}
        {!isLoading && !error && posts.length === 0 && renderEmptyState()}

        {/* Posts */}
        <AnimatePresence>
          {!isLoading &&
            !error &&
            posts.map((post, index) => (
              <motion.div
                key={`${post.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <TimelinePost
                  post={post}
                  isLiked={postLikes[post.id] || false}
                  onLike={() => handleLike(post.id)}
                  onSave={() => handleSave(post.id)}
                  onComment={(comment) => handleComment(post.id, comment)}
                  onShare={() => handleShare(post.id)}
                  onDelete={session?.user?.id === post.userId ? () => handleDelete(post.id) : undefined}
                  onReport={handleReport}
                />
              </motion.div>
            ))}
        </AnimatePresence>

        {/* Load more indicator */}
        {hasMore && !isLoading && !error && posts.length > 0 && (
          <div ref={ref} className="flex justify-center py-8">
            {isLoadingMore ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading more posts...</p>
              </div>
            ) : (
              <Button variant="outline" onClick={loadMorePosts} className="rounded-full">
                Load more posts
              </Button>
            )}
          </div>
        )}

        {/* End of posts message */}
        {!hasMore && !isLoading && !error && posts.length > 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>You've reached the end of the timeline</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TimelineList

