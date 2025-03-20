"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  BookOpen,
  GraduationCap,
  Brain,
} from "lucide-react";
import { Button } from "src/components/ui/button";
import { Card, CardContent } from "src/components/ui/card";
import { cn } from "@/lib/utils";

interface QuoteType {
  id: number;
  text: string;
  author: string;
  icon: React.ElementType;
  color: string;
}

const educationalQuotes: QuoteType[] = [
  {
    id: 1,
    text: "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.",
    author: "Malcolm X",
    icon: GraduationCap,
    color: "bg-blue-500",
  },
  {
    id: 2,
    text: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King",
    icon: Brain,
    color: "bg-purple-500",
  },
  {
    id: 3,
    text: "Education is not the filling of a pail, but the lighting of a fire.",
    author: "W.B. Yeats",
    icon: Lightbulb,
    color: "bg-amber-500",
  },
  {
    id: 4,
    text: "The mind is not a vessel to be filled, but a fire to be kindled.",
    author: "Plutarch",
    icon: Brain,
    color: "bg-red-500",
  },
  {
    id: 5,
    text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    author: "Mahatma Gandhi",
    icon: BookOpen,
    color: "bg-green-500",
  },
  {
    id: 6,
    text: "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela",
    icon: GraduationCap,
    color: "bg-indigo-500",
  },
  {
    id: 7,
    text: "The roots of education are bitter, but the fruit is sweet.",
    author: "Aristotle",
    icon: BookOpen,
    color: "bg-emerald-500",
  },
  {
    id: 8,
    text: "Knowledge is power. Information is liberating. Education is the premise of progress.",
    author: "Kofi Annan",
    icon: Lightbulb,
    color: "bg-cyan-500",
  },
];

export default function EducationQuotesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuote = educationalQuotes[currentIndex];

  const nextQuote = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === educationalQuotes.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevQuote = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? educationalQuotes.length - 1 : prevIndex - 1
    );
  };

  // Auto-advance quotes
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        nextQuote();
      }, 8000); // Change quote every 8 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused]);

  // Pause on hover
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  return (
    <Card
      className="overflow-hidden border-none shadow-lg mb-6"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-primary"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-secondary"></div>
          </div>

          {/* Quote content */}
          <div className="relative z-10 p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuote.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full mb-4",
                    currentQuote.color,
                    "text-white"
                  )}
                >
                  <currentQuote.icon className="w-6 h-6" />
                </div>

                <blockquote className="text-lg md:text-xl font-medium mb-4 max-w-2xl">
                  "{currentQuote.text}"
                </blockquote>

                <cite className="text-sm text-muted-foreground not-italic">
                  — {currentQuote.author}
                </cite>

                {/* Progress bar */}
                <div className="w-full mt-6 bg-muted rounded-full h-1 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: 8,
                      ease: "linear",
                      repeat: isPaused ? 0 : 1,
                      repeatType: "loop",
                    }}
                    key={`progress-${currentQuote.id}`}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          <div className="absolute top-1/2 left-0 right-0 -mt-4 flex justify-between px-2 sm:px-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background"
              onClick={prevQuote}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous quote</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background"
              onClick={nextQuote}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next quote</span>
            </Button>
          </div>

          {/* Quote indicator dots */}
          <div className="absolute bottom-2 left-0 right-0">
            <div className="flex justify-center space-x-1">
              {educationalQuotes.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    index === currentIndex
                      ? "bg-primary w-3"
                      : "bg-muted hover:bg-primary/50"
                  )}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to quote ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
