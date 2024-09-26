// src/app/chat/[receiverId]/page.tsx
"use client";

import { useRouter } from "next/router";
import Chat from "@/components/chat/chat";

const ChatPage = () => {
  const router = useRouter();
  const { receiverId } = router.query;

  return (
    <div>
      {receiverId ? <Chat receiverId={Array.isArray(receiverId) ? receiverId[0] : receiverId} /> : <p>Loading...</p>}
    </div>
  );
};

export default ChatPage;
