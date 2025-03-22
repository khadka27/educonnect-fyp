"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Feeds from "src/components/post/PostList";
import EnhancedSidebar from "src/components/bar/Sidebar12";
import TrendingTopics from "src/components/trending-topics";
import EducationQuotesCarousel from "src/components/education-quotes-carousel";
import MobileNavigation from "src/components/mobile-navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import { Skeleton } from "src/components/ui/skeleton";
import { Bell, BookOpen } from "lucide-react";

const HomePage = () => {
  // 1. All hooks must be called at the top level
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("feed");
  const [isScrolled, setIsScrolled] = useState(false);

  // 2. Debug output to help troubleshoot
  useEffect(() => {
    console.log("Session data:", session);
    console.log("User ID being passed to TimelineList:", session?.user?.id);
  }, [session]);

  // 3. Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 4. Redirect if not authenticated - MOVED UP to maintain hooks order
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  // 5. Handle UI rendering based on status
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <Skeleton className="h-[calc(100vh-2rem)] w-full rounded-xl" />
            </div>
            <div className="md:col-span-2">
              <Skeleton className="h-32 w-full rounded-xl mb-6" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-xl" />
                ))}
              </div>
            </div>
            <div className="hidden md:block md:col-span-1">
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session && status === "unauthenticated") {
    return <div>Loading...</div>; // Simple loading state
  }

  if (status === "unauthenticated") {
    return null; // Prevent flash of protected content
  }

  // 6. Main render for authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-900">
      <div className="container mx-auto py-6 px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar - 1/4 width on desktop */}
          <div className="hidden md:block md:col-span-1 sticky top-6 h-[calc(100vh-3rem)]">
            <EnhancedSidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>

          {/* Main content - 2/4 width on desktop */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Welcome card */}
              <Card className="mb-6 overflow-hidden border-none shadow-md bg-white/90 dark:bg-emerald-950/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold flex items-center">
                      <BookOpen className="mr-2 h-5 w-5 text-primary" />
                      Welcome,{" "}
                      {session?.user?.name || session?.user?.username || "User"}
                      !
                    </CardTitle>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative"
                    >
                      <Bell className="h-5 w-5 text-muted-foreground cursor-pointer" />
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                    </motion.div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {activeTab === "feed"
                      ? "Here's what's happening in your educational network"
                      : `Viewing the ${activeTab} section`}
                  </p>
                </CardContent>
              </Card>

              {/* Educational Quotes Carousel */}
              <EducationQuotesCarousel />

              {/* Feeds with enhanced styling */}
              <div className="relative">
                <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-emerald-50 to-transparent dark:from-emerald-950 dark:to-transparent z-10 pointer-events-none"></div>
                <div className="rounded-xl overflow-hidden">
                  {session?.user?.id ? (
                    <Feeds />
                  ) : (
                    <Card className="p-4 border-none shadow-md">
                      <CardContent>
                        <div className="text-destructive flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Error: User ID is missing. Cannot load timeline.
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-emerald-50 to-transparent dark:from-emerald-950 dark:to-transparent z-10 pointer-events-none"></div>
              </div>
            </motion.div>
          </div>

          {/* Right sidebar - 1/4 width on desktop */}
          <div className="hidden md:block md:col-span-1 sticky top-6 h-[calc(100vh-3rem)] overflow-y-auto">
            <TrendingTopics />
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default HomePage;
