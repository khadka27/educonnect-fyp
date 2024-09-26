// src/components/chat/Chat.tsx
"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useSession } from "next-auth/react";

const socket = io("http://localhost:4000"); // Ensure this matches your Socket.io server URL

interface ChatProps {
  receiverId: string;
}

const Chat = ({ receiverId }: ChatProps) => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ content: string; senderId: string; receiverId: string }[]>([]);
  const { data: session } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    fetchChatHistory();

    socket.on("receiveMessage", (message) => {
      setChatHistory((prev) => [...prev, message]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [receiverId]);

  const fetchChatHistory = async () => {
    if (userId && receiverId) {
      const response = await axios.get(`/api/messages/fetchMessages`, {
        params: { senderId: userId, receiverId },
      });
      setChatHistory(response.data.messages);
    }
  };

  const sendMessage = async () => {
    if (message && receiverId && userId) {
      const newMessage = { content: message, senderId: userId, receiverId };
      socket.emit("sendMessage", newMessage);
      await axios.post("/api/messages/sendMessage", newMessage);
      setMessage("");
      setChatHistory((prev) => [...prev, newMessage]);
    }
  };

  return (
    <div>
      <h2>Chat with {receiverId}</h2>
      <div style={{ maxHeight: '400px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
        {chatHistory.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.senderId === userId ? 'right' : 'left' }}>
            <strong>{msg.senderId}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
