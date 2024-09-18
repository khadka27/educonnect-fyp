"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useTheme } from "next-themes";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";
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

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { theme } = useTheme();
  const { toast } = useToast();
  const [ref, inView] = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  const [comments, setComments] = useState<CommentsState>({});

  const isLiked = posts.some((post) => post.isLiked);
  const { data: session } = useSession(); // Retrieves the user session
  const userId = session?.user?.id;

  // const fetchPosts = useCallback(
  //   async (pageNumber: number) => {
  //     try {
  //       const response = await axios.get(`/api/posts?page=${pageNumber}`);
  //       const fetchedPosts = response.data;

  //       if (Array.isArray(fetchedPosts.posts)) {
  //         setPosts((prevPosts) => [...prevPosts, ...fetchedPosts.posts]);
  //         setHasMore(fetchedPosts.hasMore);
  //       } else {
  //         console.error("Error: 'posts' is not an array", fetchedPosts);
  //         toast({
  //           title: "Error",
  //           description:
  //             "There was an error fetching posts. Please try again later.",
  //           variant: "destructive",
  //         });
  //       }

  //       setIsLoading(false);
  //     } catch (error) {
  //       console.error("Error fetching posts:", error);
  //       setIsLoading(false);
  //       toast({
  //         title: "Error",
  //         description:
  //           "There was an error fetching posts. Please try again later.",
  //         variant: "destructive",
  //       });
  //     }
  //   },
  //   [toast]
  // );

  // useEffect(() => {
  //   fetchPosts(page);
  // }, [page, fetchPosts]);

  // useEffect(() => {
  //   if (inView && hasMore && !isLoading) {
  //     setPage((prevPage) => prevPage + 1);
  //   }
  // }, [inView, hasMore, isLoading]);

  const fetchPosts = useCallback(
    async (pageNumber: number) => {
      try {
        const response = await axios.get(`/api/posts?page=${pageNumber}`);
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

  const handleLike = useCallback(
    async (postId: string, userId: string) => {
      try {
        const response = await axios.post(`/api/posts/${postId}/like`, {
          userId,
          type: "like", // Assuming 'like' is the type you want to set
        });

        if (response.status === 200) {
          // Update posts state based on server response
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === postId ? { ...post, isLiked: !post.isLiked } : post
            )
          );
        } else {
          toast({
            title: "Error",
            description:
              "There was an error liking the post. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error liking the post:", error);
        toast({
          title: "Error",
          description: "There was an error liking the post. Please try again.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const handleSave = useCallback(
    async (postId: string) => {
      try {
        await axios.post(`/api/posts/${postId}/saved-posts`);
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, isSaved: !post.isSaved } : post
          )
        );
      } catch (error) {
        console.error("Error saving the post:", error);
        toast({
          title: "Error",
          description: "There was an error saving the post. Please try again.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  // const handleComment = useCallback(
  //   async (postId: string, comment: string) => {
  //     if (!userId) {
  //       toast({
  //         title: "Error",
  //         description: "You need to be logged in to comment.",
  //         variant: "destructive",
  //       });
  //       return;
  //     }

  //     try {
  //       const response = await axios.post(`/api/posts/${postId}/comments`, {
  //         postId,
  //         content: comment,
  //         userId,
  //       });

  //       const newComment = response.data;
  //       setPosts((prevPosts) =>
  //         prevPosts.map((post) =>
  //           post.id === postId
  //             ? { ...post, comments: [...post.comments, newComment] }
  //             : post
  //         )
  //       );

  //       toast({
  //         title: "Comment added",
  //         description: "Your comment has been added successfully.",
  //       });
  //     } catch (error) {
  //       console.error("Error adding comment:", error);
  //       toast({
  //         title: "Error",
  //         description:
  //           "There was an error adding your comment. Please try again.",
  //         variant: "destructive",
  //       });
  //     }
  //   },
  //   [userId, toast]
  // );


  const handleComment = useCallback(async (postId: string, comment: string) => {
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
        description: "There was an error adding your comment. Please try again.",
        variant: "destructive",
      });
    }
  }, [userId, toast]);
  
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
                post={post}
                onLike={() => handleLike(post.id, post.userId)}
                onSave={() => handleSave(post.id)}
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

export default PostList;
