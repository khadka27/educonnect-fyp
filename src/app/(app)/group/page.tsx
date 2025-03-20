"use client";

import GroupChat from "src/components/chat/GroupChat";
import { Suspense } from "react";
import { Skeleton } from "src/components/ui/skeleton";

export default function GroupChatPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <Suspense fallback={<GroupChatSkeleton />}>
        <GroupChat />
      </Suspense>
    </div>
  );
}

function GroupChatSkeleton() {
  return (
    <div className="flex h-[calc(100vh-60px)] rounded-lg shadow-lg overflow-hidden bg-background">
      {/* Sidebar skeleton */}
      <div className="hidden md:block w-1/4 min-w-[300px] border-r">
        <div className="p-4 border-b">
          <Skeleton className="h-8 w-40 mb-4" />
          <Skeleton className="h-10 w-full rounded-full" />
        </div>
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-3">
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
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
            <Skeleton className="h-8 w-32 rounded-md" />
          </div>
        </div>
      </div>

      {/* Details sidebar skeleton */}
      <div className="hidden md:block w-1/4 min-w-[300px] border-l">
        <div className="p-4 flex flex-col items-center">
          <Skeleton className="h-20 w-20 rounded-full mb-3" />
          <Skeleton className="h-6 w-40 mb-1" />
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-8 w-32 rounded-md mb-6" />

          <div className="w-full">
            <Skeleton className="h-5 w-32 mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-2 p-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
