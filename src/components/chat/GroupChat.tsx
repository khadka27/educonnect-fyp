"use client";

import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { cn } from "src/lib/utils";

// UI Components
import { Input } from "src/components/ui/input";
import { Button } from "src/components/ui/button";
import { ScrollArea } from "src/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "src/components/ui/card";
import { Badge } from "src/components/ui/badge";
import { Skeleton } from "src/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "src/components/ui/tabs";
import { useToast } from "src/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "src/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "src/components/ui/tooltip";

// Components
import GroupDetails from "./GroupDetails";

// Icons
import {
  Send,
  Paperclip,
  Image,
  File,
  X,
  Plus,
  Users,
  Info,
  Menu,
  ChevronLeft,
  MoreVertical,
  Search,
  Download,
  Loader2,
  MessageSquare,
  UserPlus,
  Settings,
} from "lucide-react";

// Initialize socket
const socket = io("http://localhost:3000");

// Types
interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName?: string;
  senderImage?: string;
  groupId: string;
  createdAt: string;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
}

interface Group {
  id: string;
  name: string;
  adminId: string;
  members: User[];
  avatar?: string;
  lastMessage?: {
    content: string;
    timestamp: string;
    senderId: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role?: string;
}

// File Preview Dialog Component
interface FilePreviewDialogProps {
  fileUrl: string;
  fileType: string;
  fileName: string;
  onClose: () => void;
}

function FilePreviewDialog({
  fileUrl,
  fileType,
  fileName,
  onClose,
}: FilePreviewDialogProps) {
  const { theme } = useTheme();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    // Simulate download delay
    setTimeout(() => {
      setIsDownloading(false);
    }, 1500);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <File className="mr-2 h-5 w-5" />
            {fileName}
          </DialogTitle>
        </DialogHeader>
        <div className="my-4 rounded-lg overflow-hidden border border-border">
          {fileType.match(/(jpg|jpeg|png|gif)/i) ? (
            <div className="relative bg-muted/30 flex items-center justify-center">
              <img
                src={fileUrl || "/placeholder.svg"}
                alt={fileName}
                className="max-h-[60vh] object-contain"
              />
            </div>
          ) : fileType === "pdf" ? (
            <div className="h-[60vh] w-full">
              <embed
                src={fileUrl}
                type="application/pdf"
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center bg-muted/30 p-6 text-center">
              <File className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Preview is not available for this file type.
              </p>
            </div>
          )}
        </div>
        <DialogFooter className="flex sm:justify-between">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <a
            href={fileUrl}
            download={fileName}
            onClick={handleDownload}
            className="no-underline"
          >
            <Button disabled={isDownloading}>
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </>
              )}
            </Button>
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Main Component
function GroupChat() {
  // State
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMessages, setGroupMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<{
    fileUrl: string;
    fileType: string;
    fileName: string;
  } | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Hooks
  const { data: session } = useSession();
  const { toast } = useToast();
  const { theme } = useTheme();

  // Check if user is a teacher
  const isTeacher = session?.user?.role === "TEACHER";

  // Check if on mobile
  const isMobile = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  };

  // Effects

  // Fetch groups and users when session is ready
  useEffect(() => {
    if (session?.user?.id) {
      setIsLoading(true);
      socket.emit("fetchGroups", session.user.id);
      socket.on("groupList", (data: Group[]) => {
        setGroups(data);
        setFilteredGroups(data);
        setIsLoading(false);
      });

      socket.emit("fetchUsers");
      socket.on("userList", (data: User[]) => setUsers(data));

      // Listen for group creation (optimistic update)
      socket.on("groupCreated", (group: Group) => {
        setGroups((prev) => [group, ...prev]);
        setFilteredGroups((prev) => [group, ...prev]);
        toast({
          title: "Group created",
          description: `${group.name} has been created successfully`,
        });
      });

      return () => {
        socket.off("groupList");
        socket.off("userList");
        socket.off("groupCreated");
      };
    }
  }, [session, toast]);

  // Fetch messages when a group is selected
  useEffect(() => {
    if (selectedGroup) {
      socket.emit("fetchGroupMessages", selectedGroup.id);
      socket.emit("joinGroup", selectedGroup.id);

      const handleGroupMessageHistory = (messages: Message[]) => {
        setGroupMessages(messages);
        // Scroll to bottom after messages load
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      };

      const handleNewGroupMessage = (message: Message) => {
        if (message.groupId === selectedGroup.id) {
          setGroupMessages((prevMessages) => {
            // Remove matching temporary message if found before adding the real one
            const updatedMessages = prevMessages
              .filter(
                (msg) =>
                  !(
                    msg.id.startsWith("temp-") &&
                    msg.senderId === message.senderId &&
                    msg.content === message.content
                  )
              )
              .concat(message);

            // Scroll to bottom after new message
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);

            return updatedMessages;
          });
        }
      };

      socket.on("groupMessageHistory", handleGroupMessageHistory);
      socket.on("newGroupMessage", handleNewGroupMessage);

      return () => {
        socket.off("groupMessageHistory", handleGroupMessageHistory);
        socket.off("newGroupMessage", handleNewGroupMessage);
      };
    }
  }, [selectedGroup]);

  // Filter groups when search query changes
  useEffect(() => {
    if (searchQuery) {
      const filtered = groups.filter((group) =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGroups(filtered);
    } else {
      setFilteredGroups(groups);
    }
  }, [searchQuery, groups]);

  // Filter groups when active tab changes
  useEffect(() => {
    if (activeTab === "all") {
      setFilteredGroups(groups);
    } else if (activeTab === "my") {
      // Filter groups where user is admin
      const myGroups = groups.filter(
        (group) => group.adminId === session?.user?.id
      );
      setFilteredGroups(myGroups);
    }
  }, [activeTab, groups, session?.user?.id]);

  // Handlers

  // Fetch group messages
  const fetchGroupMessages = (groupId: string) => {
    const group = groups.find((group) => group.id === groupId) || null;
    setSelectedGroup(group);
    setGroupMessages([]);
    setShowSidebar(false);
  };

  // Send message
  const handleSendMessage = () => {
    if (newMessage.trim() && selectedGroup && session?.user?.id) {
      setIsSending(true);

      // Create optimistic message
      const optimisticMessage: Message = {
        id: "temp-" + Date.now(),
        content: newMessage,
        senderId: session.user.id,
        senderName: session.user.name || "",
        groupId: selectedGroup.id,
        createdAt: new Date().toISOString(),
        senderImage: session.user.image ?? "/placeholder.svg",
      };

      setGroupMessages((prev) => [...prev, optimisticMessage]);

      // Emit message to server
      socket.emit("sendGroupMessage", {
        content: newMessage,
        senderId: session.user.id,
        groupId: selectedGroup.id,
        senderImage: session.user.image ?? "/placeholder.svg",
      });

      setNewMessage("");

      // Simulate network delay
      setTimeout(() => {
        setIsSending(false);
      }, 500);
    }
  };

  // Create group
  const handleCreateGroup = () => {
    if (isTeacher && newGroupName.trim() && session?.user?.id) {
      // Create optimistic group
      const newGroup: Group = {
        id: "temp-" + Date.now(),
        name: newGroupName,
        adminId: session.user.id,
        members: [
          {
            id: session.user.id,
            name: session.user.name || "Teacher",
            email: session.user.email || "",
            avatar: session.user.image ?? "/placeholder.svg",
            role: session.user.role,
          },
        ],
        avatar: "/placeholder.svg",
      };

      setGroups((prev) => [newGroup, ...prev]);
      setFilteredGroups((prev) => [newGroup, ...prev]);

      // Emit group creation to server
      socket.emit("createGroup", {
        teacherId: session.user.id,
        groupName: newGroupName,
      });

      setNewGroupName("");
      setIsCreatingGroup(false);

      toast({
        title: "Group created",
        description: `${newGroupName} has been created successfully`,
      });
    }
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Send file
  const handleSendFile = () => {
    if (selectedFile && selectedGroup && session?.user?.id) {
      setIsSending(true);

      const fileExtension =
        selectedFile.name.split(".").pop()?.toLowerCase() || "";

      // Create optimistic file message
      const optimisticMessage: Message = {
        id: "temp-" + Date.now(),
        content: `File: ${selectedFile.name}`,
        senderId: session.user.id,
        senderName: session.user.name || "",
        groupId: selectedGroup.id,
        createdAt: new Date().toISOString(),
        senderImage: session.user.image ?? "/placeholder.svg",
        fileName: selectedFile.name,
        fileType: fileExtension,
        fileUrl: URL.createObjectURL(selectedFile), // Create temporary URL for preview
      };

      setGroupMessages((prev) => [...prev, optimisticMessage]);

      // Emit file to server
      socket.emit("sendFile", {
        fileName: selectedFile.name,
        fileType: fileExtension,
        senderId: session.user.id,
        groupId: selectedGroup.id,
      });

      setSelectedFile(null);

      // Simulate network delay
      setTimeout(() => {
        setIsSending(false);
      }, 1000);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return format(date, "h:mm a");
    } catch (error) {
      return "Just now";
    }
  };

  // Format date for message groups
  const formatMessageDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      } else {
        return format(date, "MMMM d, yyyy");
      }
    } catch (error) {
      return "Recent";
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: { [key: string]: Message[] } = {};

    groupMessages.forEach((message) => {
      const date = formatMessageDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages,
    }));
  };

  // Toggle sidebar
  const toggleSidebar = () => setShowSidebar(!showSidebar);

  // Toggle details
  const toggleDetails = () => setShowDetails(!showDetails);

  return (
    <div
      className={cn(
        "flex h-[calc(100vh-60px)] overflow-hidden rounded-lg shadow-lg",
        theme === "dark"
          ? "bg-background text-foreground"
          : "bg-background text-foreground"
      )}
    >
      {/* Left Sidebar - Groups List */}
      <AnimatePresence>
        {(showSidebar || !isMobile()) && (
          <motion.div
            initial={isMobile() ? { x: -300, opacity: 0 } : false}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "border-r",
              isMobile()
                ? "fixed inset-0 z-50 w-full md:w-80 lg:w-96"
                : "w-1/4 min-w-[300px]",
              theme === "dark"
                ? "border-border bg-background"
                : "border-border bg-background"
            )}
          >
            <div
              className={cn(
                "p-4 border-b sticky top-0 z-10",
                theme === "dark"
                  ? "border-border bg-background"
                  : "border-border bg-background"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <Users className="mr-2 h-5 w-5 text-primary" />
                  Group Chats
                </h2>
                <div className="flex items-center space-x-1">
                  {isTeacher && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={() => setIsCreatingGroup(true)}
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Create new group</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

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
                  placeholder="Search groups..."
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

              {isTeacher && (
                <Tabs
                  defaultValue="all"
                  className="mt-4"
                  value={activeTab}
                  onValueChange={setActiveTab}
                >
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="all">All Groups</TabsTrigger>
                    <TabsTrigger value="my">My Groups</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </div>

            <ScrollArea className="h-[calc(100vh-170px)]">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredGroups.length > 0 ? (
                filteredGroups.map((group) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "p-3 mx-2 my-1 rounded-lg flex items-center space-x-3 cursor-pointer transition-colors duration-200",
                      selectedGroup?.id === group.id
                        ? theme === "dark"
                          ? "bg-primary/10 border-l-4 border-primary"
                          : "bg-primary/10 border-l-4 border-primary"
                        : theme === "dark"
                        ? "hover:bg-muted/50"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => fetchGroupMessages(group.id)}
                  >
                    <Avatar className="w-12 h-12 ring-2 ring-offset-2 ring-offset-background ring-primary/20">
                      <AvatarImage src={group.avatar || "/placeholder.svg"} />
                      <AvatarFallback
                        className={cn(
                          theme === "dark" ? "bg-muted" : "bg-muted"
                        )}
                      >
                        {group.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold truncate">{group.name}</h3>
                        {group.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(group.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center mt-1">
                        <p
                          className={cn(
                            "text-sm truncate",
                            theme === "dark"
                              ? "text-muted-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {group.members.length} members
                        </p>

                        {group.adminId === session?.user?.id && (
                          <Badge
                            variant="outline"
                            className="text-xs px-1.5 py-0 border-primary text-primary"
                          >
                            Admin
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No groups found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? `No results for "${searchQuery}"`
                      : isTeacher
                      ? "Create a new group to get started"
                      : "You haven't joined any groups yet"}
                  </p>
                  {isTeacher && (
                    <Button
                      className="mt-4"
                      onClick={() => setIsCreatingGroup(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Group
                    </Button>
                  )}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col">
        {selectedGroup ? (
          <>
            {/* Chat Header */}
            <CardHeader className="flex flex-row p-4 justify-between border-b">
              <div className="flex items-center space-x-3">
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

                <Avatar className="w-10 h-10 ring-2 ring-offset-2 ring-offset-background ring-primary/20">
                  <AvatarImage
                    src={selectedGroup.avatar ?? "/placeholder.svg"}
                  />
                  <AvatarFallback
                    className={cn(theme === "dark" ? "bg-muted" : "bg-muted")}
                  >
                    {selectedGroup.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h2 className="text-lg font-semibold">
                    {selectedGroup.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedGroup.members.length} members
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        onClick={toggleDetails}
                      >
                        <Info className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Group details</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="flex items-center">
                      <Search className="mr-2 h-4 w-4" />
                      <span>Search in conversation</span>
                    </DropdownMenuItem>
                    {isTeacher &&
                      selectedGroup.adminId === session?.user?.id && (
                        <DropdownMenuItem className="flex items-center">
                          <UserPlus className="mr-2 h-4 w-4" />
                          <span>Add members</span>
                        </DropdownMenuItem>
                      )}
                    {selectedGroup.adminId === session?.user?.id && (
                      <DropdownMenuItem className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Group settings</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-4 overflow-hidden">
              <ScrollArea className="h-[calc(100vh-200px)]">
                {groupMessages.length > 0 ? (
                  <div className="space-y-6">
                    {groupMessagesByDate().map(({ date, messages }) => (
                      <div key={date} className="space-y-4">
                        <div className="relative flex items-center justify-center my-6">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <span className="relative px-2 text-xs font-medium text-muted-foreground bg-background">
                            {date}
                          </span>
                        </div>

                        {messages.map((msg) => {
                          const isSender = msg.senderId === session?.user?.id;
                          const sender = selectedGroup.members.find(
                            (m) => m.id === msg.senderId
                          );

                          return (
                            <motion.div
                              key={msg.id}
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
                                    <AvatarImage
                                      src={
                                        sender?.avatar ||
                                        msg.senderImage ||
                                        "/placeholder.svg"
                                      }
                                    />
                                    <AvatarFallback
                                      className={cn(
                                        theme === "dark"
                                          ? "bg-muted"
                                          : "bg-muted"
                                      )}
                                    >
                                      {sender?.name
                                        ? sender.name[0].toUpperCase()
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
                                {!isSender && (
                                  <p className="text-xs text-muted-foreground mb-1 ml-1">
                                    {sender?.name || msg.senderName || "User"}
                                  </p>
                                )}

                                <div
                                  className={cn(
                                    "px-4 py-2 rounded-2xl break-words",
                                    isSender
                                      ? "bg-primary text-primary-foreground rounded-br-none"
                                      : theme === "dark"
                                      ? "bg-muted rounded-bl-none"
                                      : "bg-muted rounded-bl-none"
                                  )}
                                >
                                  {/* File content */}
                                  {msg.fileUrl &&
                                  msg.fileType?.match(/(jpg|jpeg|png|gif)/i) ? (
                                    <div
                                      className="rounded-lg overflow-hidden mb-2 cursor-pointer"
                                      onClick={() =>
                                        setPreviewFile({
                                          fileUrl: msg.fileUrl!,
                                          fileType: msg.fileType || "",
                                          fileName: msg.fileName || "Image",
                                        })
                                      }
                                    >
                                      <img
                                        src={msg.fileUrl || "/placeholder.svg"}
                                        alt={msg.fileName || "Image"}
                                        className="max-h-40 w-auto rounded object-cover"
                                      />
                                    </div>
                                  ) : msg.fileUrl ? (
                                    <div
                                      className="flex items-center space-x-2 p-2 bg-background/50 rounded-lg mb-2 cursor-pointer"
                                      onClick={() =>
                                        setPreviewFile({
                                          fileUrl: msg.fileUrl!,
                                          fileType: msg.fileType || "",
                                          fileName: msg.fileName || "File",
                                        })
                                      }
                                    >
                                      <File className="h-5 w-5 flex-shrink-0" />
                                      <span className="text-sm truncate">
                                        {msg.fileName}
                                      </span>
                                    </div>
                                  ) : null}

                                  {/* Message content */}
                                  <p className="text-sm md:text-base whitespace-pre-wrap">
                                    {msg.content.startsWith("File: ")
                                      ? ""
                                      : msg.content}
                                  </p>
                                </div>

                                <div className="flex items-center mt-1 space-x-2 justify-end">
                                  <span
                                    className={cn(
                                      "text-xs",
                                      "text-muted-foreground"
                                    )}
                                  >
                                    {formatTimestamp(msg.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-20">
                    <div
                      className={cn(
                        "p-6 rounded-full mb-4",
                        theme === "dark" ? "bg-muted" : "bg-muted"
                      )}
                    >
                      <MessageSquare className="h-12 w-12 opacity-30" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      No messages yet
                    </h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      Send a message to start the conversation in{" "}
                      {selectedGroup.name}
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>

            {/* Message Input */}
            <CardFooter className="p-4 border-t">
              <div className="flex flex-col gap-2 w-full">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message"
                    className="flex-1"
                    disabled={isSending}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSending}
                  >
                    {isSending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                <div className="flex gap-2 items-center">
                  {/* Hidden file input */}
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="fileInput"
                    ref={fileInputRef}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSending}
                    className="text-xs"
                  >
                    <Paperclip className="h-4 w-4 mr-1" />
                    Attach File
                  </Button>

                  {selectedFile && (
                    <div className="flex items-center gap-2 flex-1 p-2 bg-muted/30 rounded-md">
                      <div className="flex-1 truncate text-sm">
                        {selectedFile.name}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 rounded-full"
                        onClick={() => setSelectedFile(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSendFile}
                        disabled={isSending}
                        className="text-xs"
                      >
                        {isSending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardFooter>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "p-6 rounded-full mb-4",
                theme === "dark" ? "bg-muted" : "bg-muted"
              )}
            >
              <MessageSquare className="h-12 w-12 opacity-30" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">
              Welcome to Group Chat
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              Select a group from the sidebar to start chatting
            </p>
            <Button
              variant="outline"
              onClick={toggleSidebar}
              className="mt-4 md:hidden"
            >
              <Users className="h-5 w-5 mr-2" />
              View Groups
            </Button>
          </div>
        )}
      </div>

      {/* Right Sidebar - Group Details */}
      <AnimatePresence>
        {(showDetails || (!isMobile() && selectedGroup)) && (
          <motion.div
            initial={isMobile() ? { x: 300, opacity: 0 } : false}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "border-l",
              isMobile()
                ? "fixed right-0 top-0 bottom-0 z-50 w-full md:w-80 lg:w-96"
                : "w-1/4 min-w-[300px]",
              theme === "dark"
                ? "border-border bg-background"
                : "border-border bg-background"
            )}
          >
            {isMobile() && (
              <div className="flex justify-end p-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={toggleDetails}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}

            <GroupDetails
              selectedGroup={selectedGroup}
              currentUser={session?.user ?? null}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Group Dialog */}
      <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="group-name" className="text-sm font-medium">
                Group Name
              </label>
              <Input
                id="group-name"
                placeholder="Enter group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingGroup(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGroup} disabled={!newGroupName.trim()}>
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Preview Dialog */}
      {previewFile && (
        <FilePreviewDialog
          fileUrl={previewFile.fileUrl}
          fileType={previewFile.fileType}
          fileName={previewFile.fileName}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}

export default GroupChat;
