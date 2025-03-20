"use client";

import DirectChat from "src/components/chat/DirectChat";

export default function ChatPage() {
  return (
    <div className="flex h-screen">
      {/* 20% left gap */}
      <div className="w-[20%] h-full"></div>

      {/* Chat container - 80% width */}
      <div className="w-[80%] h-full">
        <DirectChat />
      </div>
    </div>
  );
}
