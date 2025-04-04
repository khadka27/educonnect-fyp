import type React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AdminProvider } from "@/context/admin-context";
import AdminSidebar from "src/components/admin/sidebar";
import AdminHeader from "src/components/admin/header";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "Admin Dashboard | EduConnect",
  description: "Admin dashboard for EduConnect platform",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated and is an admin
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <AdminProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
          <AdminSidebar />
          <div className="flex flex-1 flex-col md:pl-64">
            <AdminHeader user={session.user} />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </ThemeProvider>
    </AdminProvider>
  );
}
