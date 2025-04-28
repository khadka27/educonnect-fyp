"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import DirectChat from "src/components/chat/direct-chat";
import { ChatProvider } from "src/context/ChatContext";
import { Skeleton } from "src/components/ui/skeleton";

export default function MessagesPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id || "";

  return (
    <div className="flex h-screen w-full p-4 md:p-6">
      <ChatProvider userId={userId}>
        <Suspense fallback={<ChatSkeleton />}>
          <DirectChat />
        </Suspense>
      </ChatProvider>
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="flex h-full w-full shadow-lg overflow-hidden mb-4">
      {/* Sidebar skeleton */}
      <div className="hidden md:block w-1/3 border-r bg-background">
        <div className="p-4 border-b">
          <Skeleton className="h-8 w-40 mb-4" />
          <Skeleton className="h-10 w-full rounded-full" />
        </div>
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area skeleton */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center">
            <Skeleton className="h-10 w-10 rounded-full mr-3" />
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Incoming messages */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`incoming-${i}`} className="flex justify-start">
                <Skeleton className="h-10 w-10 rounded-full mr-2 flex-shrink-0" />
                <div className="max-w-[75%]">
                  <Skeleton
                    className={`h-${16 + i * 6} w-${
                      48 + i * 8
                    } rounded-2xl mb-1`}
                  />
                  <Skeleton className="h-3 w-16 ml-1" />
                </div>
              </div>
            ))}

            {/* Date separator */}
            <div className="flex justify-center my-6">
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            {/* Outgoing messages */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`outgoing-${i}`} className="flex justify-end">
                <div className="max-w-[75%]">
                  <Skeleton
                    className={`h-${14 + i * 4} w-${
                      44 + i * 6
                    } rounded-2xl mb-1 bg-primary/20`}
                  />
                  <div className="flex justify-end items-center gap-1 mr-1">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-3 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
            <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
            <div className="flex-1 relative">
              <Skeleton className="h-12 w-full rounded-full" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-7 w-7 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
