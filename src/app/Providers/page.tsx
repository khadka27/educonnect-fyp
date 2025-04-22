"use client";

import type React from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/app/context/AuthProvider";
import { ThemeProvider } from "next-themes";
import queryClient from "@/lib/queryClient";
import { SessionProvider } from "next-auth/react";
import { ChatProvider } from "@/context/ChatContext";
import { SidebarProvider } from "@/context/SidebarContext";
// import Sidebar from "src/components/bar/Sidebar12";
import { TooltipProvider } from "@/components/ui/tooltip";

interface ProvidersProps {
  children: React.ReactNode;
  session: any;
}

export default function Providers({ children, session }: ProvidersProps) {
  const userId = session?.user?.id || "";

  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <TooltipProvider>
          <ChatProvider userId={userId}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <QueryClientProvider client={queryClient}>
                <SidebarProvider>
                  <div className="flex h-screen overflow-hidden">
                    {/* <Sidebar /> */}
                    <main className="flex-1 relative overflow-y-auto">
                      {children}
                    </main>
                  </div>
                  <Toaster />
                </SidebarProvider>
              </QueryClientProvider>
            </ThemeProvider>
          </ChatProvider>
        </TooltipProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
