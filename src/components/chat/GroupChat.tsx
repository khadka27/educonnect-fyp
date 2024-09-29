// src/components/GroupChat.tsx
"use client";
import React, { useState } from 'react';
import { useChat } from '@/context/ChatContext';

const GroupChat: React.FC<{ userId: string; groupId: string }> = ({ userId, groupId }) => {
  const { messages, sendMessage } = useChat();
  const [messageContent, setMessageContent] = useState('');

  const handleSendMessage = () => {
    if (messageContent.trim()) {
      sendMessage({ content: messageContent, senderId: userId, groupId });
      setMessageContent('');
    }
  };

  return (
    <div>
      <h2>Group Chat</h2>
      <div>
        {messages
          .filter((msg) => msg.groupId === groupId)
          .map((msg) => (
            <div key={msg.id}>
              <strong>{msg.senderId}:</strong> {msg.content}
            </div>
          ))}
      </div>
      <input
        type="text"
        value={messageContent}
        onChange={(e) => setMessageContent(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default GroupChat;
