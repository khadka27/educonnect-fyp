// src/app/page.tsx
"use client";

import DirectChat from "@/components/chat/DirectChat";

export default function Home() {
  return (
    <div className="mt-44">
      <h1>Welcome to the Chat App</h1>
      <DirectChat />
    </div>
  );
}
