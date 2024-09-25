// src/app/components/ChatHeader.tsx

import React from 'react';

const ChatHeader = ({ id }: { id: string }) => {
  return (
    <div className="chat-header">
      <h2>Chat with {id}</h2>
    </div>
  );
};

export default ChatHeader;
