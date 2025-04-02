// hooks/useAdminAuth.ts
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface AdminAuthStatus {
  isLoading: boolean;
  isAdmin: boolean;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    image: string | null;
  } | null;
  error: string | null;
}

export const useAdminAuth = () => {
  const { data: session, status: sessionStatus } = useSession();
  const [authStatus, setAuthStatus] = useState<AdminAuthStatus>({
    isLoading: true,
    isAdmin: false,
    user: null,
    error: null,
  });
  const router = useRouter();

  useEffect(() => {
    const checkAdminAccess = async () => {
      // If session is loading, wait
      if (sessionStatus === "loading") {
        return;
      }

      // If no session, redirect to login
      if (!session) {
        setAuthStatus({
          isLoading: false,
          isAdmin: false,
          user: null,
          error: "Authentication required",
        });
        router.push("/login?callbackUrl=/admin");
        return;
      }

      try {
        // Verify the user is an admin
        const response = await axios.get("/api/auth/check-admin");

        if (response.data.isAdmin) {
          setAuthStatus({
            isLoading: false,
            isAdmin: true,
            user: session.user,
            error: null,
          });
        } else {
          setAuthStatus({
            isLoading: false,
            isAdmin: false,
            user: session.user,
            error: "Unauthorized: Admin access required",
          });
          router.push("/");
        }
      } catch (error) {
        console.error("Admin authentication error:", error);
        setAuthStatus({
          isLoading: false,
          isAdmin: false,
          user: null,
          error: "Authentication failed",
        });
        router.push("/login?callbackUrl=/admin");
      }
    };

    checkAdminAccess();
  }, [session, sessionStatus, router]);

  return authStatus;
};

export default useAdminAuth;
