// src/context/ChatContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { socket } from "../socket";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
}

interface ChatContextType {
  messages: Message[];
  sendMessage: (message: Omit<Message, "id" | "createdAt">) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    socket.on("newMessage", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("newMessage");
    };
  }, []);

  const sendMessage = (message: Omit<Message, "id" | "createdAt">) => {
    socket.emit("sendMessage", message);
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage }}>
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
