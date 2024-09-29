import { useEffect, useState } from "react";
import { socket } from "@/socket";
import _ from 'lodash';

const Chat = () => {
  const [messages, setMessages] = useState<{ content: string; id: string }[]>([]);
  const [message, setMessage] = useState("");

  // Use lodash's debounce to batch state updates
  const updateMessages = _.debounce((newMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  }, 100);

  useEffect(() => {
    socket.on("newMessage", (newMessage: { content: string; id: string; }) => {
      updateMessages(newMessage);
    });

    return () => {
      socket.off("newMessage");
    };
  }, []);

  const sendMessage = () => {
    const newMessage = {
      content: message,
      senderId: "cm15sc1u600001174tvyj0ob5",
      receiverId: "cm15sopnl00011174y4qdiqf9",
      groupId: null
    };

    socket.emit("sendMessage", newMessage);
    setMessage(""); // Reset the message input
  };

  return (
    <div>
      <h2>Chat</h2>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>{msg.content}</div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
