// src/app/components/ChatDisplay.tsx

import React from 'react';

const ChatDisplay = React.forwardRef<HTMLDivElement, { messages: any[] }>(({ messages }, ref) => {
  return (
    <div className="chat-display" ref={ref}>
      {messages.map((message) => (
        <div key={message.id} className={`message ${message.senderId === '{YOUR_SENDER_ID}' ? 'sent' : 'received'}`}>
          <p>{message.content}</p>
          <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
        </div>
      ))}
    </div>
  );
});

ChatDisplay.displayName = 'ChatDisplay'; // Set display name for debugging
export default ChatDisplay;
