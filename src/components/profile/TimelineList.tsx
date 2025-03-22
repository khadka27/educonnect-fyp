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

  // Refresh posts
  const refreshPosts = useCallback(() => {
    setIsRefreshing(true);
    setPage(1);
    fetchPosts(1);
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

  // Handle like
  const handleLike = async (postId: string, userId: string) => {
    try {
      // Optimistically update the like status
      setPostLikes((prev) => ({ ...prev, [postId]: !prev[postId] }));

      // Make the API call to update the like status
      await axios.post(`/api/posts/${postId}/like`, { userId, type: "like" });
    } catch (error) {
      console.error("Error liking the post:", error);
      // Revert the like status if there's an error
      setPostLikes((prev) => ({ ...prev, [postId]: !prev[postId] }));

      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle save
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

  // Handle comment
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

        // Update post comments
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

  // Render post skeleton
  const PostSkeleton = () => (
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
  );

  // Render filters
  const renderFilters = () => {
    const filters = [
      { id: "all", label: "All Posts" },
      { id: "trending", label: "Trending" },
      { id: "latest", label: "Latest" },
      { id: "media", label: "Media" },
      { id: "saved", label: "Saved" },
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
              activeFilter === filter.id &&
                "bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600"
            )}
            onClick={() => handleFilterChange(filter.id)}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-full mb-4">
        <Search className="h-12 w-12 text-green-600 dark:text-green-400" />
      </div>
      <h2 className="text-xl font-semibold mb-2">No posts found</h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
        {activeFilter === "all"
          ? "There are no posts to display at the moment. Check back later!"
          : `No posts found with the "${activeFilter}" filter. Try a different filter.`}
      </p>
      {activeFilter !== "all" && (
        <Button
          onClick={() => handleFilterChange("all")}
          className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600"
        >
          View all posts
        </Button>
      )}
    </div>
  );

  // Render error state
  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-full mb-4">
        <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
        {error || "There was an error loading posts. Please try again."}
      </p>
      <Button
        onClick={refreshPosts}
        className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Try again
      </Button>
    </div>
  );

  return (
    <div
      ref={timelineRef}
      className={`w-full px-4 sm:px-6 md:px-8 lg:px-[15%] py-8 min-h-screen ${
        theme === "light"
          ? "bg-gradient-to-br from-green-50 to-blue-50"
          : "bg-gradient-to-br dark:from-gray-900 dark:to-gray-800"
      }`}
    >
      {/* Header with filters */}
      <div className="sticky top-0 z-10 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 backdrop-blur-sm pb-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
            Latest Posts
          </h1>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700"
              onClick={refreshPosts}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4 text-green-600 dark:text-green-400",
                  isRefreshing && "animate-spin"
                )}
              />
              <span className="sr-only">Refresh</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700 md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 text-green-600 dark:text-green-400" />
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
                {PostSkeleton()}
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
                <PostComponent
                  key={post.id}
                  post={post}
                  isLiked={postLikes[post.id] ?? false}
                  onLike={() => handleLike(post.id, post.userId)}
                  onSave={() => handleSave(post.id, post.isSaved ?? false)}
                  onComment={(comment) => handleComment(post.id, comment)}
                />
              </motion.div>
            ))}
        </AnimatePresence>

        {/* Load more indicator */}
        {hasMore && !isLoading && !error && posts.length > 0 && (
          <div ref={ref} className="flex justify-center py-8">
            {isLoadingMore ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-green-600 dark:text-green-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Loading more posts...
                </p>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={handleLoadMore}
                className="rounded-full border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700"
              >
                <ChevronDown className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                Load more posts
              </Button>
            )}
          </div>
        )}

        {/* End of posts message */}
        {!hasMore && !isLoading && !error && posts.length > 0 && (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <p>You've reached the end of the timeline</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineList;
