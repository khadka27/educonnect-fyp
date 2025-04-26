"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Smile,
  Paperclip,
  Send,
  Minimize2,
  Maximize2,
  ImageIcon,
  Video,
  File,
  X,
  MessageSquare,
  Users,
  Check,
  CheckCheck,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import io, { type Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  name: string;
  profileImage: string;
  username: string;
  isOnline?: boolean;
  isTyping?: boolean;
  lastSeen?: Date | string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date | string;
  isRead?: boolean;
  isDelivered?: boolean;
}

interface MessageBox {
  user: User;
  isMinimized: boolean;
  messages: Message[];
  message: string;
}

interface ChatCardProps {
  className?: string;
}

const ChatCard: React.FC<ChatCardProps> = ({ className = "" }) => {
  const [messageBoxes, setMessageBoxes] = useState<MessageBox[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState("contacts");
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  const { data: session } = useSession();
  const socketRef = useRef<typeof Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement[]>([]);
  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Initialize socket connection
  useEffect(() => {
    if (session?.user?.id) {
      socketRef.current = io("http://localhost:4000", {
        transports: ["websocket"],
        query: { userId: session.user.id },
      });

      socketRef.current.emit("joinRoom", session.user.id);

      socketRef.current.on("newMessage", (message: Message) => {
        console.log("Received new message:", message);
        handleNewMessage(message);
      });

      socketRef.current.on("messageHistory", (messages: Message[]) => {
        console.log("Received message history:", messages);
        // Handle message history when it comes back from socket
        if (messages.length > 0) {
          const otherUserId =
            messages[0].senderId === session.user.id
              ? messages[0].receiverId
              : messages[0].senderId;

          setMessageBoxes((prevBoxes) => {
            const existingBoxIndex = prevBoxes.findIndex(
              (box) => box.user.id === otherUserId
            );
            if (existingBoxIndex >= 0) {
              const updatedBoxes = [...prevBoxes];
              updatedBoxes[existingBoxIndex] = {
                ...updatedBoxes[existingBoxIndex],
                messages: messages,
              };
              return updatedBoxes;
            }
            return prevBoxes;
          });
        }
      });

      // Listen for user online status changes
      socketRef.current.on("userStatusChange", ({ userId, status }: { userId: string; status: string }) => {
        setOnlineUsers((prev) => ({
          ...prev,
          [userId]: status === "online",
        }));

        // Also update any open message boxes for this user
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  isOnline: status === "online",
                  lastSeen: status !== "online" ? new Date() : user.lastSeen,
                }
              : user
          )
        );
      });

      // Listen for typing indicators
      socketRef.current.on("userTyping", ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
        setTypingUsers((prev) => ({
          ...prev,
          [userId]: isTyping,
        }));
      });

      // Listen for message read receipts
      socketRef.current.on("messageRead", (messageId: string) => {
        setMessageBoxes((prevBoxes) =>
          prevBoxes.map((box) => ({
            ...box,
            messages: box.messages.map((msg) =>
              msg.id === messageId ? { ...msg, isRead: true } : msg
            ),
          }))
        );
      });

      // Listen for message delivery confirmations
      socketRef.current.on("messageDelivered", ({ messageId, receiverId }: { messageId: string; receiverId: string }) => {
        setMessageBoxes((prevBoxes) =>
          prevBoxes.map((box) =>
            box.user.id === receiverId
              ? {
                  ...box,
                  messages: box.messages.map((msg) =>
                    msg.id === messageId ? { ...msg, isDelivered: true } : msg
                  ),
                }
              : box
          )
        );
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [session?.user?.id]);

  // Handle new messages coming in from socket
  const handleNewMessage = (message: Message) => {
    const currentUserId = session?.user?.id;
    if (!currentUserId) return;

    const otherUserId =
      message.senderId === currentUserId
        ? message.receiverId
        : message.senderId;

    // Mark message as delivered
    if (message.senderId !== currentUserId && socketRef.current) {
      socketRef.current.emit("deliverMessage", {
        messageId: message.id,
        senderId: message.senderId,
      });
    }

    setMessageBoxes((prevBoxes) => {
      const existingBoxIndex = prevBoxes.findIndex(
        (box) => box.user.id === otherUserId
      );

      if (existingBoxIndex >= 0) {
        // Update existing message box
        const updatedBoxes = [...prevBoxes];
        updatedBoxes[existingBoxIndex] = {
          ...updatedBoxes[existingBoxIndex],
          messages: [...updatedBoxes[existingBoxIndex].messages, message],
        };
        return updatedBoxes;
      } else {
        // We don't have a box open for this user yet, so don't create one automatically
        return prevBoxes;
      }
    });
  };

  // Fetch users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/user");
        if (response.data.success) {
          // Enhance with random online status for demonstration
          const enhancedUsers = response.data.data.map((user: User) => ({
            ...user,
            isOnline: Math.random() > 0.5,
            lastSeen: new Date(
              Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)
            ),
          }));
          setUsers(enhancedUsers);

          // Initialize online users state
          const onlineUsersMap: Record<string, boolean> = {};
          enhancedUsers.forEach((user: User) => {
            onlineUsersMap[user.id] = !!user.isOnline;
          });
          setOnlineUsers(onlineUsersMap);
        } else {
          console.error("Failed to fetch users:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current.forEach((ref) => {
      if (ref) {
        ref.scrollIntoView({ behavior: "smooth" });
      }
    });
  }, [messageBoxes]);

  const handleUserClick = async (user: User) => {
    const existingBox = messageBoxes.find((box) => box.user.id === user.id);

    if (existingBox) {
      setMessageBoxes(
        messageBoxes.map((box) =>
          box.user.id === user.id ? { ...box, isMinimized: false } : box
        )
      );
    } else if (messageBoxes.length < 3) {
      // Fetch existing messages when opening a chat box
      const senderId = session?.user?.id;
      const receiverId = user.id;

      if (!senderId) {
        console.error("Missing senderId");
        return;
      }

      try {
        // First try to fetch messages from API
        const response = await axios.get(`/api/messages`, {
          params: {
            senderId,
            receiverId,
          },
        });

        // Ensure fetchedMessages is always an array
        const fetchedMessages = Array.isArray(response.data)
          ? response.data
          : [];
        console.log("Fetched messages:", fetchedMessages);

        // Then if socket is connected, also request messages via socket
        if (socketRef.current) {
          socketRef.current.emit("fetchMessages", { senderId, receiverId });
        }

        // Create a new message box with fetched messages
        setMessageBoxes((prev) => [
          ...prev,
          {
            user,
            isMinimized: false,
            messages: fetchedMessages,
            message: "",
          },
        ]);

        // Switch to chats tab
        setActiveTab("chats");
      } catch (error) {
        console.error("Error fetching messages:", error);
        // Even if API fails, create an empty message box
        setMessageBoxes((prev) => [
          ...prev,
          { user, isMinimized: false, messages: [], message: "" },
        ]);
        setActiveTab("chats");
      }
    }
  };

  const handleCloseMessageBox = (userId: string) => {
    setMessageBoxes(messageBoxes.filter((box) => box.user.id !== userId));
  };

  const handleMinimizeMessageBox = (userId: string) => {
    setMessageBoxes(
      messageBoxes.map((box) =>
        box.user.id === userId ? { ...box, isMinimized: !box.isMinimized } : box
      )
    );
  };

  const handleSendMessage = async (userId: string) => {
    const box = messageBoxes.find((box) => box.user.id === userId);
    if (!box || !box.message.trim() || !session?.user?.id) return;

    const messageData = {
      senderId: session.user.id,
      receiverId: userId,
      content: box.message,
      createdAt: new Date().toISOString(),
      isRead: false,
      isDelivered: false,
    };

    // Optimistically update UI with new message
    const tempMessage = {
      id: `temp-${Date.now()}`,
      ...messageData,
    };

    setMessageBoxes(
      messageBoxes.map((box) =>
        box.user.id === userId
          ? {
              ...box,
              messages: [...box.messages, tempMessage],
              message: "",
            }
          : box
      )
    );

    try {
      // Send message via API
      await axios.post("/api/messages", messageData);

      // Send message via Socket
      if (socketRef.current) {
        socketRef.current.emit("sendMessage", messageData);

        // Stop typing indicator when sending message
        socketRef.current.emit("userTyping", {
          userId: session.user.id,
          receiverId: userId,
          isTyping: false,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally handle failure by showing an error message
    }
  };

  const handleMessageChange = (userId: string, message: string) => {
    setMessageBoxes(
      messageBoxes.map((box) =>
        box.user.id === userId ? { ...box, message } : box
      )
    );

    // Emit typing status
    if (socketRef.current && session?.user?.id) {
      // Clear any existing timeout
      if (typingTimeoutRef.current[userId]) {
        clearTimeout(typingTimeoutRef.current[userId]);
      }

      // Send typing indicator
      socketRef.current.emit("userTyping", {
        userId: session.user.id,
        receiverId: userId,
        isTyping: true,
      });

      // Set a timeout to stop typing indicator after 2 seconds of inactivity
      typingTimeoutRef.current[userId] = setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit("userTyping", {
            userId: session.user.id,
            receiverId: userId,
            isTyping: false,
          });
        }
      }, 2000);
    }
  };

  const handleEmojiClick = (userId: string, emojiObject: any) => {
    setMessageBoxes(
      messageBoxes.map((box) =>
        box.user.id === userId
          ? { ...box, message: box.message + emojiObject.emoji }
          : box
      )
    );
    setShowEmojiPicker(null);
  };

  // Mark message as read when it's visible
  const handleMessageRead = (message: Message) => {
    if (
      message.senderId !== session?.user?.id &&
      !message.isRead &&
      socketRef.current
    ) {
      socketRef.current.emit("markAsRead", message.id);

      // Update local state
      setMessageBoxes((prev) =>
        prev.map((box) => ({
          ...box,
          messages: box.messages.map((msg) =>
            msg.id === message.id ? { ...msg, isRead: true } : msg
          ),
        }))
      );
    }
  };

  const formatTime = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format relative time for messages
  const formatRelativeTime = (dateString: Date | string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHours = Math.round(diffMin / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffSec < 60) {
      return "just now";
    } else if (diffMin < 60) {
      return `${diffMin}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return "yesterday";
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  // Get message status component
  const getMessageStatus = (message: Message) => {
    if (message.senderId === session?.user?.id) {
      if (message.isRead) {
        return <CheckCheck size={14} className="text-blue-500" />;
      } else if (message.isDelivered) {
        return <CheckCheck size={14} className="text-gray-400" />;
      } else {
        return <Check size={14} className="text-gray-400" />;
      }
    }
    return null;
  };

  // Get user status component
  const getUserStatus = (user: User) => {
    return onlineUsers[user.id] ? (
      <Badge
        variant="outline"
        className="bg-green-500 border-green-500 text-white text-xs py-0 px-1.5"
      >
        Online
      </Badge>
    ) : user.lastSeen ? (
      <span className="text-xs text-gray-400">
        Last seen {formatRelativeTime(user.lastSeen)}
      </span>
    ) : null;
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="bg-green-500 text-white p-4">
        <CardTitle className="text-lg font-bold">Messages</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs
          defaultValue="contacts"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Users size={16} />
              <span>Contacts</span>
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex items-center gap-2">
              <MessageSquare size={16} />
              <span>
                Chats {messageBoxes.length > 0 && `(${messageBoxes.length})`}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="m-0">
            <div className="h-[400px] overflow-y-auto">
              {users
                .filter((user) => user.id !== session?.user?.id)
                .map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-4 border-b border-gray-100"
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage
                            src={user.profileImage || "/placeholder.svg"}
                            alt={user.name}
                          />
                          <AvatarFallback>
                            {user.name ? user.name.charAt(0) : "?"}
                          </AvatarFallback>
                        </Avatar>
                        {onlineUsers[user.id] && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {user.name || user.username}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {getUserStatus(user)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="chats" className="m-0">
            <div className="h-[400px] overflow-y-auto">
              {messageBoxes.length > 0 ? (
                messageBoxes.map((box, index) => (
                  <div
                    key={box.user.id}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between p-3 bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/user-profile/${box.user.id}`}
                          className="flex items-center space-x-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={
                                  box.user.profileImage ||
                                  "https://i.pravatar.cc/150"
                                }
                                alt={box.user.username || "User"}
                              />
                              <AvatarFallback>
                                {box.user.username
                                  ? box.user.username.charAt(0)
                                  : "?"}
                              </AvatarFallback>
                            </Avatar>
                            {onlineUsers[box.user.id] && (
                              <span className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 rounded-full border-2 border-white"></span>
                            )}
                          </div>
                        </Link>
                        <div>
                          <span className="font-medium">
                            {box.user.name || box.user.username}
                          </span>
                          <div className="text-xs text-gray-400">
                            {typingUsers[box.user.id] ? (
                              <span className="text-green-500">Typing...</span>
                            ) : (
                              getUserStatus(box.user)
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleMinimizeMessageBox(box.user.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {box.isMinimized ? (
                            <Maximize2 size={18} />
                          ) : (
                            <Minimize2 size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => handleCloseMessageBox(box.user.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>

                    {!box.isMinimized && (
                      <>
                        <div className="h-48 p-4 overflow-y-auto">
                          {Array.isArray(box.messages) &&
                          box.messages.length > 0 ? (
                            box.messages.map((msg, msgIndex) => {
                              const isCurrentUser =
                                msg.senderId === session?.user?.id;

                              // Mark received messages as read when displayed
                              if (!isCurrentUser && !msg.isRead) {
                                handleMessageRead(msg);
                              }

                              return (
                                <div
                                  key={msg.id || msgIndex}
                                  className={`mb-3 flex ${
                                    isCurrentUser
                                      ? "justify-end"
                                      : "justify-start"
                                  }`}
                                >
                                  <div
                                    className={`max-w-[75%] px-3 py-2 rounded-lg ${
                                      isCurrentUser
                                        ? "bg-green-500 text-white rounded-tr-none"
                                        : "bg-gray-200 dark:bg-gray-700 rounded-tl-none"
                                    }`}
                                  >
                                    <p className="text-sm">{msg.content}</p>
                                    <div className="flex items-center justify-end mt-1 space-x-1">
                                      <span
                                        className={`text-xs ${
                                          isCurrentUser
                                            ? "text-green-100"
                                            : "text-gray-500 dark:text-gray-400"
                                        }`}
                                      >
                                        {formatTime(msg.createdAt)}
                                      </span>
                                      {isCurrentUser && getMessageStatus(msg)}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-center text-gray-500 dark:text-gray-400">
                              No messages yet
                            </div>
                          )}
                          <div
                            ref={(el) => {
                              if (el) messagesEndRef.current[index] = el;
                            }}
                          />
                          {typingUsers[box.user.id] && (
                            <div className="flex items-center text-xs text-gray-500 mt-2">
                              <div className="flex space-x-1 mr-1">
                                <span className="animate-pulse">.</span>
                                <span className="animate-pulse animation-delay-200">
                                  .
                                </span>
                                <span className="animate-pulse animation-delay-400">
                                  .
                                </span>
                              </div>
                              <span>{box.user.name || "User"} is typing</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-gray-50">
                          <div className="flex items-center space-x-2">
                            <Input
                              type="text"
                              placeholder="Type a message..."
                              value={box.message}
                              onChange={(e) =>
                                handleMessageChange(box.user.id, e.target.value)
                              }
                              className="flex-grow"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage(box.user.id);
                                }
                              }}
                            />
                            <div className="relative">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                  setShowEmojiPicker(
                                    showEmojiPicker === box.user.id
                                      ? null
                                      : box.user.id
                                  )
                                }
                              >
                                <Smile className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                              </Button>
                              {showEmojiPicker === box.user.id && (
                                <div className="absolute bottom-full right-0 mb-2 z-50">
                                  <EmojiPicker
                                    onEmojiClick={(emojiObject) =>
                                      handleEmojiClick(box.user.id, emojiObject)
                                    }
                                  />
                                </div>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                  <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <ImageIcon className="mr-2 h-4 w-4" />
                                  <span>Add Image</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Video className="mr-2 h-4 w-4" />
                                  <span>Add Video</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <File className="mr-2 h-4 w-4" />
                                  <span>Add File</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                              size="icon"
                              onClick={() => handleSendMessage(box.user.id)}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <Send className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-500">
                  <MessageSquare size={48} className="mb-4 opacity-20" />
                  <p>No active chats</p>
                  <p className="text-sm mt-2">
                    Select a contact to start chatting
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ChatCard;
