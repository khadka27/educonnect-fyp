"use client";

import type React from "react";
import { useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  PlusSquare,
  User,
  Calendar,
  MessageSquare,
  Users,
  LogOut,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { Tooltip } from "./Tooltip";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  icon: React.ElementType;
  path: string;
  notifications?: number;
}

export default function Sidebar() {
  const { expanded, toggleSidebar, isMobile } = useSidebar();
  const [isHovering, setIsHovering] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  // Navigation items
  const navItems: NavItem[] = [
    { title: "Home", icon: Home, path: "/home" },
    { title: "Post", icon: PlusSquare, path: "/post" },
    { title: "Profile", icon: User, path: "/profile" },
    { title: "Event", icon: Calendar, path: "/event", notifications: 2 },
    {
      title: "DirectChat",
      icon: MessageSquare,
      path: "/direct-chat",
      notifications: 5,
    },
    { title: "GroupChat", icon: Users, path: "/group-chat", notifications: 3 },
  ];

  const [tooltips, setTooltips] = useState(navItems.map(() => false));

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && expanded && (
        <div
          className="fixed inset-0 bg-black/50 z-20"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-screen
          transition-all duration-300 ease-in-out
          ${expanded ? "w-1/4 min-w-[240px] max-w-[280px]" : "w-[70px]"}
          ${isMobile && !expanded ? "-translate-x-full" : "translate-x-0"}
          flex flex-col
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-800
        `}
        onMouseEnter={() => !expanded && setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Logo and toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 text-white font-bold text-lg shadow-md">
              SM
            </div>

            {(expanded || isHovering) && (
              <div
                className={`transition-all duration-300 ${
                  isHovering && !expanded
                    ? "absolute left-16 bg-white dark:bg-gray-900 p-2 rounded-md shadow-lg z-50"
                    : ""
                }`}
              >
                <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
                  SocialApp
                </span>
              </div>
            )}
          </div>

          {expanded && !isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          )}

          {!expanded && !isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* User profile */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div
            className={`flex ${
              expanded ? "items-center gap-3" : "justify-center"
            }`}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden border-2 border-white dark:border-gray-800">
                <img
                  src="/placeholder.svg?height=40&width=40"
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {expanded && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-medium truncate">John Doe</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  @johndoe
                </span>
              </div>
            )}

            {isHovering && !expanded && (
              <div className="absolute left-16 bg-white dark:bg-gray-900 p-2 rounded-md shadow-lg z-50">
                <div className="flex flex-col">
                  <span className="font-medium">John Doe</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    @johndoe
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          <div className="space-y-4">
            {navItems.map((item, index) => {
              const isActive = pathname === item.path;

              return (
                <Tooltip
                  key={item.title}
                  content={
                    <div className="flex items-center gap-2">
                      <span>{item.title}</span>
                      {item.notifications > 0 && (
                        <span className="flex items-center justify-center min-w-[20px] h-5 text-xs font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-full px-1">
                          {item.notifications}
                        </span>
                      )}
                    </div>
                  }
                  show={!expanded && tooltips[index]}
                >
                  <Link
                    href={item.path}
                    className={cn(
                      "relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                      "group hover:bg-gray-100 dark:hover:bg-gray-800",
                      isActive &&
                        "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    )}
                    onMouseEnter={() => {
                      const newTooltips = [...tooltips];
                      newTooltips[index] = true;
                      setTooltips(newTooltips);
                    }}
                    onMouseLeave={() => {
                      const newTooltips = [...tooltips];
                      newTooltips[index] = false;
                      setTooltips(newTooltips);
                    }}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 dark:bg-blue-400 rounded-r-full"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}

                    <div className="relative">
                      <item.icon
                        className={cn(
                          "w-5 h-5 transition-colors",
                          isActive
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-500 dark:text-gray-400"
                        )}
                      />

                      {item.notifications > 0 && !expanded && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] text-xs font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-full"
                        >
                          {item.notifications}
                        </motion.span>
                      )}
                    </div>

                    {expanded && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="truncate"
                      >
                        {item.title}
                        {item.notifications > 0 && (
                          <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 text-xs font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-full px-1">
                            {item.notifications}
                          </span>
                        )}
                      </motion.span>
                    )}
                  </Link>
                </Tooltip>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="space-y-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg
                transition-colors duration-200
                text-gray-700 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-800
                ${expanded ? "" : "justify-center"}
              `}
              onMouseEnter={() => !expanded && setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {theme === "dark" ? (
                <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}

              {expanded && <span>Toggle theme</span>}

              {!expanded && isHovering && (
                <div className="absolute left-16 bg-white dark:bg-gray-900 p-2 rounded-md shadow-lg z-50">
                  <span>Toggle theme</span>
                </div>
              )}
            </button>

            {/* Logout button */}
            <button
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg
                transition-colors duration-200
                text-red-600 dark:text-red-400
                hover:bg-red-50 dark:hover:bg-red-900/20
                ${expanded ? "" : "justify-center"}
              `}
              onMouseEnter={() => !expanded && setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <LogOut className="w-5 h-5" />

              {expanded && <span>Logout</span>}

              {!expanded && isHovering && (
                <div className="absolute left-16 bg-white dark:bg-gray-900 p-2 rounded-md shadow-lg z-50">
                  <span>Logout</span>
                </div>
              )}
            </button>
          </div>

          {/* Copyright */}
          {expanded && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                © 2025 SocialApp Inc.
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile toggle button */}
      {isMobile && !expanded && (
        <button
          onClick={toggleSidebar}
          className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-purple-600 text-white shadow-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
