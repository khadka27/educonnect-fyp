"use client";

import { useEffect, useState } from "react";
import { socket } from "@/socket";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected");
    });

    // Listen for server messages if needed
    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message"); // Cleanup listener
    };
  }, []);

  const sendMessage = () => {
    socket.emit(
      "message",
      "Hello from client",
      (response: { status: string; response?: string }) => {
        if (response.status === "success") {
          setMessages((prev) => [...prev, response.response!]);
        } else {
          setError("Error sending message");
        }
      }
    );
  };

  return (
    <div>
      <h1>Socket.IO with Next.js</h1>
      <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
      <button onClick={sendMessage} disabled={!isConnected}>
        Send Message
      </button>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <ul>
        {messages.map((msg, idx) => (
          <li key={idx}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}
