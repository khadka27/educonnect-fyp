"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
  Menu,
  X,
  Home,
  Users,
  MessageSquare,
  Bookmark,
  HelpCircle,
  Heart,
  Compass,
  ChevronRight,
  Plus,
  Zap,
  Hash,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar";
import { Switch } from "src/components/ui/switch";
import { Badge } from "src/components/ui/badge";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "src/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "src/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "src/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "src/components/ui/popover";
import { Separator } from "src/components/ui/separator";
import { Skeleton } from "src/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "mention" | "system";
  content: string;
  time: string;
  read: boolean;
  actionUrl: string;
  user?: {
    id: string;
    name: string;
    image: string;
  };
}

interface UserData {
  id: string;
  name: string;
  username: string;
  email: string;
  profileImage: string;
  role: string;
  createdAt: string;
  followers?: number;
  following?: number;
  posts?: number;
}

const EnhancedNavbar: React.FC = () => {
  // State
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Hooks
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  // Navigation items
  const navItems = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Explore", icon: Compass, path: "/explore" },
    { name: "Messages", icon: MessageSquare, path: "/messages", badge: 3 },
    {
      name: "Notifications",
      icon: Bell,
      path: "/notifications",
      badge: unreadCount,
    },
    { name: "Bookmarks", icon: Bookmark, path: "/bookmarks" },
    { name: "Profile", icon: User, path: `/profile/${session?.user?.id}` },
  ];

  // Mock notifications data
  const mockNotifications: Notification[] = [
    {
      id: "1",
      type: "like",
      content: "Alex liked your post about machine learning",
      time: "2 minutes ago",
      read: false,
      actionUrl: "/post/123",
      user: {
        id: "user1",
        name: "Alex Johnson",
        image: "/placeholder.svg?height=40&width=40",
      },
    },
    {
      id: "2",
      type: "comment",
      content: "Sarah commented on your research paper",
      time: "1 hour ago",
      read: false,
      actionUrl: "/post/456",
      user: {
        id: "user2",
        name: "Sarah Williams",
        image: "/placeholder.svg?height=40&width=40",
      },
    },
    {
      id: "3",
      type: "follow",
      content: "Professor Davis started following you",
      time: "3 hours ago",
      read: true,
      actionUrl: "/profile/user3",
      user: {
        id: "user3",
        name: "Prof. Davis",
        image: "/placeholder.svg?height=40&width=40",
      },
    },
    {
      id: "4",
      type: "mention",
      content: "Michael mentioned you in a comment",
      time: "Yesterday",
      read: true,
      actionUrl: "/post/789",
      user: {
        id: "user4",
        name: "Michael Brown",
        image: "/placeholder.svg?height=40&width=40",
      },
    },
    {
      id: "5",
      type: "system",
      content: "Your account was successfully verified",
      time: "2 days ago",
      read: true,
      actionUrl: "/settings/account",
    },
  ];

  // Effect for theme mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Effect for scroll behavior
  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        // For hiding on scroll down
        if (window.scrollY > 100) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }

        // For hiding when scrolling down and showing when scrolling up
        if (window.scrollY > lastScrollY && window.scrollY > 200) {
          // Scrolling down & past threshold
          document.body.classList.add("navbar-hidden");
        } else {
          // Scrolling up or at top
          document.body.classList.remove("navbar-hidden");
        }

        setLastScrollY(window.scrollY);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlNavbar);

      // Cleanup
      return () => {
        window.removeEventListener("scroll", controlNavbar);
      };
    }
  }, [lastScrollY]);

  // Effect for fetching user data
  useEffect(() => {
    if (session?.user?.id && mounted) {
      fetchUserData();
      fetchNotifications();
    }
  }, [session, mounted]);

  // Effect for search input focus
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Effect for counting unread notifications
  useEffect(() => {
    const count = notifications.filter(
      (notification) => !notification.read
    ).length;
    setUnreadCount(count);
  }, [notifications]);

  // Fetch user data
  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would fetch from your API
      // const response = await axios.get(`/api/user/${session?.user.id}`);
      // setUserData(response.data);

      // For demo purposes, we'll use mock data
      setTimeout(() => {
        setUserData({
          id: session?.user?.id || "user123",
          name: session?.user?.name || "User Name",
          username: session?.user?.email?.split("@")[0] || "username",
          email: session?.user?.email || "user@example.com",
          profileImage:
            session?.user?.image || "/placeholder.svg?height=40&width=40",
          role: "Student",
          createdAt: new Date().toISOString(),
          followers: 120,
          following: 85,
          posts: 24,
        });
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      toast({
        title: "Error",
        description: "Failed to load user data. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      // In a real app, you would fetch from your API
      // const response = await axios.get(`/api/notifications`);
      // setNotifications(response.data);

      // For demo purposes, we'll use mock data
      setTimeout(() => {
        setNotifications(mockNotifications);
      }, 1000);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // In a real app, you would search via your API
      // const response = await axios.get(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      // setSearchResults(response.data);

      // For demo purposes, we'll use mock data
      setTimeout(() => {
        setSearchResults([
          {
            id: 1,
            type: "user",
            name: "John Smith",
            username: "@johnsmith",
            image: "/placeholder.svg?height=40&width=40",
          },
          {
            id: 2,
            type: "post",
            title: "Introduction to Machine Learning",
            author: "Sarah Williams",
            image: "/placeholder.svg?height=40&width=40",
          },
          { id: 3, type: "topic", name: "Computer Science", posts: 1240 },
        ]);
        setIsSearching(false);
      }, 800);
    } catch (error) {
      console.error("Search failed:", error);
      toast({
        title: "Search Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive",
      });
      setIsSearching(false);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // In a real app, you would call your API
      // await axios.post('/api/notifications/mark-all-read');

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      setUnreadCount(0);

      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to update notifications. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Mark a single notification as read
  const markAsRead = async (id: string) => {
    try {
      // In a real app, you would call your API
      // await axios.post(`/api/notifications/${id}/read`);

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );

      // Recalculate unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to update notification. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/sign-in" });
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "comment":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "follow":
        return <Users className="h-4 w-4 text-green-500" />;
      case "mention":
        return <User className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-yellow-500" />;
    }
  };

  // If theme is not mounted yet, return null to prevent flash
  if (!mounted) return null;

  return (
    <>
      {/* Global CSS for navbar hiding */}
      <style jsx global>{`
        body.navbar-hidden .navbar-main {
          transform: translateY(-100%);
        }
      `}</style>

      {/* Main Navbar */}
      <motion.nav
        className={cn(
          "navbar-main fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
          isScrolled ? "shadow-md" : "",
          theme === "dark"
            ? "bg-gray-900/95 backdrop-blur-sm"
            : "bg-white/95 backdrop-blur-sm"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center">
              {/* Mobile menu button */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden mr-2"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] sm:w-[350px]">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center">
                      <Zap className="h-5 w-5 text-primary mr-2" />
                      <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        EduConnect
                      </span>
                    </SheetTitle>
                  </SheetHeader>

                  {/* Mobile User Profile */}
                  {userData ? (
                    <div className="flex items-center space-x-3 mb-6 p-2 rounded-lg bg-muted/50">
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarImage
                          src={userData.profileImage}
                          alt={userData.name}
                        />
                        <AvatarFallback>
                          {userData.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {userData.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          @{userData.username}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/user-profile/${userData.id}`}>View</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 mb-6 p-2">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  )}

                  {/* Mobile Navigation */}
                  <div className="space-y-1 mb-6">
                    {navItems.map((item) => (
                      <Button
                        key={item.name}
                        variant={pathname === item.path ? "default" : "ghost"}
                        className="w-full justify-start"
                        asChild
                      >
                        <Link
                          href={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <item.icon className="mr-2 h-5 w-5" />
                          {item.name}
                          {item.badge && item.badge > 0 && (
                            <Badge variant="destructive" className="ml-auto">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </Button>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {/* Mobile Settings */}
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link
                        href="/settings"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Settings className="mr-2 h-5 w-5" />
                        Settings
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link
                        href="/help"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <HelpCircle className="mr-2 h-5 w-5" />
                        Help Center
                      </Link>
                    </Button>
                    <div className="flex items-center px-3 py-2">
                      <Sun
                        className={`h-4 w-4 ${
                          theme === "light"
                            ? "text-yellow-500"
                            : "text-muted-foreground"
                        }`}
                      />
                      <Switch
                        checked={theme === "dark"}
                        onCheckedChange={toggleDarkMode}
                        className="mx-2"
                      />
                      <Moon
                        className={`h-4 w-4 ${
                          theme === "dark"
                            ? "text-blue-400"
                            : "text-muted-foreground"
                        }`}
                      />
                      <span className="ml-2 text-sm">
                        {theme === "dark" ? "Dark Mode" : "Light Mode"}
                      </span>
                    </div>
                  </div>

                  <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 border-t">
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              {/* Logo */}
              <Link href="/" className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <Zap className="h-6 w-6 text-primary mr-2" />
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent hidden sm:inline-block">
                    EduConnect
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {navItems.map((item) => (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={pathname === item.path ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "relative",
                        pathname === item.path &&
                          "bg-primary text-primary-foreground"
                      )}
                      asChild
                    >
                      <Link href={item.path}>
                        <item.icon className="h-4 w-4 mr-2" />
                        <span>{item.name}</span>
                        {item.badge && item.badge > 0 && (
                          <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{item.name}</TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* Search Bar */}
            <div
              className={cn(
                "transition-all duration-300 ease-in-out",
                isSearchExpanded ? "w-full md:w-96" : "w-auto"
              )}
            >
              <Popover
                open={isSearchExpanded}
                onOpenChange={setIsSearchExpanded}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("rounded-full", isSearchExpanded && "hidden")}
                  >
                    <Search className="h-5 w-5" />
                    <span className="sr-only">Search</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[300px] md:w-[450px] p-0"
                  align="end"
                  sideOffset={8}
                >
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      ref={searchInputRef}
                      type="search"
                      placeholder="Search people, posts, topics..."
                      className="pl-10 pr-10 py-6 rounded-t-md focus-visible:ring-0 border-0 border-b"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                        onClick={() => setSearchQuery("")}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Clear search</span>
                      </Button>
                    )}
                  </form>

                  <div className="max-h-[300px] overflow-y-auto p-2">
                    {isSearching ? (
                      <div className="space-y-2 p-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="divide-y">
                        {searchResults.map((result) => (
                          <Button
                            key={result.id}
                            variant="ghost"
                            className="w-full justify-start py-3 px-2"
                            asChild
                          >
                            <Link href={`/${result.type}/${result.id}`}>
                              <div className="flex items-center w-full">
                                {result.type === "user" && (
                                  <>
                                    <Avatar className="h-8 w-8 mr-3">
                                      <AvatarImage
                                        src={result.image}
                                        alt={result.name}
                                      />
                                      <AvatarFallback>
                                        {result.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-medium">
                                        {result.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {result.username}
                                      </p>
                                    </div>
                                  </>
                                )}
                                {result.type === "post" && (
                                  <>
                                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center mr-3">
                                      <MessageSquare className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">
                                        {result.title}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        By {result.author}
                                      </p>
                                    </div>
                                  </>
                                )}
                                {result.type === "topic" && (
                                  <>
                                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center mr-3">
                                      <Hash className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">
                                        {result.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {result.posts} posts
                                      </p>
                                    </div>
                                  </>
                                )}
                              </div>
                            </Link>
                          </Button>
                        ))}
                      </div>
                    ) : searchQuery ? (
                      <div className="text-center py-8">
                        <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No results found for "{searchQuery}"
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Try searching for people, posts, or topics
                        </p>
                      </div>
                    )}
                  </div>

                  {searchResults.length > 0 && (
                    <div className="p-2 border-t">
                      <Button
                        variant="ghost"
                        className="w-full text-xs"
                        asChild
                      >
                        <Link
                          href={`/search?q=${encodeURIComponent(searchQuery)}`}
                        >
                          View all results
                          <ChevronRight className="ml-2 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-2">
              {/* Create Post Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" className="hidden md:flex">
                    <Plus className="h-4 w-4 mr-2" />
                    Create
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Create a new post</TooltipContent>
              </Tooltip>

              {/* Notification Bell with Dropdown */}
              <Popover
                open={isNotificationsOpen}
                onOpenChange={setIsNotificationsOpen}
              >
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">
                          {unreadCount}
                        </span>
                      </span>
                    )}
                    <span className="sr-only">Notifications</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[350px] p-0" align="end">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    <div className="flex space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={markAllAsRead}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Mark all as read</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <BellOff className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Mute notifications</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  <div className="max-h-[350px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Bell className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No notifications yet
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={cn(
                              "p-4 hover:bg-muted/50 transition-colors",
                              !notification.read && "bg-muted/20"
                            )}
                          >
                            <div className="flex items-start">
                              {notification.user ? (
                                <Avatar className="h-8 w-8 mr-3">
                                  <AvatarImage
                                    src={notification.user.image}
                                    alt={notification.user.name}
                                  />
                                  <AvatarFallback>
                                    {notification.user.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                  {getNotificationIcon(notification.type)}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm">
                                  {notification.content}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {notification.time}
                                </p>
                              </div>
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 rounded-full"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                                  <span className="sr-only">Mark as read</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-2 border-t">
                    <Button variant="ghost" className="w-full text-xs" asChild>
                      <Link href="/notifications">
                        View all notifications
                        <ChevronRight className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Dark Mode Toggle */}
              <div className="hidden md:flex items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleDarkMode}
                      >
                        {theme === "dark" ? (
                          <Sun className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <Moon className="h-5 w-5 text-blue-500" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {theme === "dark" ? "Light mode" : "Dark mode"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8 relative"
                  >
                    {isLoading ? (
                      <Skeleton className="h-8 w-8 rounded-full" />
                    ) : (
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={
                            userData?.profileImage ||
                            session?.user?.image ||
                            "/placeholder.svg?height=40&width=40"
                          }
                          alt="Profile"
                        />
                        <AvatarFallback>
                          {userData?.name?.charAt(0) ||
                            session?.user?.name?.charAt(0) ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="font-medium leading-none">
                        {userData?.name || session?.user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        @
                        {userData?.username ||
                          session?.user?.email?.split("@")[0]}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/user-profile/${
                          userData?.id || session?.user?.id
                        }`}
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <Compass className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/bookmarks">
                        <Bookmark className="mr-2 h-4 w-4" />
                        <span>Bookmarks</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Sun className="mr-2 h-4 w-4" />
                        <span>Appearance</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem onClick={() => setTheme("light")}>
                            <Sun className="mr-2 h-4 w-4" />
                            <span>Light</span>
                            {theme === "light" && (
                              <CheckCircle className="ml-auto h-4 w-4" />
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTheme("dark")}>
                            <Moon className="mr-2 h-4 w-4" />
                            <span>Dark</span>
                            {theme === "dark" && (
                              <CheckCircle className="ml-auto h-4 w-4" />
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTheme("system")}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>System</span>
                            {theme === "system" && (
                              <CheckCircle className="ml-auto h-4 w-4" />
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuItem asChild>
                      <Link href="/help">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        <span>Help</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-500 focus:text-red-500"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Spacer to prevent content from being hidden under the navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default EnhancedNavbar;
