"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { ScrollArea } from "src/components/ui/scroll-area";
import { Input } from "src/components/ui/input";
import { Button } from "src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar";
import { Send, Paperclip, Phone, Video, Info, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useChat } from "@/context/ChatContext";
import _ from "lodash";

interface User {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  username: string;
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

// Update the ChatInterface component with improved UI
const ChatInterface = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Keep all the hooks and functions the same
  const { messages, sendMessage, sendFile, markAsRead, fetchMessages } =
    useChat();

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get("/api/user");
      const allUsers = response.data.data;
      if (Array.isArray(allUsers) && session?.user?.id) {
        const availableUsers = allUsers.filter(
          (user: User) => user.id !== session.user.id
        );
        setUsers(availableUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchUsers();
    }
  }, [status, fetchUsers]);

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    scrollToBottom();
    window.addEventListener("resize", scrollToBottom);

    return () => window.removeEventListener("resize", scrollToBottom);
  }, [messages]);

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim() && selectedUser && session?.user?.id) {
      const newMsgId = _.uniqueId("msg_");
      const msg = {
        id: newMsgId,
        content: newMessage,
        senderId: session.user.id,
        receiverId: selectedUser.id,
        createdAt: new Date().toISOString(),
      };

      sendMessage(msg);
      setNewMessage("");
      setIsTyping(false);
    }
  }, [newMessage, selectedUser, session, sendMessage]);

  const handleSendFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && selectedUser && session?.user?.id) {
        const reader = new FileReader();
        reader.onloadend = () => {
          sendFile({
            content: file.name,
            fileName: reader.result as string,
            fileType: file.type,
            receiverId: selectedUser.id,
          });
        };
        reader.readAsDataURL(file);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [selectedUser, session, sendFile]
  );

  const handleUserSelect = useCallback(
    (user: User) => {
      setSelectedUser(user);
      setShowSidebar(false);

      if (session?.user?.id) {
        fetchMessages(session.user.id, user.id);
        messages.forEach((msg) => {
          if (msg.receiverId === session.user.id && !msg.isRead) {
            markAsRead(msg.id);
          }
        });
      }
    },
    [session, fetchMessages, messages, markAsRead]
  );

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  const formatTimestamp = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  return (
    <div
      className={`flex h-screen mt-10 pl-5 md:pl-10 lg:pl-20 ${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* User list sidebar - 20% width as requested */}
      <div
        className={`${
          showSidebar
            ? "fixed inset-0 z-50 w-full md:relative md:inset-auto"
            : "hidden"
        } md:block w-full md:w-1/5 lg:w-1/5 border-r transition-all duration-300 ease-in-out ${
          theme === "dark"
            ? "border-gray-700 bg-gray-800"
            : "border-gray-200 bg-white"
        }`}
      >
        <div
          className={`p-4 border-b sticky top-0 z-10 ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold">Chats</h2>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <Input
            placeholder="Search users..."
            className="w-full rounded-full"
          />
        </div>
        <ScrollArea className="h-[calc(100vh-130px)]">
          {users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className={`flex items-center p-4 cursor-pointer hover:${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                } transition-colors duration-200 ${
                  selectedUser?.id === user.id
                    ? theme === "dark"
                      ? "bg-gray-700 border-l-4 border-blue-500"
                      : "bg-blue-50 border-l-4 border-blue-500"
                    : ""
                }`}
                onClick={() => handleUserSelect(user)}
              >
                <Avatar className="w-12 h-12 mr-3 ring-2 ring-offset-2 ring-offset-background ring-primary">
                  <AvatarImage src={user.profileImage} />
                  <AvatarFallback
                    className={`${
                      theme === "dark" ? "bg-gray-600" : "bg-blue-100"
                    }`}
                  >
                    {user.name ? user.name[0].toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{user.name}</h3>
                  <p
                    className={`text-sm truncate ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {user.username || user.email}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No users found</div>
          )}
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col relative">
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div
              className={`p-4 flex items-center justify-between border-b sticky top-0 z-10 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-900"
                  : "border-gray-200 bg-white"
              } shadow-sm`}
            >
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden mr-2"
                  onClick={toggleSidebar}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <Avatar className="w-10 h-10 mr-3 ring-2 ring-offset-2 ring-offset-background ring-primary">
                  <AvatarImage src={selectedUser.profileImage} />
                  <AvatarFallback
                    className={`${
                      theme === "dark" ? "bg-gray-600" : "bg-blue-100"
                    }`}
                  >
                    {selectedUser.name
                      ? selectedUser.name[0].toUpperCase()
                      : "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold">{selectedUser.name}</h2>
                  <p
                    className={`text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {selectedUser.username || selectedUser.email}
                  </p>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <Phone className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <Video className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <Info className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea
              className="flex-1 p-4 bg-opacity-50"
              style={{
                backgroundImage:
                  theme === "dark"
                    ? "radial-gradient(circle at center, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.2) 100%)"
                    : "radial-gradient(circle at center, rgba(241, 245, 249, 0.4) 0%, rgba(248, 250, 252, 0.2) 100%)",
              }}
            >
              <div className="space-y-4 py-2">
                {messages.length > 0 ? (
                  messages.map((message) => {
                    const isSender = message.senderId === session?.user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isSender ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] md:max-w-[70%] ${
                            isSender ? "order-2" : "order-1"
                          }`}
                        >
                          {!isSender && (
                            <Avatar className="w-8 h-8 mb-1 inline-block mr-2">
                              <AvatarImage src={selectedUser.profileImage} />
                              <AvatarFallback
                                className={`${
                                  theme === "dark"
                                    ? "bg-gray-600"
                                    : "bg-blue-100"
                                }`}
                              >
                                {selectedUser.name
                                  ? selectedUser.name[0].toUpperCase()
                                  : "?"}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`p-3 rounded-2xl ${
                              isSender
                                ? theme === "dark"
                                  ? "bg-blue-600 text-white rounded-tr-none"
                                  : "bg-blue-500 text-white rounded-tr-none"
                                : theme === "dark"
                                ? "bg-gray-700 rounded-tl-none"
                                : "bg-white rounded-tl-none shadow-sm"
                            } break-words`}
                          >
                            <p className="text-sm md:text-base">
                              {message.content}
                            </p>
                            {message.fileUrl && (
                              <a
                                href={message.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`block mt-1 text-sm ${
                                  isSender ? "text-blue-200" : "text-blue-400"
                                } underline`}
                              >
                                Download {message.fileType}
                              </a>
                            )}
                            <div
                              className={`text-xs mt-1 ${
                                isSender
                                  ? "text-blue-200"
                                  : theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            >
                              {formatTimestamp(message.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full py-20">
                    <div className="text-center">
                      <div
                        className={`p-4 rounded-full mx-auto mb-4 ${
                          theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                        }`}
                      >
                        <Send className="h-8 w-8 opacity-50" />
                      </div>
                      <p className="text-gray-500">No messages yet</p>
                      <p className="text-sm text-gray-400">
                        Send a message to start the conversation
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Message input */}
            <div
              className={`p-4 border-t ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleSendFile}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="pr-12 rounded-full py-6 pl-4 bg-opacity-50"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className={`absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full h-9 w-9 p-0 ${
                      isTyping
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    } transition-colors duration-200`}
                    disabled={!isTyping}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div
              className={`p-6 rounded-full mb-4 ${
                theme === "dark" ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <Send className="h-12 w-12 opacity-30" />
            </div>
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

export default ChatInterface;
