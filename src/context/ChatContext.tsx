"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { socket } from "../socket";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
  fileUrl?: string;
  fileType?: string;
  isRead?: boolean;
}

interface ChatContextType {
  messages: Message[];
  sendMessage: (message: Omit<Message, "id" | "createdAt">) => void;
  sendFile: (fileData: {
    content: string;
    fileName: string;
    fileType: string;
    receiverId: string;
    groupId?: string;
  }) => void;
  markAsRead: (messageId: string) => void;
  fetchMessages: (senderId: string, receiverId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{
  children: React.ReactNode;
  userId: string;
}> = ({ children, userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    socket.connect();
    socket.emit("joinRoom", userId);

    const handleNewMessage = (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    const handleMessageHistory = (fetchedMessages: Message[]) => {
      setMessages(fetchedMessages);
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageHistory", handleMessageHistory);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageHistory", handleMessageHistory);
      socket.disconnect();
    };
  }, [userId]);

  const fetchMessages = (senderId: string, receiverId: string) => {
    socket.emit("fetchMessages", { senderId, receiverId });
  };

  const sendMessage = (message: Omit<Message, "id" | "createdAt">) => {
    const newMessage = {
      ...message,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    socket.emit("sendMessage", newMessage);
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const sendFile = ({
    content,
    fileName,
    fileType,
    receiverId,
    groupId,
  }: {
    content: string;
    fileName: string;
    fileType: string;
    receiverId: string;
    groupId?: string;
  }) => {
    const newMessage = {
      id: Date.now().toString(),
      content,
      senderId: userId,
      receiverId,
      groupId,
      createdAt: new Date().toISOString(),
      fileUrl: fileName,
      fileType,
    };
    socket.emit("sendFile", newMessage);
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const markAsRead = (messageId: string) => {
    socket.emit("markAsRead", messageId);
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, isRead: true } : msg
      )
    );
  };

  return (
    <ChatContext.Provider
      value={{ messages, sendMessage, sendFile, markAsRead, fetchMessages }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
