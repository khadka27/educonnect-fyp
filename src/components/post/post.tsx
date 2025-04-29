"use client";

import type React from "react";
import { useState, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Send,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { date } from "zod";

interface PostProps {
  post: {
    id: string;
    content: string;
    postUrl?: string;
    fileUrl?: string;
    createdAt: string;
    userId: string;
    user?: {
      username: string;
      profileImage?: string;
      verified?: boolean;
    };
    comments: Array<{
      id: string;
      user?: {
        username: string;
        profileImage?: string;
      };
      content: string;
      createdAt: Date;
    }>;
    isLiked?: boolean;
    isSaved?: boolean;
    location?: string;
    mood?: string;
    tags?: string[];
    likesCount?: number; // Count of likes
    commentsCount?: number; // Count of comments
    savesCount?: number; // Count of saves
  };
  isLiked?: boolean;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onComment: (comment: string) => void;
  viewMode?: "list" | "grid";
}

const PostComponent: React.FC<PostProps> = ({
  post,
  isLiked = false,
  onLike,
  onSave,
  onComment,
  viewMode = "list",
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const { data: session } = useSession();

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      await onComment(commentText);
      setCommentText("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.user?.username || "User"}`,
          text: post.content,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const formatTimeAgo = (inputDate: string | Date) => {
    try {
      return formatDistanceToNow(new Date(inputDate), { addSuffix: true });
    } catch (error) {
      return "some time ago";
    }
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-lg border-emerald-100 dark:border-emerald-900/50",
        viewMode === "grid" ? "h-full" : ""
      )}
    >
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <Avatar className="border-2 border-emerald-200 dark:border-emerald-800 ring-2 ring-emerald-50 dark:ring-emerald-900">
              <AvatarImage
                src={
                  post.user?.profileImage ||
                  "/placeholder.svg?height=40&width=40&query=user"
                }
                alt={post.user?.username || "User"}
              />
              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-green-600 text-white font-medium dark:bg-emerald-900 dark:text-emerald-200">
                {post.user?.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1">
                {post.user?.username || "User"}
                {post.user?.verified && (
                  <span className="text-blue-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 inline-block"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812 3.066 3.066 0 00.723 1.745 3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </h3>
              <div className="flex flex-wrap items-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimeAgo(post.createdAt)}
                </p>

                {post.location && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 flex items-center">
                    •{" "}
                    <span className="ml-1 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 mr-0.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {post.location}
                    </span>
                  </span>
                )}

                {post.mood && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    • Feeling {post.mood}
                  </span>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white dark:bg-gray-800 border-emerald-100 dark:border-emerald-800"
            >
              <DropdownMenuItem onClick={() => onSave(post.id)}>
                {post.isSaved ? "Unsave post" : "Save post"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                Share post
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-500 dark:text-red-400">
                Report post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Post content */}
        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-3">
          {post.content}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 my-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 px-2 py-0.5 rounded-full text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Post media */}
        {(post.postUrl || post.fileUrl) && (
          <div className="mt-3 mb-4 rounded-lg overflow-hidden">
            {post.fileUrl?.match(/\.(mp4|webm|ogg)$/i) ? (
              <video
                src={post.fileUrl}
                controls
                className="w-full h-full rounded-lg object-cover"
              />
            ) : (
              <Image
                src={
                  post.postUrl ||
                  post.fileUrl ||
                  "/placeholder.svg?height=400&width=600&query=image"
                }
                alt="Post media"
                width={600}
                height={400}
                className="object-cover w-full h-full rounded-lg hover:scale-[1.02] transition-transform duration-300"
              />
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col">
        {/* Engagement counts */}
        <div className="flex justify-start items-center w-full mb-3 space-x-4 text-xs text-gray-500 dark:text-gray-400">
          {(post.savesCount ?? 0) > 0 && (
            <div className="flex items-center">
              <Heart className="h-3.5 w-3.5 mr-1 text-red-500" />
              <span>
                {post.likesCount} {post.likesCount === 1 ? "like" : "likes"}
              </span>
            </div>
          )}

          {(post.commentsCount ?? 0) > 0 ||
          (post.comments && post.comments.length > 0) ? (
            <div className="flex items-center">
              <MessageSquare className="h-3.5 w-3.5 mr-1 text-blue-500" />
              <span>
                {post.commentsCount || post.comments.length}{" "}
                {post.commentsCount === 1 || post.comments.length === 1
                  ? "comment"
                  : "comments"}
              </span>
            </div>
          ) : null}

          {(post.savesCount ?? 0) > 0 && (
            <div className="flex items-center">
              <Bookmark className="h-3.5 w-3.5 mr-1 text-emerald-500" />
              <span>
                {post.savesCount} {post.savesCount === 1 ? "save" : "saves"}
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center w-full">
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLike(post.id)}
                    className={cn(
                      "flex items-center gap-1 text-gray-600 dark:text-gray-400",
                      isLiked && "text-red-500 dark:text-red-400"
                    )}
                  >
                    <Heart
                      className={cn(
                        "h-5 w-5",
                        isLiked &&
                          "fill-red-500 text-red-500 dark:fill-red-400 dark:text-red-400"
                      )}
                    />
                    <span>{isLiked ? "Liked" : "Like"}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isLiked ? "Unlike this post" : "Like this post"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowComments(!showComments);
                      if (!showComments) {
                        setTimeout(() => {
                          commentInputRef.current?.focus();
                        }, 100);
                      }
                    }}
                    className="flex items-center gap-1 text-gray-600 dark:text-gray-400"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>Comment</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Comment on this post</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="flex items-center gap-1 text-gray-600 dark:text-gray-400"
                  >
                    <Share2 className="h-5 w-5" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share this post</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSave(post.id)}
                    className={cn(
                      "flex items-center gap-1 text-gray-600 dark:text-gray-400",
                      post.isSaved && "text-emerald-600 dark:text-emerald-400"
                    )}
                  >
                    <Bookmark
                      className={cn(
                        "h-5 w-5",
                        post.isSaved &&
                          "fill-emerald-600 text-emerald-600 dark:fill-emerald-400 dark:text-emerald-400"
                      )}
                    />
                    <span className="hidden sm:inline">
                      {post.isSaved ? "Saved" : "Save"}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{post.isSaved ? "Unsave this post" : "Save this post"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Comments section */}
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 w-full"
          >
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              {/* Comment input */}
              <div className="flex items-start space-x-2 mb-4">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={
                      session?.user?.image ||
                      "/placeholder.svg?height=32&width=32&query=user"
                    }
                    alt={session?.user?.name || "User"}
                  />
                  <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs">
                    {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 relative">
                  <Textarea
                    ref={commentInputRef}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="min-h-[60px] resize-none border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400 text-sm"
                  />
                  <Button
                    size="icon"
                    className="absolute right-2 bottom-2 h-6 w-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-1"
                    onClick={handleCommentSubmit}
                    disabled={!commentText.trim() || isSubmitting}
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Comments list */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((comment, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-2 group"
                    >
                      <Avatar className="w-7 h-7">
                        <AvatarImage
                          src={
                            comment.user?.profileImage ||
                            "/placeholder.svg?height=28&width=28&query=user"
                          }
                          alt={comment.user?.username || "User"}
                        />
                        <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs">
                          {comment.user?.username?.charAt(0).toUpperCase() ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                          <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                            {comment.user?.username || "User"}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {comment?.createdAt
                              ? formatTimeAgo(new Date(comment.createdAt))
                              : ""}
                          </p>
                          <p className="text-sm text-gray-800 dark:text-gray-200">
                            {comment.content}
                          </p>
                        </div>
                        <div className="flex items-center mt-1 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-xs text-gray-500">
                            {formatTimeAgo(comment.createdAt)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 px-1.5 text-xs"
                          >
                            Like
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 px-1.5 text-xs"
                          >
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-2">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PostComponent;
