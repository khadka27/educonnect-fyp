"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ChatComponent = () => {
  const { id: receiverId } = useParams(); // Get the receiver's ID from URL
  const { data: session } = useSession();
  const senderId = session?.user?.id; // Get the current user's ID
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = async () => {
    if (newMessage && senderId && receiverId) {
      try {
        const response = await axios.post("/api/messages/chat", {
          content: newMessage,
          senderId,
          receiverId,
        });

        if (response.status === 201) {
          console.log("Message sent successfully!");
          setNewMessage(""); // Clear the input
        } else {
          console.error("Failed to send message:", response.data.message);
        }
      } catch (error) {
        console.error("Error sending message:", (error as Error).message);
      }
    }
  };

  return (
    <div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage();
          }
        }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatComponent;
