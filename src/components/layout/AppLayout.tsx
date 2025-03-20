"use client";

import type React from "react";
import Sidebar from "src/components/bar/Sidebar12";
import { SidebarProvider } from "@/context/SidebarContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 ml-[70px] md:ml-[240px] p-4 transition-all duration-300 ease-in-out">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
