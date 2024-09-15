"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Image from "next/image";
import { useTheme } from "next-themes";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Download,
  Link,
  Share2,
} from "lucide-react";

interface Comment {
  id: string;
  user: {
    username: string;
    profileImage?: string;
  };
  content: string;
  createdAt: Date;
}

interface PostProps {
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
  comments: Comment[];
  isLiked?: boolean;
  isSaved?: boolean;
}

export default function PostList({ post }: any) {
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { theme } = useTheme();

  const fetchPosts = async (pageNumber: number) => {
    try {
      const response = await axios.get(`/api/posts?page=${pageNumber}`);
      const fetchedPosts = response.data;

      if (Array.isArray(fetchedPosts.posts)) {
        setPosts((prevPosts) => [...prevPosts, ...fetchedPosts.posts]);
        setHasMore(fetchedPosts.hasMore);
      } else {
        console.error("Error: 'posts' is not an array", fetchedPosts);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop ===
      document.documentElement.offsetHeight
    ) {
      if (hasMore && !isLoading) {
        setPage((prevPage) => prevPage + 1);
      }
    }
  }, [hasMore, isLoading]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const formatCreatedAt = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 30) return `${days}d`;
    if (months < 12) return `${months}mo`;
    return `${years}y`;
  };

  const accentColor = theme === "dark" ? "text-green-400" : "text-green-600";
  const cardBgColor = theme === "dark" ? "bg-gray-600" : "bg-green-300";
  const cardTextColor = theme === "dark" ? "text-gray-100" : "text-gray-900";

  if (isLoading && posts.length === 0) {
    return (
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-[15%] xl:px-[25%] py-8">
        <Card className={`w-full mb-4 ${cardBgColor}`}>
          <CardHeader>
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-4 w-[250px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-40 w-full mt-4" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20 ml-2" />
            <Skeleton className="h-10 w-20 ml-2" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (posts.length === 0) {
    return <div>No posts available.</div>;
  }

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-[15%] xl:px-[25%] py-8 bg-green-100 dark:bg-gray-900 ">
      {posts.map((post) => (
        <Card key={post.id} className={`w-full mb-4 ${cardBgColor}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage
                  src={post.user?.profileImage || "/default-profile.png"}
                  alt={post.user?.username || "Unknown"}
                />
                <AvatarFallback>{post.user?.username[0] || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className={`font-semibold ${cardTextColor}`}>
                  {post.user?.username || "Unknown"}
                </h3>
                <p className={`text-sm ${cardTextColor}`}>
                  {formatCreatedAt(new Date(post.createdAt))}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Download image</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link className="mr-2 h-4 w-4" />
                  <span>Copy post link</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-4 w-4" />
                  <span>Share</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <div className="prose">
              <p
                className={`text-lg ${
                  post.postUrl || post.fileUrl ? "text-sm" : ""
                } ${cardTextColor}`}
              >
                {post.content}
              </p>
              {post.postUrl && (
                <div className="relative w-full h-64">
                  <Image
                    src={post.postUrl}
                    alt="Post Image"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                </div>
              )}
              {post.fileUrl && (
                <div className="relative w-full h-64">
                  <Image
                    src={post.fileUrl}
                    alt="File Attachment"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className={post.isLiked ? accentColor : ""}
            >
              <Heart className="h-5 w-5" />
              <span className="sr-only">Like</span>
            </Button>
            <Button variant="ghost" size="icon">
              <MessageCircle className="h-5 w-5" />
              <span className="sr-only">Comment</span>
            </Button>
            <Button variant="ghost" size="icon">
              <Bookmark className="h-5 w-5" />
              <span className="sr-only">Save</span>
            </Button>
          </CardFooter>
        </Card>
      ))}
      {isLoading && <div className="text-center">Loading more posts...</div>}
    </div>
  );
}
