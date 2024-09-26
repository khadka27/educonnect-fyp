"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useTheme } from "next-themes";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";
// import TimelineComponent from "@/components/profile/Timeline"
import PostComponent from "@/components/post/post";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";

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

interface TimelineListProps{
  userId: string;
}

const TimelineList: React.FC<TimelineListProps> = ({ userId }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { theme } = useTheme();
  const { toast } = useToast();
  const [ref] = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  const [comments, setComments] = useState<CommentsState>({});

  // const isLiked = posts.some((post) => post.isLiked);
 // Retrieves the user session
  // const userId = session?.user?.id;

  useEffect(() => {
    if (userId) {
      fetchPosts(page);
    }
  }, [userId]);

  const fetchPosts = useCallback(
    async (pageNumber: number) => {
      try {
        const response = await axios.get(
          `/api/posts/timeline?userId=${userId}&page=${page}`
        );
        const fetchedPosts = response.data;

        if (Array.isArray(fetchedPosts.posts)) {
          setPosts((prevPosts) => {
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
      } catch (error) {
        console.error("Error fetching posts:", error);
        setIsLoading(false);
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

  useEffect(() => {
    fetchPosts(page);
  }, [page, fetchPosts]);

  // Handle loading more posts when "Load More" button is clicked
  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const [postLikes, setPostLikes] = useState<{
    [key: string]: boolean | undefined;
  }>(posts.reduce((acc, post) => ({ ...acc, [post.id]: post.isLiked }), {}));

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
    }
  };

  //   try {
  //     // Optimistically update the save status
  //     setPosts((prevPosts) =>
  //       prevPosts.map((post) =>
  //         post.id === postId
  //           ? { ...post, isSaved: !(post.isSaved ?? false) }
  //           : post
  //       )
  //     );

  //     // Make the API call to update the save status
  //     await axios.post(`/api/posts/${postId}/saved-posts`, { userId });
  //   } catch (error) {
  //     console.error("Error saving the post:", error);
  //     // Revert the save status if there's an error
  //     setPosts((prevPosts) =>
  //       prevPosts.map((post) =>
  //         post.id === postId
  //           ? { ...post, isSaved: post.isSaved ?? false }
  //           : post
  //       )
  //     );
  //   }
  // };

  // const handleSavePost = async (postId: string) => {
  //   try {
  //     // Optimistically toggle save status
  //     setPosts((prevPosts) =>
  //       prevPosts.map((post) =>
  //         post.id === postId
  //           ? { ...post, isSaved: !(post.isSaved ?? false) }
  //           : post
  //       )
  //     );

  //     await axios.post(`/api/posts/${postId}/saved-posts`, { userId });
  //     toast({
  //       title: "Post saved",
  //       description: "The post has been saved successfully!",
  //       variant: "default",
  //     });
  //   } catch (error) {
  //     console.error("Error saving post:", error);
  //     toast({
  //       title: "Error",
  //       description: "There was an error saving the post.",
  //       variant: "destructive",
  //     });
  //     // Revert save status on error
  //     setPosts((prevPosts) =>
  //       prevPosts.map((post) =>
  //         post.id === postId
  //           ? { ...post, isSaved: post.isSaved ?? false }
  //           : post
  //       )
  //     );
  //   }
  // };

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
          description: "The post has been unsaved.",
          variant: "default",
        });
      } else {
        await axios.post(`/api/posts/${postId}/saved-posts`, { userId });
        toast({
          title: "Post saved",
          description: "The post has been saved.",
          variant: "default",
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
        setComments((prevComments: CommentsState) => ({
          ...prevComments,
          [postId]: {
            data: [...(prevComments[postId]?.data || []), newComment],
            hasMore: prevComments[postId]?.hasMore || false,
          },
        }));

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
    <div className="w-full mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <Skeleton className="h-48 w-full mb-4" />
      <div className="flex justify-between">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );

  return (
    <div
      className={`w-full px-4 sm:px-6 md:px-8 lg:px-[25%] py-8 min-h-screen ${
        theme === "light"
          ? "bg-gradient-to-br from-green-50 to-blue-50"
          : "bg-gradient-to-br dark:from-gray-900 dark:to-gray-800"
      }`}
    >
      <h1 className="text-3xl font-bold text-center text-green-600 dark:text-green-400 mb-8">
        Latest Posts
      </h1>
      {posts.length === 0 && !isLoading ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-3">
          No posts available. Check back later!
        </div>
      ) : (
        <AnimatePresence>
          {posts.map((post, index) => (
            <motion.div
              key={`${post.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <PostComponent
                key={post.id}
                post={post}
                isLiked={postLikes[post.id] ?? false} // Pass the local like status
                onLike={() => handleLike(post.id, post.userId)}
                onSave={() => handleSave(post.id, post.isSaved ?? false)}
                onComment={(comment) => handleComment(post.id, comment)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
      {isLoading && (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {hasMore && (
        <div ref={ref} className="h-20 flex items-center justify-center">
          {isLoading && <PostSkeleton />}
        </div>
      )}
    </div>
  );
};

export default TimelineList;
