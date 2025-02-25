// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "src/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "src/components/ui/dropdown-menu";
// import { signOut } from "next-auth/react";
// import { Sheet, SheetContent, SheetTrigger } from "src/components/ui/sheet";
// import {
//   Moon,
//   Sun,
//   User,
//   Home,
//   Calendar,
//   Users,
//   Menu,
//   LogOut,
// } from "lucide-react";
// import { useTheme } from "next-themes";
// import Link from "next/link";
// import Image from "next/image";
// import { useSession } from "next-auth/react";

// export default function Sidebar() {
//   const [isNavbarVisible, setIsNavbarVisible] = useState(true);
//   const [lastScrollY, setLastScrollY] = useState(0);
//   const { theme, setTheme } = useTheme();
//   const { data: session } = useSession(); // Use useSession to get session data

//   // Extract user info from session
//   const user = session?.user;

//   useEffect(() => {
//     const handleScroll = () => {
//       const currentScrollY = window.scrollY;
//       if (currentScrollY > lastScrollY) {
//         setIsNavbarVisible(false);
//       } else {
//         setIsNavbarVisible(true);
//       }
//       setLastScrollY(currentScrollY);
//     };

//     window.addEventListener("scroll", handleScroll, { passive: true });
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, [lastScrollY]);

//   const NavLinks = () => (
//     <>
//       <Link href="/feeds" className="flex items-center space-x-2">
//         <Home className="h-5 w-5" />
//         <span>Feeds</span>
//       </Link>
//       <Link href="/events" className="flex items-center space-x-2">
//         <Calendar className="h-5 w-5" />
//         <span>Events</span>
//       </Link>
//       <Link href="/community" className="flex items-center space-x-2">
//         <Users className="h-5 w-5" />
//         <span>Community</span>
//       </Link>
//     </>
//   );

//   return (
//     <nav
//       className={`fixed w-full bg-green-950 border-b transition-transform duration-300 ${
//         isNavbarVisible ? "translate-y-0" : "-translate-y-full"
//       }`}
//     >
//       <div className="container mx-auto px-4 py-2 flex justify-between items-center">
//         {/* Left: App Logo */}
//         <div className="flex items-center">
//           <Image
//             src="/onlyLogoeduConnect.png"
//             alt="Logo"
//             width={40}
//             height={40}
//             className="h-10 w-10 mr-2"
//           />
//           <span className="text-xl font-bold hidden sm:inline">MyApp</span>
//         </div>

//         {/* Center: Navigation Links (hidden on mobile) */}
//         <div className="hidden md:flex space-x-6">
//           <NavLinks />
//         </div>

//         {/* Right: Dark mode toggle, Profile, and Mobile Menu */}
//         <div className="flex items-center space-x-4">
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
//           >
//             {theme === "dark" ? (
//               <Sun className="h-5 w-5" />
//             ) : (
//               <Moon className="h-5 w-5" />
//             )}
//             <span className="sr-only">Toggle theme</span>
//           </Button>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" className="w-10 h-10 rounded-full p-0">
//                 <Image
//                   src={user?.image || "/default-profile.png"} // Default image if user image is not available
//                   alt="Profile"
//                   width={40}
//                   height={40}
//                   className="w-full h-full rounded-full object-cover"
//                 />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-56">
//               <DropdownMenuItem>
//                 <User className="mr-2 h-4 w-4" />
//                 <span>{user?.name || "JohnDoe"}</span> {/* Display user name */}
//               </DropdownMenuItem>
//               <DropdownMenuItem asChild>
//                 <Link href={`/user-profile/${user?.id || ""}`} legacyBehavior>
//                   <a className="flex items-center">
//                     <User className="mr-2 h-4 w-4" />
//                     <span>User Profile</span>
//                   </a>
//                 </Link>
//               </DropdownMenuItem>
//               <DropdownMenuItem
//                 onClick={() => {
//                   signOut({
//                     redirect: false, // Prevent redirect to default NextAuth signOut URL
//                   }).then(() => {
//                     window.location.reload(); // Reload the page to reflect changes
//                   });
//                 }}
//                 className="flex items-center text-red-600"
//               >
//                 <LogOut className="mr-2 h-4 w-4" />
//                 <span>LogOut</span>
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//           {/* Mobile Menu */}
//           <Sheet>
//             <SheetTrigger asChild>
//               <Button variant="ghost" size="icon" className="md:hidden">
//                 <Menu className="h-5 w-5" />
//                 <span className="sr-only">Open menu</span>
//               </Button>
//             </SheetTrigger>
//             <SheetContent side="right" className="w-[300px] sm:w-[400px]">
//               <nav className="flex flex-col space-y-4">
//                 <NavLinks />
//               </nav>
//             </SheetContent>
//           </Sheet>
//         </div>
//       </div>
//     </nav>
//   );
// }

// components/app-sidebar.tsx

"use client"

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  // SidebarMenuAction,   // if you want a separate action button
  // SidebarSeparator,    // if you want to visually separate sections
} from "@/components/ui/sidebar"

import { Home, Inbox, Calendar, Search, Settings, User2 } from "lucide-react"

export function AppSidebar() {
  return (
    <Sidebar
      side="left"
      variant="sidebar"
      // key part below: collapsible="icon" makes the sidebar reduce to icons
      collapsible="icon"
    >
      {/* Optional header at the top */}
      <SidebarHeader>
        {/* Could put a logo or title here */}
        <div className="px-2 py-2 text-sm font-semibold">
          My App
        </div>
      </SidebarHeader>

      {/* Scrollable content area */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive>
                  <a href="#">
                    <Home />
                    <span>Home</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <Inbox />
                    <span>Inbox</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <Calendar />
                    <span>Calendar</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <Search />
                    <span>Search</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <Settings />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Optional footer at the bottom */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="#">
                <User2 />
                <span>Profile</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
