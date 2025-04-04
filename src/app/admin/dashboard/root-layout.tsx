// app/admin/root-layout.tsx
"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { AdminProvider } from "@/context/AdminContext";
import AdminLayout from "../layout";

interface AdminRootLayoutProps {
  children: ReactNode;
}

export default function AdminRootLayout({ children }: AdminRootLayoutProps) {
  return (
    <SessionProvider>
      <AdminProvider>
        <AdminLayout>{children}</AdminLayout>
      </AdminProvider>
    </SessionProvider>
  );
}
