// import { useEffect, useState } from "react";
// import { socket } from "@/socket";
// import _ from 'lodash';

// const Chat = () => {
//   const [messages, setMessages] = useState<{ content: string; id: string }[]>([]);
//   const [message, setMessage] = useState("");

//   // Use lodash's debounce to batch state updates
//   const updateMessages = _.debounce((newMessage) => {
//     setMessages((prevMessages) => [...prevMessages, newMessage]);
//   }, 100);

//   useEffect(() => {
//     socket.on("newMessage", (newMessage: { content: string; id: string; }) => {
//       updateMessages(newMessage);
//     });

//     return () => {
//       socket.off("newMessage");
//     };
//   }, []);

//   const sendMessage = () => {
//     const newMessage = {
//       content: message,
//       senderId: "cm15sc1u600001174tvyj0ob5",
//       receiverId: "cm15sopnl00011174y4qdiqf9",
//       groupId: null
//     };

//     socket.emit("sendMessage", newMessage);
//     setMessage(""); // Reset the message input
//   };

//   return (
//     <div>
//       <h2>Chat</h2>
//       <div>
//         {messages.map((msg, index) => (
//           <div key={index}>{msg.content}</div>
//         ))}
//       </div>
//       <input
//         type="text"
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//         placeholder="Type a message"
//       />
//       <button onClick={sendMessage}>Send</button>
//     </div>
//   );
// };

// export default Chat;
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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

const ChatInterface = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ERROR: The useChat hook was not properly integrated, causing messages not to update in real-time
  // FIX: Properly destructure and use the useChat hook
  const { messages, sendMessage, sendFile, markAsRead, fetchMessages } = useChat();

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
    window.addEventListener('resize', scrollToBottom);

    return () => window.removeEventListener('resize', scrollToBottom);
  }, [messages]);

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim() && selectedUser && session?.user?.id) {
      sendMessage({
        content: newMessage,
        senderId: session.user.id,
        receiverId: selectedUser.id,
      });
      setNewMessage("");
    }
  }, [newMessage, selectedUser, session, sendMessage]);

  const handleSendFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [selectedUser, session, sendFile]);

  const handleUserSelect = useCallback((user: User) => {
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
  }, [session, fetchMessages, messages, markAsRead]);

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  const formatTimestamp = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className={`flex h-screen ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* User list sidebar */}
      <div
        className={`${
          showSidebar ? "block" : "hidden"
        } md:block w-full md:w-1/4 lg:w-1/5 border-r ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div
          className={`p-4 border-b ${
            theme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <Input placeholder="Search" className="w-full" />
        </div>
        <ScrollArea className="h-[calc(100vh-60px)]">
          {users.map((user) => (
            <div
              key={user.id}
              className={`flex items-center p-4 cursor-pointer ${
                selectedUser?.id === user.id
                  ? theme === "dark"
                    ? "bg-gray-800"
                    : "bg-green-100"
                  : ""
              }`}
              onClick={() => handleUserSelect(user)}
            >
              <Avatar className="w-10 h-10 mr-3">
                <AvatarImage src={user.profileImage} />
                <AvatarFallback>
                  {user.name ? user.name[0] : "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{user.name}</h3>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {user.email}
                </p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div
              className={`p-4 flex items-center justify-between border-b ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
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
                <Avatar className="w-10 h-10 mr-3">
                  <AvatarImage src={selectedUser.profileImage} />
                  <AvatarFallback>
                    {selectedUser.name ? selectedUser.name[0] : "?"}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-semibold">{selectedUser.name}</h2>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Info className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 ${
                    message.senderId === session?.user?.id
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block p-2 rounded-lg ${
                      message.senderId === session?.user?.id
                        ? theme === "dark"
                          ? "bg-blue-600 text-white"
                          : "bg-blue-500 text-white"
                        : theme === "dark"
                        ? "bg-gray-700"
                        : "bg-gray-200"
                    }`}
                  >
                    {message.content}
                    {message.fileUrl && (
                      <a
                        href={message.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-blue-400"
                      >
                        Download {message.fileType}
                      </a>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTimestamp(message.createdAt)}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Message input */}
            <div className="flex items-center p-4 border-t">
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
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 mx-2"
              />
              <Button onClick={handleSendMessage} className="h-10">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
