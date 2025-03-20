"use client";

import { Home, Search, Bell, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function MobileNavigation({
  activeTab,
  setActiveTab,
}: MobileNavigationProps) {
  const navItems = [
    { name: "Home", icon: Home, path: "feed" },
    { name: "Explore", icon: Search, path: "explore" },
    { name: "Notifications", icon: Bell, path: "notifications" },
    { name: "Messages", icon: MessageSquare, path: "messages" },
    { name: "Profile", icon: User, path: "profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t dark:border-gray-800 shadow-lg">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full relative",
              activeTab === item.path ? "text-primary" : "text-muted-foreground"
            )}
            onClick={() => setActiveTab(item.path)}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs mt-1">{item.name}</span>

            {activeTab === item.path && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                layoutId="mobileActiveTab"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
