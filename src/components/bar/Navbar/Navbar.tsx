"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Search,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Users,
  MessageSquare,
  Bookmark,
  Book,
  HelpCircle,
  Group,
  Compass,
  ChevronRight,
  Plus,
  Zap,
  Hash,
  CheckCircle,
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
import { HelpModal } from "@/components/help-modal";

interface TrendingTopic {
  id: string;
  hashtag: string;
  title: string;
  category: string;
  posts: number;
  trend: "up" | "down" | "stable";
  percentageChange?: number;
  timeframe: string;
  url?: string;
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
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    { name: "Event", icon: Compass, path: "/Events" },
    { name: "Messages", icon: MessageSquare, path: "/chat", badge: 3 },
    { name: "GroupChat", icon: Group, path: "/group" },
    { name: "Library", icon: Book, path: "/library" },
    { name: "Profile", icon: User, path: `/user-profile/${session?.user?.id}` },
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

  // Effect for fetching user data and trending topics
  useEffect(() => {
    if (session?.user?.id && mounted) {
      fetchUserData();
      fetchTrendingTopics();
    }
  }, [session, mounted]);

  // Effect for search input focus
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Fetch user data
  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      if (session?.user?.id) {
        const response = await fetch(`/api/user/${session.user.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const userData = await response.json();

        // Transform API response to match our interface
        setUserData({
          id: userData.id,
          name: userData.name || "User",
          username: userData.email?.split("@")[0] || "username",
          email: userData.email,
          profileImage:
            userData.profileImage || "/placeholder.svg?height=40&width=40",
          role: userData.role || "Student",
          createdAt: userData.createdAt,
          followers: userData.followers?.length || 0,
          following: userData.following?.length || 0,
          posts: userData.posts?.length || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      toast({
        title: "Error",
        description: "Failed to load user data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch trending topics
  const fetchTrendingTopics = async () => {
    try {
      const response = await fetch("/api/trending-topics");
      if (!response.ok) {
        throw new Error("Failed to fetch trending topics");
      }
      const data = await response.json();
      setTrendingTopics(data);
    } catch (error) {
      console.error("Error fetching trending topics:", error);
      setTrendingTopics([]);
    }
  };

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Call the real API to perform the search
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }

      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Search failed:", error);
      toast({
        title: "Search Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
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
            : "bg-lightgreen/95 backdrop-blur-sm"
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
                  <Image
                    src="/eduConnect.png"
                    alt="EduConnect Logo"
                    width={130}
                    height={60}
                    className="h-10 w-auto"
                    priority
                  />
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
                      <Link href="/news">
                        <Bookmark className="mr-2 h-4 w-4" />
                        <span>News</span>
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
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setIsModalOpen(true);
                      }}
                    >
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Help</span>
                    </DropdownMenuItem>

                    <HelpModal
                      open={isModalOpen}
                      onOpenChange={setIsModalOpen}
                    />
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
