// providers.tsx (Client Component)
"use client"; // This is now a Client Component

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/app/context/AuthProvider";
import { ThemeProvider } from "next-themes";
import queryClient from "@/lib/queryClient";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const router = useRouter();
  return (
    <SessionProvider>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
