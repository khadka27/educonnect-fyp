/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  Search,
  Bell,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  CheckCircle,
  BellOff,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar";
import { Switch } from "src/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "src/components/ui/tooltip";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { useTheme } from "next-themes";

const Navbar: React.FC = () => {
  const [isNotificationExpanded, setIsNotificationExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { data: session } = useSession(); // Use session data for user info
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session) {
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/user/${session?.user.id}`);
      setUser(response.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to load user data");
      setLoading(false);
    }
  };

  const notifications = [
    { id: 1, content: "John liked your post", time: "2 minutes ago" },
    { id: 2, content: "New message from Sarah", time: "1 hour ago" },
    { id: 3, content: "You have a new follower", time: "3 hours ago" },
  ];

  const unreadNotifications = notifications.length;

  const toggleDarkMode = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    const controlNavbar = () => {
      if (window.scrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  if (!mounted) return null; // To ensure the theme is properly mounted

  return (
    <nav
      className={`
        ${
          theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }
        shadow-md transition-all duration-300 fixed w-full z-10
        ${isVisible ? "top-0" : "-top-16"}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Image
              className="h-[80px] w-auto"
              src="/onlyLogoeduConnect.png"
              alt="Logo"
              width={150}
              height={150}
            />
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xs sm:max-w-md mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className={`w-full ${
                  theme === "dark"
                    ? "bg-gray-700 text-gray-100"
                    : "bg-gray-100 text-gray-900"
                } rounded-full pl-8 pr-4 py-1 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-400`}
              />
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 text-gray-400 hover:text-gray-500">
                  <Bell className="h-6 w-6" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex justify-between items-center p-2">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <div className="flex space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Mark all as read</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                            <BellOff className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Mute notifications</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <div className="overflow-y-auto max-h-64">
                  {notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="flex flex-col items-start py-2"
                    >
                      <span>{notification.content}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {notification.time}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dark Mode Toggle */}
            <div className="flex items-center">
              <Sun
                className={`h-4 w-4 ${
                  theme === "light" ? "text-yellow-500" : "text-gray-400"
                }`}
              />
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleDarkMode}
                className="mx-2"
              />
              <Moon
                className={`h-4 w-4 ${
                  theme === "dark" ? "text-blue-400" : "text-gray-400"
                }`}
              />
            </div>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex text-sm rounded-full">
                  <Avatar>
                    <AvatarImage
                      src={user?.profileImage || "/default-profile.png"}
                      alt="Profile"
                    />
                    <AvatarFallback>
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href={`/user-profile/${user?.id || ""}`} legacyBehavior>
                    <a className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>{user?.username || "Profile"}</span>
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

/* eslint-disable @typescript-eslint/no-unused-vars */
// "use client";

// import type React from "react";
// import { useState, useEffect } from "react";
// import { signOut, useSession } from "next-auth/react";
// import Image from "next/image";
// import axios from "axios";
// import { useTheme } from "next-themes";
// import SearchBar from "src/components/bar/Navbar/SearchBar";
// import NotificationBell from "src/components/bar/Navbar/NotificationBell";
// import DarkModeToggle from "src/components/bar/Navbar/DarkModeToggle";
// import UserProfileDropdown from "src/components/bar/Navbar/UserProfileDropdown";

// const Navbar: React.FC = () => {
//   const [isNotificationExpanded, setIsNotificationExpanded] = useState(false);
//   const [isVisible, setIsVisible] = useState(true);
//   const [lastScrollY, setLastScrollY] = useState(0);
//   const { data: session } = useSession(); // Use session data for user info
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [user, setUser] = useState<any>(null);
//   const { theme, setTheme } = useTheme();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   useEffect(() => {
//     if (session) {
//       fetchUserData();
//     }
//   }, [session]);

//   const fetchUserData = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`/api/user/${session?.user.id}`);
//       setUser(response.data);
//       setLoading(false);
//     } catch (error) {
//       setError("Failed to load user data");
//       setLoading(false);
//     }
//   };

//   const notifications = [
//     { id: 1, content: "John liked your post", time: "2 minutes ago" },
//     { id: 2, content: "New message from Sarah", time: "1 hour ago" },
//     { id: 3, content: "You have a new follower", time: "3 hours ago" },
//   ];

//   const unreadNotifications = notifications.length;

//   const toggleDarkMode = () => {
//     setTheme(theme === "light" ? "dark" : "light");
//   };

//   useEffect(() => {
//     const controlNavbar = () => {
//       if (window.scrollY > lastScrollY) {
//         setIsVisible(false);
//       } else {
//         setIsVisible(true);
//       }
//       setLastScrollY(window.scrollY);
//     };

//     window.addEventListener("scroll", controlNavbar);
//     return () => window.removeEventListener("scroll", controlNavbar);
//   }, [lastScrollY]);

//   if (!mounted) return null; // To ensure the theme is properly mounted

//   return (
//     <nav
//       className={`
//         ${
//           theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
//         }
//         shadow-md transition-all duration-300 fixed w-full z-10
//         ${isVisible ? "top-0" : "-top-16"}
//       `}
//     >
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-16">
//           {/* Logo */}
//           <div className="flex-shrink-0 flex items-center">
//             <Image
//               className="h-[80px] w-auto"
//               src="/onlyLogoeduConnect.png"
//               alt="Logo"
//               width={150}
//               height={150}
//             />
//           </div>

//           {/* Search Bar */}
//           <SearchBar theme={theme} />

//           {/* Right Side Icons */}
//           <div className="flex items-center space-x-4">
//             {/* Notification Bell with Dropdown */}
//             {/* <NotificationBell notifications={notifications} /> */}

//             {/* Dark Mode Toggle */}
//             <DarkModeToggle theme={theme} setTheme={setTheme} />

//             {/* User Profile Dropdown */}
//             <UserProfileDropdown user={user} signOut={signOut} />
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
