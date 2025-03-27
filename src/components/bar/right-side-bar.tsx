"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import {
  Smile,
  Paperclip,
  Send,
  Minimize2,
  Maximize2,
  Menu,
  Image,
  Video,
  File,
  X,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import Link from "next/link";
import  io,{ Socket } from "socket.io-client"; // Import Socket.IO client with type
import { useSession } from "next-auth/react";

interface User {
  id: string;
  name: string;
  profileImage: string;
  username: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date | string;
}

interface MessageBox {
  user: User;
  isMinimized: boolean;
  messages: Message[];
  message: string;
}

const RightSidebar: React.FC = () => {
  const [messageBoxes, setMessageBoxes] = useState<MessageBox[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const { data: session } = useSession();
  const socketRef = useRef<  Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement[]>([]);

  // Initialize socket connection
  useEffect(() => {
    // Only establish socket connection if we have a valid session
    if (session?.user?.id) {
      // Create socket connection
      socketRef.current = io("http://localhost:4000", {
        transports: ["websocket"],
        query: { userId: session.user.id },
      });

      // Join room for the current user
      socketRef.current.emit("joinRoom", session.user.id);

      // Set up socket event listeners
      socketRef.current.on("newMessage", (message: Message) => {
        console.log("Received new message:", message);
        handleNewMessage(message);
      });

      socketRef.current.on("messageHistory", (messages: Message[]) => {
        console.log("Received message history:", messages);
        // Handle message history when it comes back from socket
      });

      // Clean up
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [session?.user?.id]);

  // Handle new messages coming in from socket
  const handleNewMessage = (message: Message) => {
    // Get the other party's id (whether sender or receiver)
    const currentUserId = session?.user?.id;
    if (!currentUserId) return;

    const otherUserId =
      message.senderId === currentUserId
        ? message.receiverId
        : message.senderId;

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
          setUsers(response.data.data);
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
      } catch (error) {
        console.error("Error fetching messages:", error);
        // Even if API fails, create an empty message box
        setMessageBoxes((prev) => [
          ...prev,
          { user, isMinimized: false, messages: [], message: "" },
        ]);
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

  const formatTime = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* User list sidebar */}
      <div className="fixed right-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col">
        <div className="p-4 bg-green-500 dark:bg-green-600 text-white">
          <h2 className="font-bold text-lg">Contacts</h2>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {users
            .filter((user) => user.id !== session?.user?.id) // Filter out current user
            .map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg"
                onClick={() => handleUserClick(user)}
              >
                <Avatar>
                  <AvatarImage src={user.profileImage} alt={user.name} />
                  <AvatarFallback>
                    {user.name ? user.name.charAt(0) : "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user.name || user.username}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Chat message boxes */}
      <div className="fixed bottom-0 right-64 flex space-x-4">
        {messageBoxes.map((box, index) => (
          <div
            key={box.user.id}
            className={`w-80 bg-white dark:bg-gray-800 shadow-lg rounded-t-lg overflow-hidden transition-all duration-300 ease-in-out ${
              box.isMinimized ? "h-12" : "h-96"
            }`}
            style={{ right: `${index * 320 + 72}px` }}
          >
            <div className="flex items-center justify-between p-3 bg-green-500 dark:bg-green-600 text-white">
              <div className="flex items-center space-x-2">
                <Link
                  href={`/user-profile/${box.user.id}`}
                  className="flex items-center space-x-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={box.user.profileImage || "https://i.pravatar.cc/150"}
                      alt={box.user.username || "User"}
                    />
                    <AvatarFallback>
                      {box.user.username ? box.user.username.charAt(0) : "?"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <span className="font-medium">
                  {box.user.name || box.user.username}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleMinimizeMessageBox(box.user.id)}
                  className="text-white hover:text-gray-200"
                >
                  {box.isMinimized ? (
                    <Maximize2 size={18} />
                  ) : (
                    <Minimize2 size={18} />
                  )}
                </button>
                <button
                  onClick={() => handleCloseMessageBox(box.user.id)}
                  className="text-white hover:text-gray-200"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            {!box.isMinimized && (
              <>
                <div className="h-64 p-4 overflow-y-auto">
                  {Array.isArray(box.messages) ? (
                    box.messages.map((msg, msgIndex) => {
                      const isCurrentUser = msg.senderId === session?.user?.id;
                      return (
                        <div
                          key={msg.id || msgIndex}
                          className={`mb-3 flex ${
                            isCurrentUser ? "justify-end" : "justify-start"
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
                            <span
                              className={`text-xs mt-1 block ${
                                isCurrentUser
                                  ? "text-green-100"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {formatTime(msg.createdAt)}
                            </span>
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
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-700">
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
                            showEmojiPicker === box.user.id ? null : box.user.id
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
                          <Image className="mr-2 h-4 w-4" />
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
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Mobile menu toggle */}
      <div className="fixed top-3 right-3 md:hidden">
        <Button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          variant="outline"
          size="icon"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="absolute right-0 top-0 h-full w-64 bg-white dark:bg-gray-800 p-4">
            <Button
              onClick={() => setIsMobileMenuOpen(false)}
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
            >
              <X className="h-5 w-5" />
            </Button>
            <h2 className="font-bold text-lg mb-4">Contacts</h2>
            {users
              .filter((user) => user.id !== session?.user?.id)
              .map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg mb-2"
                  onClick={() => {
                    handleUserClick(user);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Avatar>
                    <AvatarImage src={user.profileImage} alt={user.name} />
                    <AvatarFallback>
                      {user.name ? user.name.charAt(0) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {user.name || user.username}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default RightSidebar;
