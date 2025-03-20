"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  show: boolean;
  side?: "left" | "right";
}

export function Tooltip({
  children,
  content,
  show,
  side = "right",
}: TooltipProps) {
  return (
    <div className="relative group">
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, x: side === "right" ? -5 : 5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: side === "right" ? -5 : 5 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "absolute z-50 px-2 py-1 text-sm whitespace-nowrap",
              "bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700",
              "text-gray-900 dark:text-gray-100",
              side === "right" ? "left-full ml-2" : "right-full mr-2",
              "top-1/2 -translate-y-1/2"
            )}
          >
            <div className="relative">
              {/* Arrow */}
              <div
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 w-2 h-2 rotate-45",
                  "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
                  side === "right"
                    ? "-left-1 border-r-0 border-t-0"
                    : "-right-1 border-l-0 border-b-0"
                )}
              />
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
