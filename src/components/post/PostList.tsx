/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useTheme } from "next-themes";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";
import PostComponent from "src/components/post/post";
import { Skeleton } from "src/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { Button } from "src/components/ui/button";
import {
  RefreshCw,
  Filter,
  Search,
  ArrowUp,
  Loader,
  LayoutGrid,
  ListIcon,
  X,
  Calendar,
  Bookmark,
  Heart,
  MessageSquare,
  ImageIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import { Input } from "src/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "src/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Badge } from "src/components/ui/badge";

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
  savesCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  likesCount?: number; // Added likesCount property
  commentsCount?: number; // Added commentsCount property
  reactions?: Array<{
    id: string;
    type: string;
  }>;
}

interface CommentsState {
  [postId: string]: {
    data: Comment[];
    hasMore: boolean;
  };
}

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { theme } = useTheme();
  const { toast } = useToast();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const [comments, setComments] = useState<CommentsState>({});
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = useCallback(
    async (pageNumber: number, refresh = false) => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/posts?page=${pageNumber}`);
        const fetchedPosts = response.data;

        if (Array.isArray(fetchedPosts.posts)) {
          setPosts((prevPosts) => {
            if (refresh) return fetchedPosts.posts;

            // Create a set of existing post IDs
            const existingPostIds = new Set(prevPosts.map((post) => post.id));

            // Filter out duplicates from the new posts
            const uniquePosts = fetchedPosts.posts.filter(
              (post: { id: string }) => !existingPostIds.has(post.id)
            );

            return [...prevPosts, ...uniquePosts];
          });
          setHasMore(fetchedPosts.hasMore);
        } else {
          console.error("Error: 'posts' is not an array", fetchedPosts);
          toast({
            title: "Error",
            description:
              "There was an error fetching posts. Please try again later.",
            variant: "destructive",
          });
        }

        setIsLoading(false);
        setIsRefreshing(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setIsLoading(false);
        setIsRefreshing(false);
        toast({
          title: "Error",
          description:
            "There was an error fetching posts. Please try again later.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  // Filter posts based on active filter and search query
  useEffect(() => {
    let result = [...posts];

    // Apply filter
    if (activeFilter === "liked") {
      result = result.filter((post) => post.isLiked);
    } else if (activeFilter === "saved") {
      result = result.filter((post) => post.isSaved);
    } else if (activeFilter === "with-comments") {
      result = result.filter(
        (post) => post.comments && post.comments.length > 0
      );
    } else if (activeFilter === "with-media") {
      result = result.filter((post) => post.postUrl || post.fileUrl);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (post) =>
          post.content?.toLowerCase().includes(query) ||
          post.user?.username?.toLowerCase().includes(query)
      );
    }

    setFilteredPosts(result);
  }, [posts, activeFilter, searchQuery]);

  useEffect(() => {
    fetchPosts(page);
  }, [page, fetchPosts]);

  useEffect(() => {
    if (inView && !isLoading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [inView, isLoading, hasMore]);

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Focus search input when search is opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const refreshPosts = () => {
    setIsRefreshing(true);
    setPage(1);
    fetchPosts(1, true);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [postLikes, setPostLikes] = useState<{
    [key: string]: boolean | undefined;
  }>({});

  // Initialize post likes from fetched posts
  useEffect(() => {
    const likes: { [key: string]: boolean | undefined } = {};
    posts.forEach((post) => {
      likes[post.id] = post.isLiked;
    });
    setPostLikes((prev) => ({ ...prev, ...likes }));
  }, [posts]);

  const handleLike = async (postId: string, userId: string) => {
    try {
      // Optimistically update the like status
      setPostLikes((prev) => ({ ...prev, [postId]: !prev[postId] }));

      // Optimistically update the post in the posts array
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            // Update like count in addition to like status
            const likesCount =
              post.likesCount !== undefined
                ? post.isLiked
                  ? post.likesCount - 1
                  : post.likesCount + 1
                : post.isLiked
                ? 0
                : 1;

            return {
              ...post,
              isLiked: !post.isLiked,
              likesCount,
            };
          }
          return post;
        })
      );

      // Make the API call to update the like status
      const response = await axios.post(`/api/posts/${postId}/like`, {
        userId,
        type: "like",
      });
      const { liked, likeCount } = response.data;

      // Update with actual server value
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              isLiked: liked,
              likesCount: likeCount,
            };
          }
          return post;
        })
      );

      // Show a subtle toast notification
      toast({
        title: liked ? "Post liked" : "Post unliked",
        description: liked
          ? "You've liked this post"
          : "You've removed your like",
        variant: "default",
      });
    } catch (error) {
      console.error("Error liking the post:", error);
      // Revert the like status if there's an error
      setPostLikes((prev) => ({ ...prev, [postId]: !prev[postId] }));

      // Revert the post in the posts array
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likesCount:
                  post.likesCount !== undefined
                    ? post.isLiked
                      ? post.likesCount + 1
                      : post.likesCount - 1
                    : post.isLiked
                    ? 1
                    : 0,
              }
            : post
        )
      );

      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (postId: string, isSaved: boolean) => {
    try {
      // Optimistically update the save status and count
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            // Update save count
            const savesCount =
              post.savesCount !== undefined
                ? isSaved
                  ? post.savesCount - 1
                  : post.savesCount + 1
                : isSaved
                ? 0
                : 1;

            return {
              ...post,
              isSaved: !isSaved,
              savesCount,
            };
          }
          return post;
        })
      );

      let response;
      if (isSaved) {
        response = await axios.delete(`/api/posts/${postId}/saved-posts`, {
          data: { userId },
        });
        toast({
          title: "Post unsaved",
          description: "The post has been removed from your saved items.",
          variant: "default",
        });
      } else {
        response = await axios.post(`/api/posts/${postId}/saved-posts`, {
          userId,
        });
        toast({
          title: "Post saved",
          description: "The post has been added to your saved items.",
          variant: "default",
        });
      }

      // Update with actual server count
      const { saveCount, saved } = response.data;
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              isSaved: saved,
              savesCount: saveCount,
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Error saving/unsaving post:", error);
      toast({
        title: "Error",
        description: "There was an error updating the post status.",
        variant: "destructive",
      });

      // Revert the save status and count on error
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              isSaved: isSaved,
              savesCount:
                post.savesCount !== undefined
                  ? isSaved
                    ? post.savesCount + 1
                    : post.savesCount - 1
                  : isSaved
                  ? 1
                  : 0,
            };
          }
          return post;
        })
      );
    }
  };

  const handleComment = useCallback(
    async (postId: string, comment: string) => {
      if (!userId) {
        toast({
          title: "Authentication required",
          description: "You need to be logged in to comment.",
          variant: "destructive",
        });
        return;
      }

      try {
        // Optimistically update comment count
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId) {
              const commentsCount = (post.commentsCount || 0) + 1;
              return { ...post, commentsCount };
            }
            return post;
          })
        );

        const response = await axios.post(`/api/posts/${postId}/comments`, {
          postId,
          content: comment,
          userId,
        });

        const newComment = response.data;

        // Update comments state
        setComments((prevComments: CommentsState) => ({
          ...prevComments,
          [postId]: {
            data: [...(prevComments[postId]?.data || []), newComment],
            hasMore: prevComments[postId]?.hasMore || false,
          },
        }));

        // Update post in posts array to include the new comment
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                comments: [
                  ...post.comments,
                  newComment as unknown as Post["comments"][number],
                ],
                // Keep the optimistic update for comment count
                commentsCount: post.commentsCount || 0,
              };
            }
            return post;
          })
        );

        toast({
          title: "Comment added",
          description: "Your comment has been posted successfully.",
        });
      } catch (error) {
        console.error("Error adding comment:", error);

        // Revert optimistic update if there's an error
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId) {
              const commentsCount = Math.max(0, (post.commentsCount || 1) - 1);
              return { ...post, commentsCount };
            }
            return post;
          })
        );

        toast({
          title: "Error",
          description:
            "There was an error adding your comment. Please try again.",
          variant: "destructive",
        });
      }
    },
    [userId, toast, setComments]
  );

  const fetchComments = useCallback(
    async (postId: string, pageNumber: number) => {
      try {
        const response = await axios.get(
          `/api/posts/${postId}/comments?page=${pageNumber}`
        );
        const fetchedComments = response.data;

        setComments((prevComments) => ({
          ...prevComments,
          [postId]: {
            ...prevComments[postId],
            data: [
              ...(prevComments[postId]?.data || []),
              ...fetchedComments.comments,
            ],
            hasMore: fetchedComments.hasMore,
          },
        }));
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    },
    []
  );

  const PostSkeleton = () => (
    <div className="w-full mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-3 w-[100px]" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <Skeleton className="h-64 w-full mb-4 rounded-md" />
      <div className="flex justify-between">
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );

  const displayedPosts =
    searchQuery || activeFilter !== "all" ? filteredPosts : posts;

  return (
    <div
      ref={containerRef}
      className={`w-full px-4 sm:px-6 md:px-8  py-4 min-h-screen ${
        theme === "light"
          ? "bg-gradient-to-br from-green-50 to-blue-50"
          : "bg-gradient-to-br dark:from-gray-900 dark:to-gray-800"
      }`}
    >
      {/* Header with controls */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-md p-3 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <h1 className="text-2xl font-bold text-primary">
            {activeFilter === "all"
              ? "Latest Posts"
              : activeFilter === "liked"
              ? "Liked Posts"
              : activeFilter === "saved"
              ? "Saved Posts"
              : activeFilter === "with-comments"
              ? "Posts with Comments"
              : "Posts with Media"}
          </h1>

          <div className="flex items-center gap-2">
            {isSearchOpen ? (
              <div className="relative">
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pr-8"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchOpen(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-4 w-4" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setActiveFilter("all")}
                  className={
                    activeFilter === "all" ? "bg-primary/10 text-primary" : ""
                  }
                >
                  All Posts
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setActiveFilter("liked")}
                  className={
                    activeFilter === "liked" ? "bg-primary/10 text-primary" : ""
                  }
                >
                  Liked Posts
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setActiveFilter("saved")}
                  className={
                    activeFilter === "saved" ? "bg-primary/10 text-primary" : ""
                  }
                >
                  Saved Posts
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setActiveFilter("with-comments")}
                  className={
                    activeFilter === "with-comments"
                      ? "bg-primary/10 text-primary"
                      : ""
                  }
                >
                  Posts with Comments
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setActiveFilter("with-media")}
                  className={
                    activeFilter === "with-media"
                      ? "bg-primary/10 text-primary"
                      : ""
                  }
                >
                  Posts with Media
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            >
              {viewMode === "list" ? (
                <LayoutGrid className="h-4 w-4" />
              ) : (
                <ListIcon className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={refreshPosts}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={cn("h-4 w-4", isRefreshing && "animate-spin")}
              />
            </Button>
          </div>
        </div>

        {/* Mobile filter tabs */}
        <div className="mt-3 sm:mt-4 md:hidden">
          <Tabs
            value={activeFilter}
            onValueChange={setActiveFilter}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="liked">Liked</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Search results info */}
      {searchQuery && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Found {filteredPosts.length}{" "}
          {filteredPosts.length === 1 ? "post" : "posts"} matching "
          {searchQuery}"
        </div>
      )}

      {/* Empty state */}
      {displayedPosts.length === 0 && !isLoading ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="mx-auto w-24 h-24 mb-4 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {searchQuery
              ? "No posts match your search"
              : activeFilter !== "all"
              ? `No ${activeFilter.replace("-", " ")} posts found`
              : "No posts available"}
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {searchQuery
              ? "Try a different search term or clear your search"
              : activeFilter !== "all"
              ? "Try a different filter or view all posts"
              : "Check back later for new content!"}
          </p>
          {(searchQuery || activeFilter !== "all") && (
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                  setIsSearchOpen(false);
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4"
              : "space-y-6"
          )}
        >
          <AnimatePresence>
            {displayedPosts.map((post, index) => (
              <motion.div
                key={`${post.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={viewMode === "grid" ? "h-full" : ""}
              >
                <PostComponent
                  post={post}
                  isLiked={postLikes[post.id] ?? false}
                  onLike={() => handleLike(post.id, post.userId)}
                  onSave={() => handleSave(post.id, post.isSaved ?? false)}
                  onComment={(comment) => handleComment(post.id, comment)}
                  viewMode={viewMode}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-4"
              : "space-y-6 mt-4"
          )}
        >
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}

      {/* Infinite scroll loading indicator */}
      {hasMore && !isLoading && (
        <div ref={ref} className="h-20 flex items-center justify-center">
          <Loader className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* End of feed message */}
      {!hasMore && displayedPosts.length > 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          You've reached the end of your feed
        </div>
      )}

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              variant="default"
              size="icon"
              className="rounded-full shadow-lg"
              onClick={scrollToTop}
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostList;
