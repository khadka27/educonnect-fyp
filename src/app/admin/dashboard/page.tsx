// pages/admin/dashboard.tsx

"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      // Redirect non-admin users to unauthorized or homepage
      router.push("/unauthorized");
    }
  }, [session, router]);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Admin dashboard content */}
    </div>
  );
}
