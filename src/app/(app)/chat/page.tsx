"use client";

import { Suspense } from "react";
import DirectChat from "src/components/chat/direct-chat";
import { ChatProvider } from "src/context/ChatContext";
import { Skeleton } from "src/components/ui/skeleton";

export default function MessagesPage() {
  return (
    <div className="flex h-screen w-full p-4 md:p-6">
      <ChatProvider children={undefined} userId={""}>
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

        <div className="flex-1 p-4">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-start">
                <Skeleton className="h-10 w-10 rounded-full mr-2" />
                <div>
                  <Skeleton className="h-24 w-64 rounded-2xl mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}

            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex justify-end">
                <div>
                  <Skeleton className="h-20 w-56 rounded-2xl mb-1" />
                  <div className="flex justify-end">
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-12 flex-1 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
