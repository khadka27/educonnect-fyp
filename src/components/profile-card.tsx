"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Settings,
  Edit,
  LogOut,
  FileText,
  BookOpen,
  MessageSquare,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
  className?: string;
}

interface UserData {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  bio?: string | null;
  address?: string | null;
  profileImage?: string | null;
  coverImage?: string | null;
  role: "USER" | "ADMIN" | "TEACHER";
  createdAt: string;
  isVerified: boolean;
  posts?: any[];
  _count?: {
    posts: number;
    comments: number;
    books: number;
    articles: number;
  };
}

export function ProfileCard({ className }: ProfileCardProps) {
  const { data: session, status } = useSession();
  const [isHovered, setIsHovered] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/user/${session.user.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch user data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchUserData();
    } else if (status !== "loading") {
      setLoading(false);
    }
  }, [session, status]);

  // Loading state
  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <Card
        className={cn(
          "overflow-hidden",
          theme === "dark"
            ? "bg-gray-900/90 dark:bg-gray-900 border-emerald-900/20"
            : "bg-white border-emerald-100",
          className
        )}
      >
        <div
          className={cn(
            "h-24",
            theme === "dark"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-800 dark:to-teal-800"
              : "bg-gradient-to-r from-emerald-400 to-teal-400"
          )}
        />
        <CardContent className="pt-0 pb-4 px-4">
          <div className="flex flex-col items-center -mt-12">
            <Skeleton
              className={cn(
                "h-24 w-24 rounded-full border-4",
                theme === "dark" ? "border-gray-900" : "border-white"
              )}
            />
            <Skeleton className="h-6 w-32 mt-4" />
            <Skeleton className="h-4 w-24 mt-2" />
            <Skeleton className="h-4 w-48 mt-4" />
            <div className="flex justify-between w-full mt-6">
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-9 w-full mt-4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Not authenticated state
  if (status === "unauthenticated" || !session) {
    return (
      <Card
        className={cn(
          "overflow-hidden",
          theme === "dark"
            ? "bg-gray-900/90 dark:bg-gray-900 border-emerald-900/20"
            : "bg-white border-emerald-100",
          className
        )}
      >
        <div
          className={cn(
            "h-24",
            theme === "dark"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-800 dark:to-teal-800"
              : "bg-gradient-to-r from-emerald-400 to-teal-400"
          )}
        />
        <CardContent className="pt-0 pb-4 px-4">
          <div className="flex flex-col items-center -mt-12">
            <div
              className={cn(
                "h-24 w-24 rounded-full border-4 flex items-center justify-center",
                theme === "dark"
                  ? "bg-emerald-200 dark:bg-emerald-800 border-gray-900 dark:border-gray-900"
                  : "bg-emerald-100 border-white"
              )}
            >
              <User
                className={cn(
                  "h-12 w-12",
                  theme === "dark"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-emerald-500"
                )}
              />
            </div>
            <h2
              className={cn(
                "text-xl font-bold mt-4",
                theme === "dark" ? "text-white" : "text-gray-800"
              )}
            >
              Welcome
            </h2>
            <p
              className={cn(
                "text-sm",
                theme === "dark" ? "text-emerald-400" : "text-emerald-600"
              )}
            >
              @guest
            </p>
            <p
              className={cn(
                "text-sm text-center mt-4",
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              )}
            >
              Sign in to access your profile and connect with others
            </p>
            <div className="w-full mt-6">
              <Button
                asChild
                className={cn(
                  "w-full text-white",
                  theme === "dark"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                )}
              >
                <Link href="/api/auth/signin">Sign In</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card
        className={cn(
          "overflow-hidden",
          theme === "dark"
            ? "bg-gray-900/90 dark:bg-gray-900 border-emerald-900/20"
            : "bg-white border-emerald-100",
          className
        )}
      >
        <div
          className={cn(
            "h-24",
            theme === "dark"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-800 dark:to-teal-800"
              : "bg-gradient-to-r from-emerald-400 to-teal-400"
          )}
        />
        <CardContent className="pt-0 pb-4 px-4">
          <div className="flex flex-col items-center -mt-12">
            <div
              className={cn(
                "h-24 w-24 rounded-full border-4 flex items-center justify-center",
                theme === "dark"
                  ? "bg-rose-200 dark:bg-rose-800 border-gray-900 dark:border-gray-900"
                  : "bg-rose-100 border-white"
              )}
            >
              <User
                className={cn(
                  "h-12 w-12",
                  theme === "dark"
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-rose-500"
                )}
              />
            </div>
            <h2
              className={cn(
                "text-xl font-bold mt-4",
                theme === "dark" ? "text-white" : "text-gray-800"
              )}
            >
              Error
            </h2>
            <p
              className={cn(
                "text-sm",
                theme === "dark" ? "text-rose-400" : "text-rose-600"
              )}
            >
              Could not load profile
            </p>
            <div className="w-full mt-6">
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white"
              >
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get user data from API response or session
  const user = userData || {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    profileImage: session.user.image,
    username: session.user.name?.toLowerCase().replace(/\s+/g, ""),
    role: session.user.role || "USER",
    createdAt: new Date().toISOString(),
    isVerified: false,
    bio: null, // Added bio property
    _count: {
      posts: 0,
      comments: 0,
      books: 0,
      articles: 0,
    },
  };

  // Format username
  const username =
    user.username || user.name?.toLowerCase().replace(/\s+/g, "") || "user";

  // Calculate join date
  const joinedDate = user.createdAt
    ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })
    : "recently";

  // Count posts and content
  const postsCount = user._count?.posts || 0;
  const commentsCount = user._count?.comments || 0;
  const contentCount = (user._count?.books || 0) + (user._count?.articles || 0);

  // Get role display name
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrator";
      case "TEACHER":
        return "Teacher";
      case "USER":
      default:
        return "Member";
    }
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return theme === "dark"
          ? "bg-purple-800/60 text-purple-300 border-purple-700"
          : "bg-purple-100 text-purple-700 border-purple-200";
      case "TEACHER":
        return theme === "dark"
          ? "bg-amber-800/60 text-amber-300 border-amber-700"
          : "bg-amber-100 text-amber-700 border-amber-200";
      case "USER":
      default:
        return theme === "dark"
          ? "bg-emerald-800/60 text-emerald-300 border-emerald-700"
          : "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
  };

  // Authenticated state
  return (
    <Card
      className={cn(
        "overflow-hidden",
        theme === "dark"
          ? "bg-gray-900/90 dark:bg-gray-900 border-emerald-900/20"
          : "bg-white border-emerald-100",
        className
      )}
    >
      <div
        className={cn(
          "h-24 relative",
          theme === "dark"
            ? "bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-800 dark:to-teal-800"
            : "bg-gradient-to-r from-emerald-400 to-teal-400"
        )}
      >
        {/* Decorative elements */}
        <div className="absolute top-2 left-4 w-8 h-8 rounded-full bg-white/20" />
        <div className="absolute top-6 left-12 w-4 h-4 rounded-full bg-white/10" />
        <div className="absolute top-4 right-8 w-6 h-6 rounded-full bg-white/15" />
        <div className="absolute bottom-2 right-4 w-5 h-5 rounded-full bg-white/10" />
        <div className="absolute -bottom-1 left-1/4 w-12 h-3 rounded-full bg-white/5" />
      </div>
      <CardContent className="pt-0 pb-4 px-4">
        <div className="flex flex-col items-center -mt-12">
          <motion.div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.05 }}
          >
            <div
              className={cn(
                "h-24 w-24 rounded-full overflow-hidden border-4",
                theme === "dark" ? "border-gray-900" : "border-white"
              )}
            >
              {user.profileImage ? (
                <Image
                  src={user.profileImage || "/placeholder.svg"}
                  alt={user.name || "Profile"}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div
                  className={cn(
                    "h-full w-full flex items-center justify-center",
                    theme === "dark"
                      ? "bg-emerald-200 dark:bg-emerald-800"
                      : "bg-emerald-100"
                  )}
                >
                  <User
                    className={cn(
                      "h-12 w-12",
                      theme === "dark"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-emerald-500"
                    )}
                  />
                </div>
              )}
            </div>
            {isHovered && (
              <Link
                href="/profile/edit"
                className={cn(
                  "absolute inset-0 flex items-center justify-center rounded-full border-4",
                  theme === "dark"
                    ? "bg-black/60 border-gray-900"
                    : "bg-black/40 border-white"
                )}
              >
                <Edit className="h-6 w-6 text-white" />
              </Link>
            )}
          </motion.div>

          <h2
            className={cn(
              "text-xl font-bold mt-4",
              theme === "dark" ? "text-white" : "text-gray-800"
            )}
          >
            {user.name || "User"}
          </h2>
          <p
            className={cn(
              "text-sm",
              theme === "dark" ? "text-emerald-400" : "text-emerald-600"
            )}
          >
            @{username}
          </p>

          {/* User role badge */}
          <div className="flex items-center mt-2 gap-2">
            <Badge
              className={`${getRoleColor(user.role)} hover:${getRoleColor(
                user.role
              )}`}
            >
              {getRoleDisplay(user.role)}
            </Badge>

            {user.isVerified && (
              <Badge
                className={cn(
                  theme === "dark"
                    ? "bg-blue-800/60 text-blue-300 border-blue-700"
                    : "bg-blue-100 text-blue-700 border-blue-200"
                )}
              >
                Verified
              </Badge>
            )}
          </div>

          {/* Bio or tagline */}
          <p
            className={cn(
              "text-sm text-center mt-4",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}
          >
            {user.bio ||
              (user.address
                ? `Based in ${user.address}`
                : "✨ Making education accessible and engaging for everyone ✨")}
          </p>

          {/* User stats */}
          <div className="w-full mt-4 grid grid-cols-3 gap-2">
            <div
              className={cn(
                "rounded-lg p-2 text-center",
                theme === "dark" ? "bg-gray-800/60" : "bg-emerald-50"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center mb-1",
                  theme === "dark" ? "text-emerald-400" : "text-emerald-600"
                )}
              >
                <FileText className="h-3 w-3 mr-1" />
                <span className="text-xs">Posts</span>
              </div>
              <p
                className={cn(
                  "font-bold",
                  theme === "dark" ? "text-white" : "text-gray-800"
                )}
              >
                {postsCount}
              </p>
            </div>
            <div
              className={cn(
                "rounded-lg p-2 text-center",
                theme === "dark" ? "bg-gray-800/60" : "bg-emerald-50"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center mb-1",
                  theme === "dark" ? "text-emerald-400" : "text-emerald-600"
                )}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                <span className="text-xs">Comments</span>
              </div>
              <p
                className={cn(
                  "font-bold",
                  theme === "dark" ? "text-white" : "text-gray-800"
                )}
              >
                {commentsCount}
              </p>
            </div>
            <div
              className={cn(
                "rounded-lg p-2 text-center",
                theme === "dark" ? "bg-gray-800/60" : "bg-emerald-50"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center mb-1",
                  theme === "dark" ? "text-emerald-400" : "text-emerald-600"
                )}
              >
                <BookOpen className="h-3 w-3 mr-1" />
                <span className="text-xs">Content</span>
              </div>
              <p
                className={cn(
                  "font-bold",
                  theme === "dark" ? "text-white" : "text-gray-800"
                )}
              >
                {contentCount}
              </p>
            </div>
          </div>

          {/* Joined date */}
          <div className="w-full mt-2">
            <div
              className={cn(
                "rounded-lg p-2 text-center",
                theme === "dark" ? "bg-gray-800/40" : "bg-emerald-50/60"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center",
                  theme === "dark"
                    ? "text-emerald-400/80"
                    : "text-emerald-600/80"
                )}
              >
                <Clock className="h-3 w-3 mr-1" />
                <span className="text-xs">Joined {joinedDate}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="w-full mt-4 flex gap-2">
            <Button
              asChild
              variant="outline"
              className={cn(
                "flex-1",
                theme === "dark"
                  ? "border-emerald-800 text-emerald-400 hover:bg-emerald-950 hover:text-emerald-300"
                  : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
              )}
            >
              <Link href={`/profile/${user.id}`}>My Profile</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="icon"
              className={cn(
                theme === "dark"
                  ? "border-emerald-800 text-emerald-400 hover:bg-emerald-950 hover:text-emerald-300"
                  : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
              )}
            >
              <Link href="/settings">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="icon"
              className={cn(
                theme === "dark"
                  ? "border-emerald-800 text-emerald-400 hover:bg-emerald-950 hover:text-emerald-300"
                  : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
              )}
            >
              <Link href="/api/auth/signout">
                <LogOut className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
