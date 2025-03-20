"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { format } from "date-fns";
import { useChat } from "src/context/ChatContext";
import { cn } from "src/lib/utils";
import _ from "lodash";

// UI Components
import { ScrollArea } from "src/components/ui/scroll-area";
import { Input } from "src/components/ui/input";
import { Button } from "src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar";
import { Badge } from "src/components/ui/badge";
import { Skeleton } from "src/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "src/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "src/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";

// Icons
import {
  Send,
  Paperclip,
  Phone,
  Video,
  Info,
  Menu,
  X,
  Search,
  Smile,
  Image,
  Mic,
  MoreVertical,
  Check,
  CheckCheck,
  ChevronLeft,
  Users,
  MessageSquare,
  Loader2,
  ArrowUpFromLine,
  Bell,
  BellOff,
} from "lucide-react";

// Types
interface User {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  username: string;
  status?: "online" | "offline" | "away";
  lastActive?: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  fileUrl?: string;
  fileType?: string;
  isRead?: boolean;
}

// Main Component
const EnhancedChatInterface = () => {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Hooks
  const { data: session, status } = useSession();
  const { theme } = useTheme();

  // Chat context
  const { messages, sendMessage, sendFile, markAsRead, fetchMessages } =
    useChat();

  // Check if on mobile
  const isMobile = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  };

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/user");
      const allUsers = response.data.data;

      if (Array.isArray(allUsers) && session?.user?.id) {
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
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setIsLoading(false);
    }
  }, [session]);

  // Effects

  // Fetch users when session is authenticated
  useEffect(() => {
    if (status === "authenticated") {
      fetchUsers();
    }
  }, [status, fetchUsers]);

  // Scroll to bottom when messages change
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    scrollToBottom();
    window.addEventListener("resize", scrollToBottom);

    return () => window.removeEventListener("resize", scrollToBottom);
  }, [messages]);

  // Filter users when search query changes
  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
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

  // Handlers

  // Send message
  const handleSendMessage = useCallback(() => {
    if (newMessage.trim() && selectedUser && session?.user?.id) {
      const newMsgId = _.uniqueId("msg_");
      const msg = {
        id: newMsgId,
        content: newMessage,
        senderId: session.user.id,
        receiverId: selectedUser.id,
        createdAt: new Date().toISOString(),
        isRead: false,
      };

      sendMessage(msg);
      setNewMessage("");
      setIsTyping(false);
    }
  }, [newMessage, selectedUser, session, sendMessage]);

  // Send file
  const handleSendFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && selectedUser && session?.user?.id) {
        setIsUploading(true);

        // Simulate file upload with a delay
        setTimeout(() => {
          const reader = new FileReader();
          reader.onloadend = () => {
            sendFile({
              content: file.name,
              fileName: reader.result as string,
              fileType: file.type,
              receiverId: selectedUser.id,
            });
            setIsUploading(false);
          };
          reader.readAsDataURL(file);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }, 1000);
      }
    },
    [selectedUser, session, sendFile]
  );

  // Select user
  const handleUserSelect = useCallback(
    (user: User) => {
      setSelectedUser(user);
      setShowSidebar(false);

      if (session?.user?.id) {
        fetchMessages(session.user.id, user.id);

        // Mark messages as read
        messages.forEach((msg) => {
          if (
            msg.senderId === user.id &&
            msg.receiverId === session.user.id &&
            !msg.isRead
          ) {
            markAsRead(msg.id);
          }
        });
      }
    },
    [session, fetchMessages, messages, markAsRead]
  );

  // Toggle sidebar
  const toggleSidebar = () => setShowSidebar(!showSidebar);

  // Format timestamp
  const formatTimestamp = (createdAt: string) => {
    const date = new Date(createdAt);
    return format(date, "h:mm a");
  };

  // Format last active
  const formatLastActive = (lastActive: string) => {
    const date = new Date(lastActive);
    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffHours < 1) {
      return "Active recently";
    } else if (diffHours < 24) {
      return `Active ${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    } else {
      return `Active on ${format(date, "MMM d")}`;
    }
  };

  // Handle typing
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

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

  // Get message status icon
  const getMessageStatusIcon = (message: Message) => {
    if (message.senderId === session?.user?.id) {
      if (message.isRead) {
        return <CheckCheck className="h-3.5 w-3.5 text-blue-500" />;
      } else {
        return <Check className="h-3.5 w-3.5 text-gray-400" />;
      }
    }
    return null;
  };

  return (
    <div
      className={cn(
        "flex h-screen w-full overflow-hidden",
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-900"
      )}
    >
      {/* User list sidebar */}
      <AnimatePresence>
        {(showSidebar || !isMobile()) && (
          <motion.div
            initial={isMobile() ? { x: -300, opacity: 0 } : false}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "w-full md:w-80 lg:w-96 border-r z-20",
              isMobile() ? "fixed inset-0 h-full" : "relative",
              theme === "dark"
                ? "border-gray-800 bg-gray-900"
                : "border-gray-200 bg-white"
            )}
          >
            <div
              className={cn(
                "p-4 border-b sticky top-0 z-10",
                theme === "dark"
                  ? "border-gray-800 bg-gray-900"
                  : "border-gray-200 bg-white"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                  Messages
                </h2>
                <div className="flex items-center space-x-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                        >
                          <Bell className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Notifications</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {isMobile() && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      onClick={toggleSidebar}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
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

            <ScrollArea className="h-[calc(100vh-170px)]">
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
                    className={cn(
                      "flex items-center p-4 cursor-pointer transition-colors duration-200",
                      selectedUser?.id === user.id
                        ? theme === "dark"
                          ? "bg-gray-800 border-l-4 border-primary"
                          : "bg-blue-50 border-l-4 border-primary"
                        : theme === "dark"
                        ? "hover:bg-gray-800"
                        : "hover:bg-gray-100"
                    )}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="relative">
                      <Avatar className="w-12 h-12 ring-2 ring-offset-2 ring-offset-background ring-primary/20">
                        <AvatarImage src={user.profileImage} />
                        <AvatarFallback
                          className={cn(
                            theme === "dark" ? "bg-gray-700" : "bg-blue-100"
                          )}
                        >
                          {user.name ? user.name[0].toUpperCase() : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={cn(
                          "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                          getStatusColor(user.status)
                        )}
                      />
                    </div>

                    <div className="flex-1 min-w-0 ml-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold truncate">{user.name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {user.lastActive && formatLastActive(user.lastActive)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mt-1">
                        <p
                          className={cn(
                            "text-sm truncate",
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          )}
                        >
                          {user.username || user.email}
                        </p>

                        {/* Unread message indicator - in a real app, you would show this conditionally */}
                        {Math.random() > 0.7 && (
                          <Badge
                            variant="default"
                            className="rounded-full px-2 py-0.5 text-xs"
                          >
                            {Math.floor(Math.random() * 5) + 1}
                          </Badge>
                        )}
                      </div>
                    </div>
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
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat area */}
      <div className="flex-1 flex flex-col relative">
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div
              className={cn(
                "p-4 flex items-center justify-between border-b sticky top-0 z-10 shadow-sm",
                theme === "dark"
                  ? "border-gray-800 bg-gray-900"
                  : "border-gray-200 bg-white"
              )}
            >
              <div className="flex items-center">
                {isMobile() && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-2"
                    onClick={toggleSidebar}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                )}

                <div className="relative">
                  <Avatar className="w-10 h-10 ring-2 ring-offset-2 ring-offset-background ring-primary/20">
                    <AvatarImage src={selectedUser.profileImage} />
                    <AvatarFallback
                      className={cn(
                        theme === "dark" ? "bg-gray-700" : "bg-blue-100"
                      )}
                    >
                      {selectedUser.name
                        ? selectedUser.name[0].toUpperCase()
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                      getStatusColor(selectedUser.status)
                    )}
                  />
                </div>

                <div className="ml-3">
                  <h2 className="text-base font-semibold flex items-center">
                    {selectedUser.name}
                    {selectedUser.status === "online" && (
                      <Badge
                        variant="outline"
                        className="ml-2 px-1.5 py-0 text-xs border-green-500 text-green-500"
                      >
                        Online
                      </Badge>
                    )}
                  </h2>
                  <p
                    className={cn(
                      "text-xs",
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    )}
                  >
                    {selectedUser.status === "online"
                      ? "Active now"
                      : selectedUser.lastActive
                      ? formatLastActive(selectedUser.lastActive)
                      : selectedUser.username || selectedUser.email}
                  </p>
                </div>
              </div>

              <div className="flex space-x-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <Phone className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Voice call</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <Video className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Video call</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="flex items-center">
                      <Info className="mr-2 h-4 w-4" />
                      <span>View profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center">
                      <Search className="mr-2 h-4 w-4" />
                      <span>Search in conversation</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center">
                      <BellOff className="mr-2 h-4 w-4" />
                      <span>Mute notifications</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea
              className={cn(
                "flex-1 p-4",
                theme === "dark"
                  ? "bg-gray-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 to-gray-900"
                  : "bg-gray-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white to-gray-100"
              )}
            >
              <div className="space-y-4 py-2">
                {messages.length > 0 ? (
                  messages.map((message) => {
                    const isSender = message.senderId === session?.user?.id;
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "flex",
                          isSender ? "justify-end" : "justify-start"
                        )}
                      >
                        {!isSender && (
                          <div className="flex-shrink-0 mr-2 self-end mb-1">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={selectedUser.profileImage} />
                              <AvatarFallback
                                className={cn(
                                  theme === "dark"
                                    ? "bg-gray-700"
                                    : "bg-blue-100"
                                )}
                              >
                                {selectedUser.name
                                  ? selectedUser.name[0].toUpperCase()
                                  : "?"}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}

                        <div
                          className={cn(
                            "max-w-[80%] md:max-w-[70%]",
                            isSender ? "order-1" : "order-2"
                          )}
                        >
                          <div
                            className={cn(
                              "px-4 py-2 rounded-2xl break-words",
                              isSender
                                ? "bg-primary text-primary-foreground rounded-br-none"
                                : theme === "dark"
                                ? "bg-gray-800 rounded-bl-none"
                                : "bg-white shadow-sm rounded-bl-none"
                            )}
                          >
                            {message.fileType?.startsWith("image/") ? (
                              <div className="rounded-lg overflow-hidden mb-1">
                                <img
                                  src={
                                    message.fileUrl ||
                                    "/placeholder.svg?height=200&width=300"
                                  }
                                  alt="Image attachment"
                                  className="max-w-full h-auto rounded"
                                />
                              </div>
                            ) : null}

                            <p className="text-sm md:text-base whitespace-pre-wrap">
                              {message.content}
                            </p>

                            {message.fileUrl &&
                              !message.fileType?.startsWith("image/") && (
                                <div
                                  className={cn(
                                    "mt-1 text-xs flex items-center",
                                    isSender
                                      ? "text-primary-foreground/80"
                                      : "text-blue-500"
                                  )}
                                >
                                  <Paperclip className="h-3 w-3 mr-1" />
                                  <span className="underline">
                                    {message.fileType?.includes("audio")
                                      ? "Voice message"
                                      : "Attachment"}
                                  </span>
                                </div>
                              )}
                          </div>

                          <div className="flex items-center mt-1 space-x-2">
                            <span
                              className={cn(
                                "text-xs",
                                isSender
                                  ? "text-gray-500 dark:text-gray-400"
                                  : "text-gray-500 dark:text-gray-400"
                              )}
                            >
                              {formatTimestamp(message.createdAt)}
                            </span>

                            {getMessageStatusIcon(message)}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-20">
                    <div
                      className={cn(
                        "p-6 rounded-full mb-4",
                        theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                      )}
                    >
                      <MessageSquare className="h-12 w-12 opacity-30" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      No messages yet
                    </h3>
                    <p className="text-gray-500 text-center max-w-md">
                      Send a message to start the conversation with{" "}
                      {selectedUser.name}
                    </p>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Message input */}
            <div
              className={cn(
                "p-4 border-t",
                theme === "dark"
                  ? "border-gray-800 bg-gray-900"
                  : "border-gray-200 bg-white"
              )}
            >
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*,video/*,audio/*,application/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleSendFile}
                />

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Paperclip className="h-5 w-5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Attach file</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                      >
                        <Smile className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add emoji</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                      >
                        <Image className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Send photo</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="pr-12 rounded-full py-6 pl-4"
                  />

                  <AnimatePresence>
                    {isTyping ? (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2"
                      >
                        <Button
                          onClick={handleSendMessage}
                          className="rounded-full h-9 w-9 p-0 bg-primary hover:bg-primary/90"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2"
                      >
                        <Button className="rounded-full h-9 w-9 p-0 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
                          <Mic className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "p-6 rounded-full mb-4",
                theme === "dark" ? "bg-gray-800" : "bg-gray-100"
              )}
            >
              <MessageSquare className="h-12 w-12 opacity-30" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">Your messages</h3>
            <p className="text-gray-500 text-center max-w-md">
              Select a user from the sidebar to start a conversation
            </p>
            <Button
              variant="outline"
              onClick={toggleSidebar}
              className="mt-4 md:hidden"
            >
              View Users
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedChatInterface;
