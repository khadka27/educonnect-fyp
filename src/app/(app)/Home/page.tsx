// "use client";

// import { useState, useEffect } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import Feeds from "src/components/post/PostList";
// import EnhancedSidebar from "src/components/bar/Sidebar12";
// import TrendingTopics from "src/components/trending-topics";
// import EducationQuotesCarousel from "src/components/education-quotes-carousel";
// import MobileNavigation from "src/components/mobile-navigation";
// import { motion } from "framer-motion";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "src/components/ui/card";
// import { Skeleton } from "src/components/ui/skeleton";
// import { Bell, BookOpen } from "lucide-react";
// // import RightSidebar from "src/components/bar/right-side-bar";

// const HomePage = () => {
//   // 1. All hooks must be called at the top level
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState("feed");
//   const [isScrolled, setIsScrolled] = useState(false);

//   // 2. Debug output to help troubleshoot
//   useEffect(() => {
//     console.log("Session data:", session);
//     console.log("User ID being passed to TimelineList:", session?.user?.id);
//   }, [session]);

//   // 3. Handle scroll effects
//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 50);
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   // 4. Redirect if not authenticated - MOVED UP to maintain hooks order
//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.push("/sign-in");
//     }
//   }, [status, router]);

//   // 5. Handle UI rendering based on status
//   if (status === "loading") {
//     return (
//       <div className="min-h-screen bg-background">
//         <div className="container mx-auto py-6">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//             <div className="md:col-span-1">
//               <Skeleton className="h-[calc(100vh-2rem)] w-full rounded-xl" />
//             </div>
//             <div className="md:col-span-2">
//               <Skeleton className="h-32 w-full rounded-xl mb-6" />
//               <div className="space-y-4">
//                 {[1, 2, 3].map((i) => (
//                   <Skeleton key={i} className="h-64 w-full rounded-xl" />
//                 ))}
//               </div>
//             </div>
//             <div className="hidden md:block md:col-span-1">
//               <Skeleton className="h-96 w-full rounded-xl" />
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!session && status === "unauthenticated") {
//     return <div>Loading...</div>; // Simple loading state
//   }

//   if (status === "unauthenticated") {
//     return null; // Prevent flash of protected content
//   }

//   // 6. Main render for authenticated users
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-900">
//       <div className="container mx-auto py-6 px-4 sm:px-6">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//           {/* Sidebar - 1/4 width on desktop */}
//           <div className="hidden md:block md:col-span-1 sticky top-6 h-[calc(100vh-3rem)]">
//             <EnhancedSidebar
//               activeTab={activeTab}
//               setActiveTab={setActiveTab}
//             />
//           </div>

//           {/* Main content - 2/4 width on desktop */}
//           <div className="md:col-span-2">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5 }}
//             >
//               {/* Welcome card */}
//               <Card className="mb-6 overflow-hidden border-none shadow-md bg-white/90 dark:bg-emerald-950/80 backdrop-blur-sm">
//                 <CardHeader className="pb-2">
//                   <div className="flex items-center justify-between">
//                     <CardTitle className="text-xl font-semibold flex items-center">
//                       <BookOpen className="mr-2 h-5 w-5 text-primary" />
//                       Welcome,{" "}
//                       {session?.user?.name || session?.user?.username || "User"}
//                       !
//                     </CardTitle>
//                     <motion.div
//                       whileHover={{ scale: 1.1 }}
//                       whileTap={{ scale: 0.95 }}
//                       className="relative"
//                     >
//                       <Bell className="h-5 w-5 text-muted-foreground cursor-pointer" />
//                       <span className="absolute -top-1 -right-1 flex h-3 w-3">
//                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
//                         <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
//                       </span>
//                     </motion.div>
//                   </div>
//                 </CardHeader>
//                 <CardContent>
//                   <p className="text-muted-foreground">
//                     {activeTab === "feed"
//                       ? "Here's what's happening in your educational network"
//                       : `Viewing the ${activeTab} section`}
//                   </p>
//                 </CardContent>
//               </Card>

//               {/* Educational Quotes Carousel */}
//               <EducationQuotesCarousel />

//               {/* Feeds with enhanced styling */}
//               <div className="relative">
//                 <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-emerald-50 to-transparent dark:from-emerald-950 dark:to-transparent z-10 pointer-events-none"></div>
//                 <div className="rounded-xl overflow-hidden">
//                   {session?.user?.id ? (
//                     <Feeds />
//                   ) : (
//                     <Card className="p-4 border-none shadow-md">
//                       <CardContent>
//                         <div className="text-destructive flex items-center">
//                           <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             className="h-5 w-5 mr-2"
//                             viewBox="0 0 20 20"
//                             fill="currentColor"
//                           >
//                             <path
//                               fillRule="evenodd"
//                               d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
//                               clipRule="evenodd"
//                             />
//                           </svg>
//                           Error: User ID is missing. Cannot load timeline.
//                         </div>
//                       </CardContent>
//                     </Card>
//                   )}
//                 </div>
//                 <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-emerald-50 to-transparent dark:from-emerald-950 dark:to-transparent z-10 pointer-events-none"></div>
//               </div>
//             </motion.div>
//           </div>

//           {/* Right sidebar - 1/4 width on desktop */}
//           <div className="hidden md:block md:col-span-1 sticky top-6 h-[calc(100vh-3rem)] overflow-y-auto">
//             <TrendingTopics />
//           </div>
//           {/* <div className="hidden md:block md:col-span-1 sticky top-6 h-[calc(100vh-3rem)] overflow-y-auto">
//             <RightSidebar />
//           </div> */}
//         </div>
//       </div>

//       {/* Mobile navigation */}
//       <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
//         <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
//       </div>
//     </div>
//   );
// };

// export default HomePage;



"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Feeds from "src/components/post/PostList"
import { ProfileCard } from "src/components/profile-card"
import TrendingTopics from "src/components/trending-topics"
import EducationQuotesCarousel from "src/components/education-quotes-carousel"
import MobileNavigation from "src/components/mobile-navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "src/components/ui/card"
import { Skeleton } from "src/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "src/components/ui/tabs"
import { Input } from "src/components/ui/input"
import {
  Bell,
  BookOpen,
  Search,
  Plus,
  TrendingUp,
  Calendar,
  MessageSquare,
  Users,
  Library,
  Newspaper,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { UpcomingEvents } from "src/components/upcoming-events"

const HomePage = () => {
  // Hooks
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("feed")
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Debug output
  useEffect(() => {
    console.log("Session data:", session)
    console.log("User ID being passed to TimelineList:", session?.user?.id)
  }, [session])

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in")
    }
  }, [status, router])

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-900">
        <div className="container mx-auto py-6 px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3">
              <Skeleton className="h-[calc(100vh-2rem)] w-full rounded-xl" />
            </div>
            <div className="lg:col-span-6">
              <Skeleton className="h-32 w-full rounded-xl mb-6" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-xl" />
                ))}
              </div>
            </div>
            <div className="hidden lg:block lg:col-span-3">
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session && status === "unauthenticated") {
    return null // Prevent flash of protected content
  }

  // Main render for authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-900">
      <div className="container mx-auto py-6 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - Profile card and quick links */}
          <div className="lg:col-span-3 space-y-6">
            <ProfileCard />

            {/* Quick Navigation */}
            <Card className="bg-white/90 dark:bg-gray-800/90 border-emerald-100 dark:border-emerald-900/50 overflow-hidden shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-emerald-700 dark:text-emerald-300">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Quick Links
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                  >
                    <Link href="/library">
                      <Library className="mr-2 h-4 w-4" />
                      Library
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                  >
                    <Link href="/news">
                      <Newspaper className="mr-2 h-4 w-4" />
                      News
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                  >
                    <Link href="/community">
                      <Users className="mr-2 h-4 w-4" />
                      Community
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                  >
                    <Link href="/messages">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messages
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics (visible on desktop) */}
            <div className="hidden lg:block">
              <TrendingTopics />
            </div>
          </div>

          {/* Main content - Center column */}
          <div className="lg:col-span-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Welcome and search bar */}
                <Card className="overflow-hidden border-none shadow-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-semibold flex items-center text-emerald-800 dark:text-emerald-200">
                        <BookOpen className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        Welcome, {session?.user?.name || session?.user?.username || "User"}!
                      </CardTitle>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="relative">
                        <Bell className="h-5 w-5 text-emerald-600 dark:text-emerald-400 cursor-pointer" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                        </span>
                      </motion.div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative mt-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                      <Input
                        placeholder="Search posts, topics, or users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 pb-4 px-4">
                    <Tabs defaultValue="feed" className="w-full" onValueChange={setActiveTab}>
                      <TabsList className="grid grid-cols-3 w-full bg-emerald-100/70 dark:bg-emerald-900/30">
                        <TabsTrigger
                          value="feed"
                          className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white dark:data-[state=active]:bg-emerald-700"
                        >
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Feed
                        </TabsTrigger>
                        <TabsTrigger
                          value="events"
                          className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white dark:data-[state=active]:bg-emerald-700"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Events
                        </TabsTrigger>
                        <TabsTrigger
                          value="community"
                          className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white dark:data-[state=active]:bg-emerald-700"
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Community
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </CardFooter>
                </Card>

                {/* Educational Quotes Carousel */}
                <EducationQuotesCarousel />

                {/* Create Post Button */}
                <div className="flex justify-end">
                  <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Post
                  </Button>
                </div>

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
            </AnimatePresence>
          </div>

          {/* Right column - Trending topics on mobile, upcoming events on desktop */}
          <div className="lg:col-span-3 space-y-6">
            {/* Trending Topics (visible on mobile) */}
            <div className="lg:hidden">
              <TrendingTopics />
            </div>

            {/* Upcoming Events */}
            <UpcomingEvents />
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  )
}

export default HomePage
