"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "src/lib/utils";
import { useChat } from "src/context/ChatContext";

// Components
import { AvailableUsers } from "src/components/chat/AvailableUser";
import ChatInput from "src/components/chat/ChatInput";
import { Button } from "src/components/ui/button";
import { ScrollArea } from "src/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar";
import { Badge } from "src/components/ui/badge";

// Icons
import {
  MessageSquare,
  ChevronLeft,
  Phone,
  Video,
  MoreVertical,
  Check,
  CheckCheck,
  Users,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  profileImage: string | null;
  status?: "online" | "offline" | "away";
}

const DirectChat = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  const { messages, sendMessage, sendFile, markAsRead, fetchMessages } =
    useChat();

  // Check if on mobile
  const isMobile = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  };

  // Fetch user details when a user is selected
  const fetchUserDetails = useCallback(async (userId: string) => {
    try {
      const response = await axios.get(`/api/user/${userId}`);
      setSelectedUser(response.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }, []);

  // Handle user selection
  const handleSelectUser = useCallback(
    (userId: string) => {
      setSelectedUserId(userId);
      fetchUserDetails(userId);
      setShowSidebar(false);

      if (session?.user?.id) {
        fetchMessages(session.user.id, userId);
      }
    },
    [session, fetchMessages, fetchUserDetails]
  );

  // Format timestamp
  const formatTimestamp = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Get message status icon
  const getMessageStatusIcon = (message: any) => {
    if (message.senderId === session?.user?.id) {
      if (message.isRead) {
        return <CheckCheck className="h-3.5 w-3.5 text-blue-500" />;
      } else {
        return <Check className="h-3.5 w-3.5 text-gray-400" />;
      }
    }
    return null;
  };

  // Handle sending a message
  const handleSendMessage = useCallback(
    (content: string) => {
      if (content.trim() && selectedUserId && session?.user?.id) {
        const newMsgId = Math.random().toString(36).substring(2, 15);
        const msg = {
          id: newMsgId,
          content,
          senderId: session.user.id,
          receiverId: selectedUserId,
          createdAt: new Date().toISOString(),
          isRead: false,
        };

        sendMessage(msg);
      }
    },
    [selectedUserId, session, sendMessage]
  );

  // Handle sending a file
  const handleSendFile = useCallback(
    (file: File) => {
      if (file && selectedUserId && session?.user?.id) {
        const reader = new FileReader();
        reader.onloadend = () => {
          sendFile({
            content: file.name,
            fileName: reader.result as string,
            fileType: file.type,
            receiverId: selectedUserId,
          });
        };
        reader.readAsDataURL(file);
      }
    },
    [selectedUserId, session, sendFile]
  );

  // Toggle sidebar
  const toggleSidebar = () => setShowSidebar(!showSidebar);

  return (
    <div
      className={cn(
        "flex h-full w-full overflow-hidden rounded-lg shadow-lg",
        theme === "dark" ? "bg-gray-900" : "bg-white"
      )}
    >
      {/* Users sidebar - 30% width on desktop, full on mobile */}
      <AnimatePresence>
        {(showSidebar || !isMobile()) && (
          <motion.div
            initial={isMobile() ? { x: -300, opacity: 0 } : false}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "border-r",
              isMobile() ? "fixed inset-0 z-50 w-full" : "w-1/3",
              theme === "dark"
                ? "border-gray-800 bg-gray-900"
                : "border-gray-200 bg-white"
            )}
          >
            <AvailableUsers
              onSelectUser={handleSelectUser}
              selectedUserId={selectedUserId || undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat area */}
      <div className={cn("flex flex-col", isMobile() ? "w-full" : "w-2/3")}>
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div
              className={cn(
                "p-4 flex items-center justify-between border-b",
                theme === "dark" ? "border-gray-800" : "border-gray-200"
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
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedUser.profileImage || undefined} />
                    <AvatarFallback
                      className={
                        theme === "dark" ? "bg-gray-700" : "bg-blue-100"
                      }
                    >
                      {selectedUser.name
                        ? selectedUser.name[0].toUpperCase()
                        : selectedUser.username
                        ? selectedUser.username[0].toUpperCase()
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                  {selectedUser.status && (
                    <span
                      className={cn(
                        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                        selectedUser.status === "online"
                          ? "bg-green-500"
                          : selectedUser.status === "away"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                      )}
                    />
                  )}
                </div>

                <div className="ml-3">
                  <h2 className="text-base font-semibold flex items-center">
                    {selectedUser.name || selectedUser.username}
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
                      : selectedUser.username || selectedUser.email}
                  </p>
                </div>
              </div>

              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreVertical className="h-5 w-5" />
                </Button>
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
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => {
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
                              <AvatarImage
                                src={selectedUser.profileImage || undefined}
                              />
                              <AvatarFallback
                                className={
                                  theme === "dark"
                                    ? "bg-gray-700"
                                    : "bg-blue-100"
                                }
                              >
                                {selectedUser.name
                                  ? selectedUser.name[0].toUpperCase()
                                  : selectedUser.username
                                  ? selectedUser.username[0].toUpperCase()
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
                                  <a
                                    href={message.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline flex items-center"
                                  >
                                    {message.fileType?.includes("audio")
                                      ? "Voice message"
                                      : "Attachment"}
                                  </a>
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
                  })}
                </div>
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
                    {selectedUser.name || selectedUser.username}
                  </p>
                </div>
              )}
            </ScrollArea>

            {/* Message input */}
            <ChatInput
              onSendMessage={handleSendMessage}
              onSendFile={handleSendFile}
            />
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
              <Users className="h-5 w-5 mr-2" />
              View Users
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectChat;
