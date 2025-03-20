"use client";

import type React from "react";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "src/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import { Textarea } from "src/components/ui/textarea";
import { Dialog, DialogContent, DialogTrigger } from "src/components/ui/dialog";
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
  Loader,
  Copy,
  Flag,
} from "lucide-react";
import { FacebookIcon, TwitterIcon, LinkedinIcon } from "react-share";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

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
  };
  onLike: (postId: string) => void;
  isLiked: boolean;
  onSave: (postId: string) => void;
  onComment: (comment: string) => void;
  viewMode?: "list" | "grid";
}

const MAX_CONTENT_LENGTH = 300;
const INITIAL_COMMENTS_SHOWN = 2;

export default function PostComponent({
  post,
  isLiked,
  onLike,
  onSave,
  onComment,
  viewMode = "list",
}: PostProps) {
  const [isCommentBoxVisible, setIsCommentBoxVisible] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isMediaPreviewOpen, setIsMediaPreviewOpen] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liked, setLiked] = useState(isLiked);
  const [commentsShown, setCommentsShown] = useState(INITIAL_COMMENTS_SHOWN);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Update local liked state when prop changes
  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  const isVideo = useCallback((url?: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg)$/i) !== null;
  }, []);

  const isYouTube = useCallback((url?: string) => {
    if (!url) return false;
    return (
      url.match(
        /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^/&]{10,12})/
      ) !== null
    );
  }, []);

  const getYouTubeVideoId = useCallback((url?: string) => {
    if (!url) return null;
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^/&]{10,12})/
    );
    return match ? match[1] : null;
  }, []);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (videoRef.current && !isPlaying) {
            videoRef.current.play().catch(() => {
              // Autoplay was prevented
              console.log("Autoplay prevented");
            });
            setIsPlaying(true);
          }
        } else {
          if (videoRef.current && isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
      });
    }, options);

    if (videoContainerRef.current) {
      observer.observe(videoContainerRef.current);
    }

    return () => {
      if (videoContainerRef.current) {
        observer.unobserve(videoContainerRef.current);
      }
    };
  }, [isPlaying]);

  const formatCreatedAt = useCallback((date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();

    if (diff < 60000) return "Just now";
    if (diff < 86400000)
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    return format(new Date(date), "MMM d, yyyy");
  }, []);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      setIsSubmitting(true);
      try {
        await onComment(newComment);
        setNewComment("");
        toast({
          title: "Comment added",
          description: "Your comment has been posted successfully!",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to post your comment. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleLikeClick = () => {
    setLiked(!liked);
    onLike(post.id);
  };

  const handleDownload = useCallback(() => {
    if (post.fileUrl || post.postUrl) {
      const url = post.fileUrl || post.postUrl;
      if (url) {
        const link = document.createElement("a");
        link.href = url;
        link.download = `post-${post.id}-media${
          isVideo(url) ? ".mp4" : ".jpg"
        }`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Download started",
          description: "Your media is being downloaded",
        });
      }
    }
  }, [post.id, post.fileUrl, post.postUrl, isVideo, toast]);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((err) => {
          console.error("Error playing video:", err);
        });
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleFullscreen = useCallback(() => {
    if (videoRef.current) {
      if (!isFullscreen) {
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen().catch((err) => {
            console.error("Error attempting to enable fullscreen:", err);
          });
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch((err) => {
            console.error("Error attempting to exit fullscreen:", err);
          });
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  }, [isFullscreen]);

  const shareUrl = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/posts/${post.id}`;

  const handleShare = (platform: string) => {
    let shareLink = "";

    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          shareUrl
        )}&text=${encodeURIComponent("Check out this post!")}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          shareUrl
        )}`;
        break;
      case "copy":
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied",
          description: "Post link copied to clipboard",
        });
        return;
    }

    if (shareLink) {
      window.open(shareLink, "_blank", "width=600,height=400");
      toast({
        title: "Sharing post",
        description: `Sharing to ${platform}`,
      });
    }
  };

  const handleReport = () => {
    toast({
      title: "Post reported",
      description:
        "Thank you for helping keep our community safe. We'll review this post.",
    });
  };

  const renderContent = (content: string) => {
    if (!content) return null;

    // Convert URLs to clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);

    // Convert hashtags to highlighted text
    const processedParts = parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {part}
          </a>
        );
      }

      // Process hashtags
      const hashtagRegex = /#(\w+)/g;
      const hashtagParts = part.split(hashtagRegex);

      return hashtagParts.map((hashtagPart, hIndex) => {
        if (hIndex % 2 === 1) {
          // It's a hashtag
          return (
            <span
              key={`${index}-${hIndex}`}
              className="text-primary font-medium"
            >
              #{hashtagPart}
            </span>
          );
        }
        return hashtagPart;
      });
    });

    return processedParts;
  };

  const truncatedContent = useMemo(() => {
    if (
      typeof post.content === "string" &&
      post.content.length <= MAX_CONTENT_LENGTH
    ) {
      return post.content;
    }
    return typeof post.content === "string"
      ? `${post.content.slice(0, MAX_CONTENT_LENGTH)}...`
      : "";
  }, [post.content]);

  const renderMedia = () => {
    const mediaUrl = post.postUrl || post.fileUrl;
    if (!mediaUrl) return null;

    if (isVideo(mediaUrl)) {
      return (
        <div className="relative" ref={videoContainerRef}>
          <video
            ref={videoRef}
            src={mediaUrl}
            className="w-full h-full object-cover rounded-md"
            controls={false}
            onClick={handlePlayPause}
            muted={isMuted}
            loop
            playsInline
          />
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="secondary"
              size="icon"
              onClick={handlePlayPause}
              className="bg-black/50 hover:bg-black/70"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 text-white" />
              ) : (
                <Play className="h-4 w-4 text-white" />
              )}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={handleMute}
              className="bg-black/50 hover:bg-black/70"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-white" />
              ) : (
                <Volume2 className="h-4 w-4 text-white" />
              )}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={handleFullscreen}
              className="bg-black/50 hover:bg-black/70"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4 text-white" />
              ) : (
                <Maximize className="h-4 w-4 text-white" />
              )}
            </Button>
          </div>
        </div>
      );
    } else if (post.content && isYouTube(post.content)) {
      const videoId = getYouTubeVideoId(post.content);
      return (
        <div className="relative pt-[56.25%]">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="absolute top-0 left-0 w-full h-full rounded-md"
            allowFullScreen
          />
        </div>
      );
    } else {
      return (
        <div
          className={cn(
            "relative overflow-hidden rounded-md cursor-pointer",
            viewMode === "grid" ? "h-48 sm:h-56" : "h-64 sm:h-80 md:h-96"
          )}
        >
          <Image
            src={mediaUrl || "/placeholder.svg"}
            alt="Post Image"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
            onClick={() => setIsMediaPreviewOpen(true)}
          />
        </div>
      );
    }
  };

  return (
    <>
      <Card
        className={cn(
          "w-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 hover:shadow-xl overflow-hidden",
          viewMode === "grid" ? "h-full flex flex-col" : ""
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-4">
            <Avatar className="border-2 border-primary/30">
              <AvatarImage
                src={
                  post.user?.profileImage ||
                  "/placeholder.svg?height=40&width=40"
                }
                alt={post.user?.username || "Unknown"}
              />
              <AvatarFallback>{post.user?.username?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                {post.user?.username || "Unknown"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatCreatedAt(new Date(post.createdAt))}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More options">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setShowShareOptions(!showShareOptions)}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              {(post.fileUrl || post.postUrl) && (
                <DropdownMenuItem onSelect={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Media
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleShare("copy")}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleReport} className="text-red-500">
                <Flag className="h-4 w-4 mr-2" />
                Report Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent
          className={cn("space-y-4", viewMode === "grid" ? "flex-grow" : "")}
        >
          {post.content && (
            <div className="text-gray-800 dark:text-gray-200">
              <p>
                {isContentExpanded
                  ? renderContent(post.content)
                  : renderContent(truncatedContent)}
              </p>
              {typeof post.content === "string" &&
                post.content.length > MAX_CONTENT_LENGTH && (
                  <Button
                    variant="link"
                    onClick={() => setIsContentExpanded(!isContentExpanded)}
                    className="p-0 h-auto text-primary"
                  >
                    {isContentExpanded ? "Show less" : "Show more"}
                  </Button>
                )}
            </div>
          )}

          {(post.postUrl || post.fileUrl) && (
            <Dialog
              open={isMediaPreviewOpen}
              onOpenChange={setIsMediaPreviewOpen}
            >
              <DialogTrigger asChild>
                <div className="cursor-pointer overflow-hidden rounded-md">
                  {renderMedia()}
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[80vw] p-0 bg-transparent border-none">
                <div className="relative w-full h-full flex items-center justify-center bg-black/90 rounded-lg">
                  {post.postUrl && isVideo(post.postUrl) ? (
                    <video
                      src={post.postUrl}
                      className="max-w-full max-h-[80vh] object-contain"
                      controls
                      autoPlay
                    />
                  ) : post.content && isYouTube(post.content) ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                        post.content
                      )}`}
                      className="w-full h-full max-w-[80vw] max-h-[80vh]"
                      allowFullScreen
                    />
                  ) : (
                    <div className="relative max-h-[80vh] max-w-[80vw]">
                      <Image
                        src={post.postUrl || post.fileUrl || ""}
                        alt="Post Image"
                        width={1200}
                        height={800}
                        className="object-contain max-h-[80vh]"
                      />
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => setIsMediaPreviewOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Share options */}
          <AnimatePresence>
            {showShareOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex space-x-2 py-2"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => handleShare("facebook")}
                >
                  <FacebookIcon size={16} round />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => handleShare("twitter")}
                >
                  <TwitterIcon size={16} round />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => handleShare("linkedin")}
                >
                  <LinkedinIcon size={16} round />
                  LinkedIn
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="flex justify-between w-full mb-4">
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className={`${
                  liked ? "text-red-600 dark:text-red-400" : ""
                } px-2`}
                onClick={handleLikeClick}
                aria-label={liked ? "Unlike post" : "Like post"}
              >
                <Heart
                  className={`h-5 w-5 ${liked ? "fill-red-500" : ""} mr-1`}
                />
                Like
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsCommentBoxVisible(!isCommentBoxVisible);
                  if (!isCommentBoxVisible && commentInputRef.current) {
                    setTimeout(() => commentInputRef.current?.focus(), 100);
                  }
                }}
                aria-label="Toggle comment box"
                className="px-2"
              >
                <MessageCircle className="h-5 w-5 mr-1" />
                Comment
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={`${post.isSaved ? "text-primary" : ""} px-2`}
              onClick={() => onSave(post.id)}
              aria-label={post.isSaved ? "Unsave post" : "Save post"}
            >
              <Bookmark
                className={`h-5 w-5 ${post.isSaved ? "fill-primary" : ""} mr-1`}
              />
              Save
            </Button>
          </div>

          <AnimatePresence>
            {post.comments && post.comments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full"
              >
                {post.comments.slice(0, commentsShown).map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start space-x-2 mb-3"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          comment.user?.profileImage ||
                          "/placeholder.svg?height=32&width=32"
                        }
                        alt={comment.user?.username || "Unknown"}
                      />
                      <AvatarFallback>
                        {comment.user?.username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                      <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                        {comment.user?.username || "Anonymous User"}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {comment.content}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatCreatedAt(new Date(comment.createdAt))}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {post.comments.length > commentsShown && (
                  <Button
                    variant="link"
                    onClick={() => setCommentsShown(commentsShown + 5)}
                    className="p-0 text-primary"
                  >
                    View more comments
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardFooter>

        <AnimatePresence>
          {isCommentBoxVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-4"
            >
              <form onSubmit={handleCommentSubmit} className="space-y-2">
                <Textarea
                  ref={commentInputRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="border-primary/20 focus:border-primary focus:ring-primary/30"
                />
                <Button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post Comment"
                  )}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </>
  );
}
