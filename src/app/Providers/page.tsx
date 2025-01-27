"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "src/components/ui/toaster";
import { AuthProvider } from "@/app/context/AuthProvider";
import { ThemeProvider } from "next-themes";
import queryClient from "@/lib/queryClient";
import { SessionProvider } from "next-auth/react";
import { ChatProvider } from "src/context/ChatContext";

interface ProvidersProps {
  children: React.ReactNode;
  session: any; // Consider using a more specific type from next-auth if available
}

export default function Providers({ children, session }: ProvidersProps) {
  const userId = session?.user?.id || "";

  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <ChatProvider userId={userId}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <QueryClientProvider client={queryClient}>
              {children}
              <Toaster />
            </QueryClientProvider>
          </ThemeProvider>
        </ChatProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
