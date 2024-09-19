"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
} from "lucide-react";
import { FacebookIcon, TwitterIcon, LinkedinIcon } from "react-share";
import axios from "axios";

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
}

const MAX_CONTENT_LENGTH = 300;
const INITIAL_COMMENTS_SHOWN = 2;

export default function PostComponent({
  post,
  isLiked,
  onLike,
  onSave,
  onComment,
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

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const isVideo = useCallback((url: string) => {
    return url?.match(/\.(mp4|webm|ogg)$/);
  }, []);

  const isYouTube = useCallback((url: string) => {
    return url?.match(
      /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&]{10,12})/
    );
  }, []);

  const getYouTubeVideoId = useCallback((url: string) => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&]{10,12})/
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
            videoRef.current.play();
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
    const diff = now.getTime() - date.getTime();

    if (diff < 0) return "In the future";
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30.44);
    const years = Math.floor(months / 12);

    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""}`;
    if (days < 30) return `${days} day${days !== 1 ? "s" : ""}`;
    if (months < 12) return `${months} month${months !== 1 ? "s" : ""}`;
    return `${years} year${years !== 1 ? "s" : ""}`;
  }, []);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      await onComment(newComment);
      setNewComment("");
    }
  };

  const handleDownload = useCallback(() => {
    if (post.fileUrl) {
      const link = document.createElement("a");
      link.href = post.fileUrl;
      link.download = `post-${post.id}-media${
        isVideo(post.fileUrl) ? ".mp4" : ".jpg"
      }`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [post.id, post.fileUrl, isVideo]);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
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
          videoRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  }, [isFullscreen]);

  const shareUrl = `https://localhost:3000/posts/${post.id}`;

  const renderContent = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);
    return parts.map((part, index) => {
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
      return part;
    });
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
    if (!post.postUrl) return null;

    if (isVideo(post.postUrl)) {
      return (
        <div className="relative" ref={videoContainerRef}>
          <video
            ref={videoRef}
            src={post.postUrl}
            className="w-full h-full object-cover rounded-md"
            controls={false}
            onClick={handlePlayPause}
            muted={isMuted}
            loop
            playsInline
          />
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
            <Button variant="secondary" size="icon" onClick={handlePlayPause}>
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button variant="secondary" size="icon" onClick={handleMute}>
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Button variant="secondary" size="icon" onClick={handleFullscreen}>
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      );
    } else if (isYouTube(post.content)) {
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
        <Image
          src={post.postUrl}
          alt="Post Image"
          layout="responsive"
          width={1920}
          height={1080}
          objectFit="contain"
          className="rounded-md cursor-pointer transition-transform duration-300 hover:scale-105"
          sizes="(max-width: 640px) 360px, (max-width: 1280px) 720px, 1080px"
          onClick={() => setIsMediaPreviewOpen(true)}
        />
      );
    }
  };

  return (
    <Card className="w-full mb-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 shadow-lg transition-all duration-300 hover:shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage
              src={
                post.user?.profileImage || "/placeholder.svg?height=40&width=40"
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
          <DropdownMenuContent>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <FacebookIcon size={24} round className="mr-2" />
                  Facebook
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <TwitterIcon size={24} round className="mr-2" />
                  Twitter
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LinkedinIcon size={24} round className="mr-2" />
                  LinkedIn
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {post.fileUrl && (
              <DropdownMenuItem onSelect={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download Media
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <p>
          {isContentExpanded
            ? post.content
              ? renderContent(post.content)
              : ""
            : renderContent(truncatedContent)}
        </p>
        {typeof post.content === "string" &&
          post.content.length > MAX_CONTENT_LENGTH && (
            <Button
              variant="link"
              onClick={() => setIsContentExpanded(!isContentExpanded)}
            >
              {isContentExpanded ? "Show less" : "Show more"}
            </Button>
          )}

        {post.postUrl && (
          <Dialog
            open={isMediaPreviewOpen}
            onOpenChange={setIsMediaPreviewOpen}
          >
            <DialogTrigger asChild>
              <div className="relative h-52 sm:h-80 md:h-96 cursor-pointer overflow-hidden rounded-md">
                {renderMedia()}
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[60vw] sm:max-h-[60vh] p-0">
              <div className="relative w-full h-full flex items-center justify-center bg-black bg-opacity-75">
                {isVideo(post.postUrl) ? (
                  <video
                    src={post.postUrl}
                    className="max-w-full max-h-full object-contain"
                    controls
                    autoPlay
                  />
                ) : isYouTube(post.content) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                      post.postUrl
                    )}`}
                    className="w-full h-full max-w-[80vw] max-h-[80vh]"
                    allowFullScreen
                  />
                ) : (
                  <div className="relative overflow-hidden">
                    <Image
                      src={post.postUrl}
                      alt="Post Image"
                      layout="responsive"
                      width={1500}
                      height={1500}
                      objectFit="contain"
                      className="w-full h-auto rounded-md cursor-pointer"
                      sizes="(max-width: 640px) 360px, (max-width: 1280px) 720px, 1080px"
                    />
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white"
                  onClick={() => setIsMediaPreviewOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="flex justify-between w-full mb-4">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className={`${
                liked ? "text-green-600 dark:text-green-400" : ""
              } px-2`}
              onClick={() => {
                onLike(post.id);
                setLiked(!liked);
              }}
              aria-label={liked ? "Unlike post" : "Like post"}
            >
              <Heart
                className={`h-5 w-5 ${liked ? "fill-current" : ""} mr-1`}
              />
              Like
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCommentBoxVisible(!isCommentBoxVisible)}
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
            className={`${
              post.isSaved ? "text-green-600 dark:text-green-400" : ""
            } px-2`}
            onClick={() => onSave(post.id)}
            aria-label={post.isSaved ? "Unsave post" : "Save post"}
          >
            <Bookmark
              className={`h-5 w-5 ${post.isSaved ? "fill-current" : ""} mr-1`}
            />
            Save
          </Button>
        </div>
        <div className="w-full">
          {post.comments.slice(0, commentsShown).map((comment) => (
            <div key={comment.id} className="flex items-start space-x-2 mb-2">
              <Avatar>
                <AvatarImage
                  src={
                    comment.user?.profileImage ||
                    "/placeholder.svg?height=40&width=40"
                  }
                  alt={comment.user?.username || "Unknown"}
                />
                <AvatarFallback>
                  {comment.user?.username?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {comment.user?.username || "Anonymous User"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {comment.content}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-600">
                  {formatCreatedAt(new Date(comment.createdAt))}
                </p>
              </div>
            </div>
          ))}

          {post.comments.length > commentsShown && (
            <Button
              variant="link"
              onClick={() => setCommentsShown(commentsShown + 5)}
              className="p-0 text-green-600 dark:text-green-400"
            >
              View more comments
            </Button>
          )}
        </div>
      </CardFooter>
      {isCommentBoxVisible && (
        <div className="px-4 pb-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="mb-2 border-green-200 focus:border-green-400"
          />
          <Button
            onClick={handleCommentSubmit}
            disabled={!newComment.trim()}
            className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white"
          >
            Post Comment
          </Button>
        </div>
      )}
    </Card>
  );
}
