/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import Image from "next/image";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "src/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "src/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar";
import { Skeleton } from "src/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "src/components/ui/tooltip";
import { Badge } from "src/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Icons
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  BookmarkMinus,
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
  RefreshCcw,
  Search,
  Loader2,
} from "lucide-react";
import axios from "axios";

interface SavedPostsListProps {
  userId: string;
}

interface Post {
  id: string;
  content: string;
  createdAt: string;
  media?: string;
  mediaType?: string;
  author: {
    id: string;
    name: string;
    username: string;
    profileImage?: string;
  };
  likes: number;
  comments: number;
  isLiked: boolean;
  isSaved: boolean;
  privacy: "public" | "friends" | "private";
}

const SavedPostsList: React.FC<SavedPostsListProps> = ({ userId }) => {
  // State
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [viewingMedia, setViewingMedia] = useState<{
    url: string;
    type: string;
  } | null>(null);
  const [animateHearts, setAnimateHearts] = useState<{
    [key: string]: boolean;
  }>({});
  const [likeCounters, setLikeCounters] = useState<{
    [key: string]: number;
  }>({});

  // Hooks
  const { data: session } = useSession();
  const { theme } = useTheme();
  const { toast } = useToast();

  const isOwnProfile = session?.user?.id === userId;

  // Functions

  // Fetch saved posts from the backend with improved feedback
  const fetchSavedPosts = async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      const response = await axios.get(`/api/user/${userId}/saved-posts`);
      const fetchedPosts = response.data.posts || [];

      // Initialize like counters
      const initialCounters = fetchedPosts.reduce(
        (acc: Record<string, number>, post: Post) => {
          acc[post.id] = post.likes;
          return acc;
        },
        {}
      );

      setLikeCounters(initialCounters);
      setSavedPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching saved posts:", error);
      setError("Failed to load saved posts. Please try again later.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Effects
  useEffect(() => {
    if (userId) {
      fetchSavedPosts();
    }
  }, [userId]);

  // Functions

  // Refreshes the posts
  const refreshPosts = () => {
    fetchSavedPosts(true);
  };

  // Handle like post with animation
  const handleLikePost = async (postId: string) => {
    try {
      // Find the post
      const post = savedPosts.find((p) => p.id === postId);
      if (!post) return;

      // Update animation state
      setAnimateHearts({ ...animateHearts, [postId]: !post.isLiked });

      // Animate like counter change
      const newLikeCount = post.isLiked ? post.likes - 1 : post.likes + 1;
      setLikeCounters({
        ...likeCounters,
        [postId]: newLikeCount,
      });

      // Optimistic update
      setSavedPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLiked: !p.isLiked,
                likes: newLikeCount,
              }
            : p
        )
      );

      // Reset animation after a delay
      setTimeout(() => {
        setAnimateHearts((prev) => ({ ...prev, [postId]: false }));
      }, 1000);

      // This would be a real API call in production
      await axios.post(`/api/posts/${postId}/like`, {
        userId: session?.user?.id,
      });
    } catch (error) {
      console.error("Error liking post:", error);
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      });

      // Revert optimistic update
      setSavedPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            const revertedLikes = post.isLiked
              ? post.likes - 1
              : post.likes + 1;
            return {
              ...post,
              isLiked: !post.isLiked,
              likes: revertedLikes,
            };
          }
          return post;
        })
      );

      // Revert like counter
      const post = savedPosts.find((p) => p.id === postId);
      if (post) {
        setLikeCounters({
          ...likeCounters,
          [postId]: post.likes,
        });
      }
    }
  };

  // Handle unsave post with visual feedback
  const handleUnsavePost = async (postId: string) => {
    try {
      // Optimistic update
      setSavedPosts((prevPosts) =>
        prevPosts.filter((post) => post.id !== postId)
      );

      toast({
        title: "Post unsaved",
        description: "The post has been removed from your saved items.",
      });

      // Make API call to unsave the post
      await axios.delete(`/api/posts/${postId}/saved-posts`, {
        data: { userId },
      });
    } catch (error) {
      console.error("Error unsaving post:", error);
      toast({
        title: "Error",
        description: "Failed to unsave post. Please try again.",
        variant: "destructive",
      });

      // Revert optimistic update
      fetchSavedPosts();
    }
  };

  // Handle share post with improved feedback
  const handleSharePost = (postId: string) => {
    // In a real app, this would generate a shareable link
    const shareUrl = `${window.location.origin}/posts/${postId}`;

    navigator.clipboard.writeText(shareUrl);

    toast({
      title: "Link copied",
      description: "Post link copied to clipboard. Ready to share!",
    });
  };

  // Format post date with improved readability
  const formatPostDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        // Less than a day ago, show relative time
        if (diffInHours < 1) {
          const minutes = Math.floor(diffInHours * 60);
          return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
        }
        return `${Math.floor(diffInHours)} hour${
          Math.floor(diffInHours) !== 1 ? "s" : ""
        } ago`;
      } else if (diffInHours < 48) {
        // Yesterday
        return `Yesterday at ${format(date, "h:mm a")}`;
      } else {
        // More than 48 hours ago
        return format(date, "MMM d, yyyy 'at' h:mm a");
      }
    } catch (error) {
      return "Recently";
    }
  };

  // Loading skeleton with different sizes for variety
  const PostSkeleton = ({
    size = "medium",
  }: {
    size?: "small" | "medium" | "large";
  }) => {
    const imageHeight = {
      small: "h-[150px]",
      medium: "h-[200px]",
      large: "h-[250px]",
    };

    return (
      <Card className="w-full max-w-3xl mx-auto overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-3 w-[80px]" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="pb-2 space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className={`${imageHeight[size]} w-full rounded-md`} />
        </CardContent>
        <CardFooter className="pt-2">
          <div className="flex justify-between items-center w-full">
            <div className="flex space-x-2">
              <Skeleton className="h-9 w-16 rounded-md" />
              <Skeleton className="h-9 w-16 rounded-md" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </CardFooter>
      </Card>
    );
  };

  // Improved loading state with staggered animations
  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-7 w-[120px]" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>

        {["large", "medium", "small"].map((size, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <PostSkeleton size={size as "small" | "medium" | "large"} />
          </motion.div>
        ))}
      </div>
    );
  }

  // Enhanced error state with retry button
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12 px-4 text-center"
      >
        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 p-8 rounded-full mb-6">
          <Flag className="h-16 w-16 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
          Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          {error}
        </p>
        <Button
          onClick={() => fetchSavedPosts()}
          className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-700 dark:hover:bg-teal-600 group"
        >
          <RefreshCcw className="h-4 w-4 mr-2 group-hover:animate-spin" />
          Try Again
        </Button>
      </motion.div>
    );
  }

  // Improved empty state with animation
  if (savedPosts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12 px-4 text-center"
      >
        <div className="bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/30 dark:to-teal-900/30 p-8 rounded-full mb-6 shadow-inner">
          <Bookmark className="h-16 w-16 text-teal-600 dark:text-teal-400" />
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
          No saved posts yet
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          {isOwnProfile
            ? "When you save posts, they'll appear here for easy access later. Save posts that inspire you or that you want to revisit."
            : "This user hasn't saved any posts yet. Check back later!"}
        </p>
        {isOwnProfile && (
          <Button
            onClick={() => window.history.back()}
            className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-700 dark:hover:bg-teal-600 group transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <Search className="h-4 w-4 mr-2" />
            Discover Posts
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-teal-700 dark:text-teal-400 flex items-center">
          <Bookmark className="h-5 w-5 mr-2" />
          Saved Posts
        </h2>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-teal-200 hover:border-teal-300 dark:border-teal-800 dark:hover:border-teal-700"
          onClick={refreshPosts}
          disabled={isRefreshing}
        >
          <RefreshCcw
            className={`h-4 w-4 text-teal-600 dark:text-teal-400 ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>

      {/* Posts list with staggered animation */}
      <AnimatePresence>
        <div className="space-y-6">
          {savedPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="backdrop-blur-sm"
            >
              <Card className="w-full overflow-hidden border-teal-100 dark:border-teal-900/50 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="border border-teal-200 dark:border-teal-800">
                        <AvatarImage src={post.author?.profileImage} />
                        <AvatarFallback className="bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900 dark:to-blue-900">
                          <User className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
                          {post.author?.name}
                          <Badge
                            variant="outline"
                            className="ml-2 text-xs px-1 py-0 h-5 border-teal-200 dark:border-teal-900 text-teal-600 dark:text-teal-400"
                          >
                            {post.privacy === "public" && (
                              <Globe className="h-3 w-3 mr-1" />
                            )}
                            {post.privacy === "friends" && (
                              <Users className="h-3 w-3 mr-1" />
                            )}
                            {post.privacy === "private" && (
                              <Lock className="h-3 w-3 mr-1" />
                            )}
                            {post.privacy}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatPostDate(post.createdAt)}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full hover:bg-teal-50 dark:hover:bg-teal-900/20"
                        >
                          <MoreHorizontal className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem
                          onClick={() => handleUnsavePost(post.id)}
                          className="text-rose-600 dark:text-rose-400 focus:text-rose-700 dark:focus:text-rose-300 focus:bg-rose-50 dark:focus:bg-rose-900/20"
                        >
                          <BookmarkMinus className="h-4 w-4 mr-2" />
                          Unsave Post
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleSharePost(post.id)}
                          className="text-teal-600 dark:text-teal-400 focus:text-teal-700 dark:focus:text-teal-300 focus:bg-teal-50 dark:focus:bg-teal-900/20"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share Post
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            window.open(`/posts/${post.id}`, "_blank")
                          }
                          className="text-blue-600 dark:text-blue-400 focus:text-blue-700 dark:focus:text-blue-300 focus:bg-blue-50 dark:focus:bg-blue-900/20"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in New Tab
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            toast({
                              title: "Post reported",
                              description:
                                "Thank you for your report. We'll review this content.",
                            });
                          }}
                          className="text-amber-600 dark:text-amber-400 focus:text-amber-700 dark:focus:text-amber-300 focus:bg-amber-50 dark:focus:bg-amber-900/20"
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
                      "whitespace-pre-wrap text-gray-700 dark:text-gray-300",
                      post.content.length > 250 && expandedPost !== post.id
                        ? "line-clamp-3"
                        : ""
                    )}
                  >
                    {post.content}
                  </div>

                  {post.content.length > 250 && (
                    <Button
                      variant="link"
                      className="p-0 h-auto mt-1 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
                      onClick={() =>
                        setExpandedPost(
                          expandedPost === post.id ? null : post.id
                        )
                      }
                    >
                      {expandedPost === post.id ? "Show less" : "Show more"}
                    </Button>
                  )}

                  {post.media && (
                    <div
                      className="mt-3 rounded-lg overflow-hidden cursor-pointer group relative"
                      onClick={() =>
                        setViewingMedia({
                          url: post.media!,
                          type: post.mediaType || "image",
                        })
                      }
                    >
                      {post.mediaType === "video" ? (
                        <video
                          src={post.media}
                          controls
                          className="w-full max-h-[400px] object-contain bg-muted/10 rounded-lg"
                        />
                      ) : (
                        <div className="relative">
                          <Image
                            src={post.media || "/placeholder.svg"}
                            alt="Post media"
                            width={600}
                            height={400}
                            className="w-full max-h-[400px] object-contain bg-muted/10 rounded-lg transition-transform duration-500 group-hover:scale-[1.01]"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                            <div className="bg-white/80 dark:bg-black/60 p-3 rounded-full backdrop-blur-sm">
                              <Eye className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-2">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex space-x-2">
                      <Button
                        variant={post.isLiked ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "rounded-full transition-all duration-300 group",
                          post.isLiked
                            ? "bg-pink-500 hover:bg-pink-600 text-white"
                            : "hover:border-pink-300 dark:hover:border-pink-700"
                        )}
                        onClick={() => handleLikePost(post.id)}
                      >
                        <Heart
                          className={cn(
                            "h-4 w-4 mr-1.5 transition-transform",
                            post.isLiked
                              ? "fill-white"
                              : "group-hover:fill-pink-200 dark:group-hover:fill-pink-900",
                            animateHearts[post.id] && "scale-150"
                          )}
                        />
                        <motion.span
                          key={likeCounters[post.id] || post.likes}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {likeCounters[post.id] || post.likes}
                        </motion.span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full hover:border-blue-300 dark:hover:border-blue-700 group transition-all duration-300"
                        onClick={() =>
                          window.open(`/posts/${post.id}`, "_blank")
                        }
                      >
                        <MessageCircle className="h-4 w-4 mr-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                        {post.comments}
                      </Button>
                    </div>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-teal-50 dark:hover:bg-teal-900/20"
                            onClick={() => handleSharePost(post.id)}
                          >
                            <Share2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
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

          {/* Loading animation for refresh */}
          {isRefreshing && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-teal-600 dark:text-teal-400" />
            </div>
          )}
        </div>
      </AnimatePresence>

      {/* Media Viewer with enhanced controls */}
      {viewingMedia && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg"
          onClick={() => setViewingMedia(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] p-4 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full border-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setViewingMedia(null);
              }}
            >
              <X className="h-4 w-4 text-white" />
            </Button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-lg overflow-hidden bg-black/30 backdrop-blur-sm"
            >
              {viewingMedia.type === "video" ? (
                <video
                  src={viewingMedia.url}
                  controls
                  autoPlay
                  className="max-h-[80vh] max-w-full mx-auto rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <Image
                  src={viewingMedia.url || "/placeholder.svg"}
                  alt="Media preview"
                  width={1200}
                  height={800}
                  className="max-h-[80vh] max-w-full object-contain mx-auto rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </motion.div>

            <div className="absolute bottom-6 right-6 flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(viewingMedia.url, "_blank");
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Original
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  const a = document.createElement("a");
                  a.href = viewingMedia.url;
                  a.download = "download";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);

                  toast({
                    title: "Download started",
                    description: "Your media is being downloaded",
                  });
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SavedPostsList;
