"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Hash,
  Clock,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "src/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "src/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "src/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

export default function TrendingTopics() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchTrendingTopics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch trending topics from our API endpoint
      const response = await fetch("/api/trending-topics");

      if (!response.ok) {
        throw new Error(`Failed to fetch trending topics: ${response.status}`);
      }

      const data = await response.json();
      setTrendingTopics(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching trending topics:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch trending topics"
      );

      // Show error toast
      toast({
        title: "Error fetching trends",
        description: "Could not load trending topics. Please try again later.",
        variant: "destructive",
      });

      // Fall back to sample data in production
      if (process.env.NODE_ENV === "production") {
        setTrendingTopics(sampleTrendingTopics);
        setLastUpdated(new Date());
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchTrendingTopics();

    // Set up polling to refresh data periodically
    const intervalId = setInterval(() => {
      fetchTrendingTopics();
    }, 15 * 60 * 1000); // Refresh every 15 minutes

    return () => clearInterval(intervalId);
  }, []);

  const filteredTopics =
    selectedCategory === "all"
      ? trendingTopics
      : trendingTopics.filter((topic) => topic.category === selectedCategory);

  // Dynamically get categories from the data
  const categories = [
    "all",
    ...Array.from(new Set(trendingTopics.map((topic) => topic.category))),
  ];

  // Format the last updated time
  const getLastUpdatedText = () => {
    if (!lastUpdated) return "Not updated yet";

    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "just now";
    if (diffMins === 1) return "1m ago";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1h ago";
    return `${diffHours}h ago`;
  };

  const handleRefresh = () => {
    fetchTrendingTopics();
    toast({
      title: "Refreshing trends",
      description: "Getting the latest trending topics...",
    });
  };

  // Get trend color
  const getTrendColor = (trend: string, percentageChange = 0) => {
    if (trend === "up") {
      if (percentageChange >= 40) return "text-emerald-400";
      if (percentageChange >= 20) return "text-emerald-500";
      return "text-emerald-600";
    }
    if (trend === "down") return "text-rose-500";
    return "text-amber-500";
  };

  // Get trend badge color
  const getTrendBadgeColor = (trend: string) => {
    if (trend === "up")
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (trend === "down")
      return "bg-rose-500/20 text-rose-400 border-rose-500/30";
    return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  };

  return (
    <Card className="overflow-hidden border-gray-800 bg-gray-900/95 shadow-xl">
      <CardHeader className="pb-2 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center text-emerald-400">
            <TrendingUp className="h-5 w-5 mr-2 text-emerald-500" />
            Trending Now
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="px-3 py-1 text-xs font-normal border-gray-700 bg-gray-800/50 text-emerald-400"
            >
              <Clock className="h-3 w-3 mr-1.5" />
              Updated {getLastUpdatedText()}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-950/30"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={cn("h-4 w-4", isLoading && "animate-spin")}
              />
            </Button>
          </div>
        </div>
      </CardHeader>

      <Tabs defaultValue="all" className="w-full">
        <div className="px-4 pt-3">
          <TabsList className="w-full h-auto p-1 bg-gray-800/80 rounded-lg mb-3">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                onClick={() => setSelectedCategory(category)}
                className="text-sm capitalize py-1.5 flex-1 data-[state=active]:bg-emerald-600 data-[state=active]:text-white dark:data-[state=active]:bg-emerald-700"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={selectedCategory} className="m-0">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gray-800 animate-pulse"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-800 rounded animate-pulse w-1/4"></div>
                      <div className="h-3 bg-gray-800 rounded animate-pulse w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-rose-400 mb-2">
                  Unable to load trending topics
                </h3>
                <p className="text-sm text-gray-400 mb-4">{error}</p>
                <Button
                  onClick={handleRefresh}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : filteredTopics.length === 0 ? (
              <div className="p-8 text-center">
                <Hash className="h-10 w-10 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-emerald-400 mb-2">
                  No trending topics found
                </h3>
                <p className="text-sm text-gray-400">
                  {selectedCategory === "all"
                    ? "There are no trending topics at the moment."
                    : `There are no trending topics in the "${selectedCategory}" category.`}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-800">
                {filteredTopics.map((topic, index) => (
                  <motion.li
                    key={topic.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="relative"
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-4 rounded-none hover:bg-gray-800/50 group"
                      asChild={!!topic.url}
                    >
                      <a
                        href={topic.url || "#"}
                        target={topic.url ? "_blank" : undefined}
                        rel={topic.url ? "noopener noreferrer" : undefined}
                        className="flex items-start w-full"
                      >
                        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 mr-3">
                          <Zap
                            className={`h-5 w-5 ${getTrendColor(
                              topic.trend,
                              topic.percentageChange
                            )}`}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-emerald-400">
                              #{topic.hashtag}
                            </p>
                            <Badge
                              variant="outline"
                              className={cn(
                                "ml-2 px-2 py-0.5 text-xs",
                                getTrendBadgeColor(topic.trend)
                              )}
                            >
                              {topic.trend === "up" && "+"}
                              {topic.percentageChange}%
                            </Badge>
                          </div>

                          <h4 className="mt-1 text-base font-medium text-gray-200 truncate">
                            {topic.title}
                          </h4>

                          <div className="mt-1 flex items-center text-xs text-gray-400">
                            <span>{topic.posts.toLocaleString()} posts</span>
                            <span className="mx-1.5">•</span>
                            <span>{topic.timeframe}</span>
                          </div>
                        </div>

                        <ChevronRight className="h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </Button>
                  </motion.li>
                ))}
              </ul>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>

      <CardFooter className="p-4 border-t border-gray-800 bg-gray-800/30">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30"
        >
          View all trending topics
          <ExternalLink className="ml-2 h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}

// Sample data as fallback
const sampleTrendingTopics: TrendingTopic[] = [
  {
    id: "1",
    hashtag: "WebDevForBegin",
    title: "24 Lessons, 12 Weeks, Get Started with Web Development",
    category: "education",
    posts: 87134,
    trend: "up",
    percentageChange: 31,
    timeframe: "This week",
  },
  {
    id: "2",
    hashtag: "p5js",
    title: "p5.js is a client-side JS platform for creative coding",
    category: "technology",
    posts: 52408,
    trend: "up",
    percentageChange: 48,
    timeframe: "This week",
  },
  {
    id: "3",
    hashtag: "VimAndroid",
    title: "Learning Vim and Vimscript doesn't have to be hard",
    category: "technology",
    posts: 14257,
    trend: "up",
    percentageChange: 23,
    timeframe: "This week",
  },
  {
    id: "4",
    hashtag: "AnkiDroid",
    title: "AnkiDroid: Anki flashcards on Android devices",
    category: "education",
    posts: 9390,
    trend: "up",
    percentageChange: 40,
    timeframe: "This week",
  },
  {
    id: "5",
    hashtag: "Processing",
    title: "Source code for the Processing Development Environment",
    category: "technology",
    posts: 6511,
    trend: "up",
    percentageChange: 18,
    timeframe: "This week",
  },
  {
    id: "6",
    hashtag: "EmailSender",
    title: "The recipient test: a simple test for email deliverability",
    category: "technology",
    posts: 4176,
    trend: "up",
    percentageChange: 34,
    timeframe: "Yesterday",
  },
  {
    id: "7",
    hashtag: "Thechroot",
    title: "Hotmail's Sabeer Bhatia Slams Indian Tech Education",
    category: "education",
    posts: 3742,
    trend: "up",
    percentageChange: 23,
    timeframe: "Yesterday",
  },
  {
    id: "8",
    hashtag: "Bootcamp",
    title: "The chroot Technique – a Swiss Army Knife for Developers",
    category: "technology",
    posts: 2975,
    trend: "up",
    percentageChange: 24,
    timeframe: "Today",
  },
  {
    id: "9",
    hashtag: "GlobalToy",
    title: "How University Students Use Class Time When Lectures",
    category: "education",
    posts: 1892,
    trend: "up",
    percentageChange: 14,
    timeframe: "Today",
  },
  {
    id: "10",
    hashtag: "AIStartups",
    title: "Global Toy Market Set to Soar to $230 Billion",
    category: "technology",
    posts: 1580,
    trend: "stable",
    percentageChange: 4,
    timeframe: "Yesterday",
  },
  {
    id: "11",
    hashtag: "HerFinances",
    title: "AI Startups: SignalFire Raises $1 Billion",
    category: "technology",
    posts: 3900,
    trend: "stable",
    percentageChange: 8,
    timeframe: "Yesterday",
  },
  {
    id: "12",
    hashtag: "FinTech",
    title: "Her Finances Launches AI-Driven Financial Advisor",
    category: "technology",
    posts: 1580,
    trend: "stable",
    percentageChange: 8,
    timeframe: "Yesterday",
  },
];
