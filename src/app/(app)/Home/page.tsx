// src/app/Home/page.tsx
"use client"; // Ensure this is a client component

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect based on session status or role
  if (status === "loading") return <p>Loading...</p>; // Handle loading state
  if (!session) router.push("/sign-in"); // Redirect if not authenticated

  return (
    <div>
      <h1>Welcome {session?.user?.name}</h1>
      {/* Rest of your page content */}
    </div>
  );
};

export default HomePage;
