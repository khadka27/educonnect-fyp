"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useTheme } from "next-themes";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";
import PostComponent from "src/components/post/post";
import { Skeleton } from "src/components/ui/skeleton";
import { Button } from "src/components/ui/button";
import { Card } from "src/components/ui/card";
import { useToast } from "src/hooks/use-toast";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

// Icons
import {
  RefreshCw,
  Filter,
  ChevronDown,
  Search,
  AlertCircle,
  Loader2,
  Calendar,
  TrendingUp,
  Image as ImageIcon,
  Bookmark,
  Clock,
} from "lucide-react";

interface Post {
  id: string;
  content: string;
  postUrl?: string;
  fileUrl?: string;
  createdAt: string;
  userId: string;
  user?: {
    username: string;
    profileImage?: string;
  };
  comments: Array<{
    id: string;
    user: {
      username: string;
      profileImage?: string;
    };
    content: string;
    createdAt: Date;
  }>;
  isLiked?: boolean;
  isSaved?: boolean;
  likes?: number;
}

interface CommentsState {
  [postId: string]: {
    data: Comment[];
    hasMore: boolean;
  };
}

interface TimelineListProps {
  userId: string;
}

const TimelineList: React.FC<TimelineListProps> = ({ userId }) => {
  // State
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [comments, setComments] = useState<CommentsState>({});
  const [postLikes, setPostLikes] = useState<{
    [key: string]: boolean | undefined;
  }>({});
  const [animateRefresh, setAnimateRefresh] = useState(false);

  // Refs
  const timelineRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { theme } = useTheme();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Initialize post likes based on posts
  useEffect(() => {
    if (posts.length > 0) {
      const likes = posts.reduce(
        (acc, post) => ({
          ...acc,
          [post.id]: post.isLiked,
        }),
        {}
      );

      setPostLikes(likes);
    }
  }, [posts]);

  // Fetch posts on mount
  useEffect(() => {
    if (userId) {
      fetchPosts(page);
    }
  }, [userId]);

  // Load more posts when scrolling to the bottom
  useEffect(() => {
    if (inView && hasMore && !isLoading && !isLoadingMore) {
      handleLoadMore();
    }
  }, [inView, hasMore, isLoading, isLoadingMore]);

  // Fetch posts function
  const fetchPosts = useCallback(
    async (pageNumber: number) => {
      try {
        setError(null);

        // Construct the API endpoint based on the filter
        let endpoint = `/api/posts/timeline?userId=${userId}&page=${pageNumber}`;

        if (activeFilter !== "all") {
          endpoint += `&filter=${activeFilter}`;
        }

        const response = await axios.get(endpoint);
        const fetchedPosts = response.data;

        if (Array.isArray(fetchedPosts.posts)) {
          if (pageNumber === 1) {
            setPosts(fetchedPosts.posts);
          } else {
            setPosts((prevPosts) => {
              // Create a set of existing post IDs
              const existingPostIds = new Set(prevPosts.map((post) => post.id));

              // Filter out duplicates from the new posts
              const uniquePosts = fetchedPosts.posts.filter(
                (post: { id: string }) => !existingPostIds.has(post.id)
              );

              return [...prevPosts, ...uniquePosts];
            });
          }

          setHasMore(fetchedPosts.hasMore);
        } else {
          console.error("Error: 'posts' is not an array", fetchedPosts);
          setError(
            "There was an error fetching posts. Please try again later."
          );
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError("There was an error fetching posts. Please try again later.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [userId, activeFilter]
  );

  // Refresh posts with animation
  const refreshPosts = useCallback(() => {
    setIsRefreshing(true);
    setAnimateRefresh(true);
    setPage(1);
    fetchPosts(1);

    // Reset animation after completion
    setTimeout(() => {
      setAnimateRefresh(false);
    }, 1000);
  }, [fetchPosts]);

  // Handle loading more posts
  const handleLoadMore = () => {
    if (hasMore && !isLoading && !isLoadingMore) {
      setIsLoadingMore(true);
      setPage((prevPage) => prevPage + 1);
      fetchPosts(page + 1);
    }
  };

  // Handle filter change
  const handleFilterChange = (filter: string) => {
    if (filter !== activeFilter) {
      setActiveFilter(filter);
      setPage(1);
      setIsLoading(true);
      setPosts([]);
      fetchPosts(1);
      setShowFilters(false);

      // Scroll to top when changing filters
      if (timelineRef.current) {
        timelineRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  // Handle like with animation
  const handleLike = async (postId: string, userId: string) => {
    try {
      // Optimistically update the like status
      setPostLikes((prev) => ({ ...prev, [postId]: !prev[postId] }));

      // Also update the likes count in the post
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            const newLikeStatus = !postLikes[postId];
            const likesCount = post.likes || 0;
            return {
              ...post,
              likes: newLikeStatus
                ? likesCount + 1
                : Math.max(0, likesCount - 1),
            };
          }
          return post;
        })
      );

      // Make the API call to update the like status
      await axios.post(`/api/posts/${postId}/like`, { userId, type: "like" });
    } catch (error) {
      console.error("Error liking the post:", error);
      // Revert the like status if there's an error
      setPostLikes((prev) => ({ ...prev, [postId]: !prev[postId] }));

      // Revert the likes count
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            const revertedLikeStatus = postLikes[postId];
            const likesCount = post.likes || 0;
            return {
              ...post,
              likes: revertedLikeStatus
                ? likesCount + 1
                : Math.max(0, likesCount - 1),
            };
          }
          return post;
        })
      );

      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle save with improved user feedback
  const handleSave = async (postId: string, isSaved: boolean) => {
    try {
      // Optimistically update the save status
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, isSaved: !isSaved } : post
        )
      );

      if (isSaved) {
        await axios.delete(`/api/posts/${postId}/saved-posts`, {
          data: { userId },
        });
        toast({
          title: "Post unsaved",
          description: "The post has been removed from your saved items.",
        });
      } else {
        await axios.post(`/api/posts/${postId}/saved-posts`, { userId });
        toast({
          title: "Post saved",
          description: "The post has been saved to your profile.",
        });
      }
    } catch (error) {
      console.error("Error saving/unsaving post:", error);
      toast({
        title: "Error",
        description: "There was an error updating the post status.",
        variant: "destructive",
      });
      // Revert the save status on error
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, isSaved: isSaved } : post
        )
      );
    }
  };

  // Handle comment with visual feedback
  const handleComment = useCallback(
    async (postId: string, comment: string) => {
      if (!userId) {
        toast({
          title: "Error",
          description: "You need to be logged in to comment.",
          variant: "destructive",
        });
        return;
      }

      try {
        const response = await axios.post(`/api/posts/${postId}/comments`, {
          postId,
          content: comment,
          userId,
        });

        const newComment: Comment = response.data;

        // Update comments state
        setComments((prevComments: CommentsState) => ({
          ...prevComments,
          [postId]: {
            data: [...(prevComments[postId]?.data || []), newComment],
            hasMore: prevComments[postId]?.hasMore || false,
          },
        }));

        // Update post comments with animation
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                comments: [...post.comments, newComment as any],
              };
            }
            return post;
          })
        );

        toast({
          title: "Comment added",
          description: "Your comment has been added successfully.",
        });
      } catch (error) {
        console.error("Error adding comment:", error);
        toast({
          title: "Error",
          description:
            "There was an error adding your comment. Please try again.",
          variant: "destructive",
        });
      }
    },
    [userId, toast]
  );

  // Improved post skeleton with different sizes for variety
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
      <Card className="w-full mb-4 overflow-hidden">
        <div className="p-4">
          <div className="flex items-center space-x-4 mb-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className={`${imageHeight[size]} w-full rounded-md`} />
          <div className="flex justify-between mt-4">
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-16 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-full" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </Card>
    );
  };

  // Render filters with icons
  const renderFilters = () => {
    const filters = [
      {
        id: "all",
        label: "All Posts",
        icon: <Calendar className="w-4 h-4 mr-1" />,
      },
      {
        id: "trending",
        label: "Trending",
        icon: <TrendingUp className="w-4 h-4 mr-1" />,
      },
      {
        id: "latest",
        label: "Latest",
        icon: <Clock className="w-4 h-4 mr-1" />,
      },
      {
        id: "media",
        label: "Media",
        icon: <ImageIcon className="w-4 h-4 mr-1" />,
      },
      {
        id: "saved",
        label: "Saved",
        icon: <Bookmark className="w-4 h-4 mr-1" />,
      },
    ];

    return (
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map((filter) => (
          <Button
            key={filter.id}
            variant={activeFilter === filter.id ? "default" : "outline"}
            size="sm"
            className={cn(
              "rounded-full whitespace-nowrap",
              activeFilter === filter.id
                ? "bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-700 dark:hover:bg-teal-600"
                : "border-teal-200 hover:border-teal-300 dark:border-teal-800 dark:hover:border-teal-700"
            )}
            onClick={() => handleFilterChange(filter.id)}
          >
            {filter.icon}
            {filter.label}
          </Button>
        ))}
      </div>
    );
  };

  // Improved empty state with animation
  const renderEmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/30 dark:to-blue-900/30 p-8 rounded-full mb-6 shadow-inner">
        <Search className="h-16 w-16 text-teal-600 dark:text-teal-400" />
      </div>
      <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
        No posts found
      </h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8 px-4">
        {activeFilter === "all"
          ? "There are no posts to display at the moment. Check back later or create a new post!"
          : `No posts found with the "${activeFilter}" filter. Try a different filter or check back later.`}
      </p>
      {activeFilter !== "all" && (
        <Button
          onClick={() => handleFilterChange("all")}
          className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-700 dark:hover:bg-teal-600 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          View all posts
        </Button>
      )}
    </motion.div>
  );

  // Enhanced error state with animation
  const renderErrorState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 p-8 rounded-full mb-6 shadow-inner">
        <AlertCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
      </div>
      <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
        Something went wrong
      </h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8 px-4">
        {error || "There was an error loading posts. Please try again."}
      </p>
      <Button
        onClick={refreshPosts}
        className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-700 dark:hover:bg-teal-600 rounded-full group transition-all duration-300 ease-in-out transform hover:scale-105"
      >
        <RefreshCw
          className={`h-4 w-4 mr-2 ${
            isRefreshing ? "animate-spin" : "group-hover:animate-spin"
          }`}
        />
        Try again
      </Button>
    </motion.div>
  );

  return (
    <div
      ref={timelineRef}
      className="w-full px-3 sm:px-6 md:px-8 lg:px-[10%] xl:px-[15%] py-6 min-h-[50vh]"
    >
      {/* Header with filters */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg pb-3 mb-6 px-3 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl sm:text-2xl font-bold text-teal-700 dark:text-teal-400 flex items-center">
            <Calendar className="h-5 w-5 mr-2 hidden sm:inline" />
            Timeline
          </h1>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "rounded-full border-teal-200 hover:border-teal-300 dark:border-teal-800 dark:hover:border-teal-700",
                animateRefresh && "animate-spin"
              )}
              onClick={refreshPosts}
              disabled={isRefreshing}
            >
              <RefreshCw className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span className="sr-only">Refresh</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-teal-200 hover:border-teal-300 dark:border-teal-800 dark:hover:border-teal-700 md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span className="sr-only">Filters</span>
            </Button>
          </div>
        </div>

        {/* Filters - always visible on md+ screens, toggleable on mobile */}
        <div
          className={cn(
            "md:block transition-all duration-300 overflow-hidden",
            showFilters
              ? "max-h-20 opacity-100"
              : "max-h-0 opacity-0 md:max-h-20 md:opacity-100"
          )}
        >
          {renderFilters()}
        </div>
      </div>

      {/* Main content */}
      <div className="space-y-4 max-w-3xl mx-auto">
        {/* Loading state with varying skeleton sizes */}
        {isLoading && (
          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PostSkeleton size="large" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <PostSkeleton size="medium" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <PostSkeleton size="small" />
            </motion.div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && renderErrorState()}

        {/* Empty state */}
        {!isLoading && !error && posts.length === 0 && renderEmptyState()}

        {/* Posts with staggered animation */}
        <AnimatePresence>
          {!isLoading &&
            !error &&
            posts.map((post, index) => (
              <motion.div
                key={`${post.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="mb-4"
              >
                <PostComponent
                  post={post}
                  isLiked={postLikes[post.id] ?? false}
                  onLike={() => handleLike(post.id, post.userId)}
                  onSave={() => handleSave(post.id, post.isSaved ?? false)}
                  onComment={(comment) => handleComment(post.id, comment)}
                />
              </motion.div>
            ))}
        </AnimatePresence>

        {/* Load more indicator with improved visuals */}
        {hasMore && !isLoading && !error && posts.length > 0 && (
          <div ref={ref} className="flex justify-center py-8">
            {isLoadingMore ? (
              <motion.div
                className="flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-600 dark:text-teal-400 mb-2" />
                  <div className="absolute inset-0 bg-white/10 dark:bg-black/10 rounded-full blur-xl animate-pulse"></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Loading more posts...
                </p>
              </motion.div>
            ) : (
              <Button
                variant="outline"
                onClick={handleLoadMore}
                className="rounded-full border-teal-200 hover:border-teal-300 dark:border-teal-800 dark:hover:border-teal-700 transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                <ChevronDown className="h-4 w-4 mr-2 text-teal-600 dark:text-teal-400 animate-bounce" />
                Load more posts
              </Button>
            )}
          </div>
        )}

        {/* End of posts message with animation */}
        {!hasMore && !isLoading && !error && posts.length > 0 && (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/30 dark:to-blue-900/30 text-teal-700 dark:text-teal-300 shadow-inner">
              <p>You've reached the end of the timeline</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TimelineList;
