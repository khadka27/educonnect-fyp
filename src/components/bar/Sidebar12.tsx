"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "src/lib/utils"
import {
  Home,
  Bell,
  MessageSquare,
  Bookmark,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Hash,
  Zap,
  Compass,
  Calendar,
  Users,
} from "lucide-react"
import { Button } from "src/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "src/components/ui/tooltip"
import { Badge } from "src/components/ui/badge"
import { signOut } from "next-auth/react"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

type NavItem = {
  name: string
  icon: React.ElementType
  path: string
  notifications?: number
  color?: string
}

export default function EnhancedSidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  // For demo purposes - in a real app, these would come from an API
  const [notifications, setNotifications] = useState(3)
  const [messages, setMessages] = useState(5)

  // Ensure theme toggle works correctly with SSR
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const primaryNavItems: NavItem[] = [
    { name: "Home", icon: Home, path: "feed" },
    { name: "Explore", icon: Compass, path: "explore" },
    { name: "Notifications", icon: Bell, path: "notifications", notifications: notifications },
    { name: "Messages", icon: MessageSquare, path: "messages", notifications: messages },
    { name: "Bookmarks", icon: Bookmark, path: "bookmarks" },
    { name: "Profile", icon: User, path: "profile" },
  ]

  const secondaryNavItems: NavItem[] = [
    { name: "Trending", icon: Hash, path: "trending" },
    { name: "Events", icon: Calendar, path: "events" },
    { name: "Communities", icon: Users, path: "communities" },
  ]

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/sign-in" })
  }

  const toggleTheme = () => {
    if (isMounted) {
      setTheme(theme === "dark" ? "light" : "dark")
    }
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const handleNavigation = (path: string) => {
    setActiveTab(path)
    if (path === "notifications") setNotifications(0)
    if (path === "messages") setMessages(0)
  }

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        className={cn(
          "h-screen sticky top-0 flex flex-col border-r dark:border-gray-800 bg-white dark:bg-gray-950 transition-all duration-300 ease-in-out z-30",
          isCollapsed ? "w-[80px]" : "w-[280px]",
        )}
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Logo and collapse button */}
        <div className={cn("flex items-center justify-between p-4 h-16", isCollapsed && "justify-center")}>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center"
            >
              <Zap className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                SocialApp
              </span>
            </motion.div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className={cn(
              "rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all",
              isCollapsed && "absolute right-0 -mr-3 bg-white dark:bg-gray-950 shadow-md border",
            )}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Main navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          <div className="space-y-1">
            {primaryNavItems.map((item) => (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant={activeTab === item.path ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start relative group transition-all duration-200",
                        activeTab === item.path && "bg-primary text-primary-foreground font-medium",
                        isCollapsed && "justify-center px-2",
                      )}
                      onClick={() => handleNavigation(item.path)}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5",
                          isCollapsed ? "mr-0" : "mr-3",
                          activeTab === item.path
                            ? "text-primary-foreground"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />

                      {!isCollapsed && <span className="truncate">{item.name}</span>}

                      {item.notifications && item.notifications > 0 && (
                        <Badge
                          variant="destructive"
                          className={cn(
                            "ml-auto flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs",
                            isCollapsed && "absolute -top-1 -right-1",
                          )}
                        >
                          {item.notifications}
                        </Badge>
                      )}

                      {activeTab === item.path && !isCollapsed && (
                        <motion.div
                          className="absolute inset-y-0 left-0 w-1 bg-primary rounded-r-full"
                          layoutId="activeTab"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="font-medium">
                    {item.name}
                    {item.notifications && item.notifications > 0 && (
                      <span className="ml-1 text-xs">({item.notifications})</span>
                    )}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </div>

          {!isCollapsed && (
            <div className="mt-6 mb-4">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Discover</h3>
            </div>
          )}

          <div className="space-y-1">
            {secondaryNavItems.map((item) => (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant={activeTab === item.path ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start relative group transition-all duration-200",
                        activeTab === item.path && "bg-primary/10 text-primary font-medium",
                        isCollapsed && "justify-center px-2",
                      )}
                      onClick={() => handleNavigation(item.path)}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5",
                          isCollapsed ? "mr-0" : "mr-3",
                          activeTab === item.path
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />

                      {!isCollapsed && <span className="truncate">{item.name}</span>}

                      {activeTab === item.path && !isCollapsed && (
                        <motion.div
                          className="absolute inset-y-0 left-0 w-1 bg-primary rounded-r-full"
                          layoutId="activeTabSecondary"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="font-medium">
                    {item.name}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </div>
        </nav>

        {/* Settings and theme toggle */}
        <div className={cn("p-4 border-t dark:border-gray-800", isCollapsed && "flex flex-col items-center")}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn("w-full justify-start mb-2", isCollapsed && "justify-center px-2")}
                onClick={() => setActiveTab("settings")}
              >
                <Settings className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                {!isCollapsed && <span>Settings</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">Settings</TooltipContent>}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn("w-full justify-start mb-2", isCollapsed && "justify-center px-2")}
                onClick={toggleTheme}
              >
                {isMounted && theme === "dark" ? (
                  <Sun className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                ) : (
                  <Moon className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                )}
                {!isCollapsed && <span>{isMounted && theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">{isMounted && theme === "dark" ? "Light Mode" : "Dark Mode"}</TooltipContent>
            )}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20",
                  isCollapsed && "justify-center px-2",
                )}
                onClick={handleLogout}
              >
                <LogOut className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                {!isCollapsed && <span>Logout</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">Logout</TooltipContent>}
          </Tooltip>
        </div>

        {/* User profile */}
        <AnimatePresence>
          {(!isCollapsed || isHovering) && (
            <motion.div
              initial={isCollapsed ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "p-4 border-t dark:border-gray-800 flex items-center",
                isCollapsed &&
                  isHovering &&
                  "absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-950 shadow-lg rounded-tr-lg",
              )}
            >
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage
                  src={session?.user?.image || "/placeholder.svg?height=40&width=40"}
                  alt={session?.user?.name || "User"}
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium truncate">{session?.user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{session?.user?.email || "srcusername"}</p>
              </div>

              <Button variant="ghost" size="icon" className="ml-auto rounded-full">
                <Settings className="h-4 w-4 text-muted-foreground" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed user avatar */}
        {isCollapsed && !isHovering && (
          <div className="p-4 flex justify-center">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage
                src={session?.user?.image || "/placeholder.svg?height=40&width=40"}
                alt={session?.user?.name || "User"}
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                {session?.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </motion.div>
    </TooltipProvider>
  )
}

