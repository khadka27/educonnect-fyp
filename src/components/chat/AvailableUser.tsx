"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import axios from "axios";
import { format } from "date-fns";
import { cn } from "src/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar";
import { Button } from "src/components/ui/button";
import { ScrollArea } from "src/components/ui/scroll-area";
import { Input } from "src/components/ui/input";
import { Skeleton } from "src/components/ui/skeleton";
import { Badge } from "src/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "src/components/ui/tabs";
import { Search, X, Users } from "lucide-react";

interface User {
  id: string;
  name: string;
  username: string;
  profileImage: string | null;
  status?: "online" | "offline" | "away";
  lastActive?: string;
}

interface AvailableUsersProps {
  onSelectUser: (userId: string) => void;
  selectedUserId?: string;
  className?: string;
}

export function AvailableUsers({
  onSelectUser,
  selectedUserId,
  className,
}: AvailableUsersProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { data: session, status } = useSession();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("/api/user");
        const allUsers = response.data.data;

        if (Array.isArray(allUsers)) {
          if (session?.user?.id) {
            const availableUsers = allUsers.filter(
              (user: User) => user.id !== session.user.id
            );

            // Add status for demo purposes
            const enhancedUsers = availableUsers.map((user) => ({
              ...user,
              status:
                Math.random() > 0.5
                  ? "online"
                  : Math.random() > 0.5
                  ? "away"
                  : "offline",
              lastActive: new Date(
                Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)
              ).toISOString(),
            }));

            setUsers(enhancedUsers);
            setFilteredUsers(enhancedUsers);
          } else {
            setUsers(allUsers);
            setFilteredUsers(allUsers);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchUsers();
    }
  }, [session, status]);

  // Filter users when search query changes
  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  // Filter users when active tab changes
  useEffect(() => {
    if (activeTab === "all") {
      setFilteredUsers(users);
    } else if (activeTab === "online") {
      setFilteredUsers(users.filter((user) => user.status === "online"));
    } else if (activeTab === "unread") {
      // In a real app, you would filter users with unread messages
      // For demo, we'll just show all users
      setFilteredUsers(users);
    }
  }, [activeTab, users]);

  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  if (status === "loading") {
    return (
      <div className={cn("h-full flex flex-col", className)}>
        <div className="p-4 border-b">
          <Skeleton className="h-8 w-40 mb-4" />
          <Skeleton className="h-10 w-full rounded-full" />
        </div>
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <div
        className={cn(
          "p-4 border-b sticky top-0 z-10",
          theme === "dark"
            ? "border-gray-800 bg-gray-900"
            : "border-gray-200 bg-white"
        )}
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Users className="mr-2 h-5 w-5 text-primary" />
          Available Users
        </h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-9 rounded-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 rounded-full"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <Tabs
          defaultValue="all"
          className="mt-4"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="online">Online</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                whileHover={{ x: 5 }}
              >
                <Button
                  variant={selectedUserId === user.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start p-3 h-auto",
                    selectedUserId === user.id &&
                      "bg-primary text-primary-foreground"
                  )}
                  onClick={() => onSelectUser(user.id)}
                >
                  <div className="relative">
                    <Avatar className="w-10 h-10 mr-3">
                      <AvatarImage src={user.profileImage || undefined} />
                      <AvatarFallback
                        className={cn(
                          theme === "dark" ? "bg-gray-700" : "bg-blue-100",
                          selectedUserId === user.id &&
                            "bg-primary-foreground text-primary"
                        )}
                      >
                        {user.username ? user.username[0].toUpperCase() : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                        getStatusColor(user.status)
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-medium truncate">
                        {user.name || user.username}
                      </p>
                      {user.status === "online" && (
                        <Badge
                          variant={
                            selectedUserId === user.id ? "outline" : "secondary"
                          }
                          className="ml-2 px-1.5 py-0 text-xs"
                        >
                          Online
                        </Badge>
                      )}
                    </div>
                    {user.lastActive && (
                      <p
                        className={cn(
                          "text-xs truncate",
                          selectedUserId === user.id
                            ? "text-primary-foreground/80"
                            : theme === "dark"
                            ? "text-gray-400"
                            : "text-gray-500"
                        )}
                      >
                        {user.status === "online"
                          ? "Active now"
                          : `Last seen ${format(
                              new Date(user.lastActive),
                              "h:mm a"
                            )}`}
                      </p>
                    )}
                  </div>
                </Button>
              </motion.div>
            ))
          ) : (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No users found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : "Try connecting with some users"}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
