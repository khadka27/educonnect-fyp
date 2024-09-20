"use client";
import { useRouter } from "next/navigation"; // Ensure you're using Next.js 14 useNavigation
import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      // Redirect non-admin users to unauthorized or homepage
      // router.push("/unauthorized");
    }
  }, [session, router]);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <button onClick={() => signOut()}>logut</button>
      {/* Admin dashboard content */}
    </div>
  );
}
