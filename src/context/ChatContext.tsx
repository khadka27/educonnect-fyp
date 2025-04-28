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
  sendMessage: (message: any) => void;
  sendFile: (fileData: {
    content: string;
    fileName: string;
    fileType: string;
    receiverId: string;
    groupId?: string;
  }) => void;
  markAsRead: (messageId: string) => void;
  fetchMessages: (senderId: string, receiverId: string) => void;
  isConnected: boolean;
  error: Error | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{
  children: React.ReactNode;
  userId: string;
}> = ({ children, userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [pendingMessageIds, setPendingMessageIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;

    // Connect socket
    if (!socket.connected) {
      socket.connect();
    }
    
    // Join user's room for receiving messages
    socket.emit("joinRoom", userId);
    
    console.log("Chat socket connected, joined room:", userId);

    // Set up event handlers
    const handleConnect = () => {
      console.log("Socket connected");
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    };

    const handleError = (err: Error) => {
      console.error("Socket error:", err);
      setError(err);
    };

    const handleNewMessage = (message: Message) => {
      console.log("New message received:", message);
      
      // Only add message if it involves the current user
      if (message.senderId === userId || message.receiverId === userId) {
        setMessages((prevMessages) => {
          // Check if we have a pending optimistic message that can be replaced
          const tempMsgIndex = prevMessages.findIndex(
            msg => msg.id.startsWith('temp-') && 
                   msg.content === message.content &&
                   msg.senderId === message.senderId &&
                   msg.receiverId === message.receiverId &&
                   (new Date(msg.createdAt).getTime() > Date.now() - 10000) // Within last 10 seconds
          );
          
          // If found a matching temp message, replace it
          if (tempMsgIndex !== -1) {
            const newMessages = [...prevMessages];
            newMessages[tempMsgIndex] = message;
            return newMessages;
          }
          
          // Otherwise check if this message already exists
          if (prevMessages.some(msg => msg.id === message.id)) {
            return prevMessages;
          }
          
          // It's a genuinely new message
          return [...prevMessages, message];
        });
      }
    };

    const handleMessageHistory = (fetchedMessages: Message[]) => {
      console.log("Message history received:", fetchedMessages);
      setMessages(fetchedMessages || []);
      // Clear pending messages when loading history
      setPendingMessageIds(new Set());
    };

    // Register event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("error", handleError);
    socket.on("newMessage", handleNewMessage);
    socket.on("messageHistory", handleMessageHistory);

    // Cleanup on unmount
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("error", handleError);
      socket.off("newMessage", handleNewMessage);
      socket.off("messageHistory", handleMessageHistory);
    };
  }, [userId]);

  const fetchMessages = (senderId: string, receiverId: string) => {
    console.log("Fetching messages between", senderId, "and", receiverId);
    socket.emit("fetchMessages", { senderId, receiverId });
  };

  const sendMessage = (messageData: any) => {
    if (!messageData.senderId || !messageData.receiverId || !messageData.content) {
      console.error("Invalid message data:", messageData);
      return;
    }

    // Generate a temporary ID for optimistic updates
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    console.log("Sending message:", messageData);
    socket.emit("sendMessage", {
      content: messageData.content,
      senderId: messageData.senderId,
      receiverId: messageData.receiverId
    });
    
    // Add optimistic message to UI immediately
    const optimisticMessage = {
      ...messageData,
      id: tempId,
      createdAt: messageData.createdAt || new Date().toISOString(),
    };
    
    // Track this message as pending
    setPendingMessageIds(prev => new Set(prev).add(tempId));
    
    setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
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
    const fileData = {
      fileName: content,
      fileType,
      fileData: fileName,
      senderId: userId,
      receiverId,
      groupId,
    };
    
    // Generate a temporary ID for optimistic updates
    const tempId = `temp-file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    console.log("Sending file:", fileData);
    socket.emit("sendFile", fileData);
    
    const newMessage = {
      id: tempId,
      content,
      senderId: userId,
      receiverId,
      groupId,
      createdAt: new Date().toISOString(),
      fileUrl: fileName,
      fileType,
    };
    
    // Track this message as pending
    setPendingMessageIds(prev => new Set(prev).add(tempId));
    
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
      value={{ 
        messages, 
        sendMessage, 
        sendFile, 
        markAsRead, 
        fetchMessages, 
        isConnected,
        error
      }}
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
