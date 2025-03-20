"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Hash,
  BarChart3,
  Clock,
  FlameIcon as Fire,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "src/components/ui/card";
import { Button } from "src/components/ui/button";
import { Badge } from "src/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "src/components/ui/tabs";

interface TrendingTopic {
  id: string;
  hashtag: string;
  title: string;
  category: string;
  posts: number;
  trend: "up" | "down" | "stable";
  percentageChange?: number;
  timeframe: string;
}

export default function TrendingTopics() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setTrendingTopics(sampleTrendingTopics);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredTopics =
    selectedCategory === "all"
      ? trendingTopics
      : trendingTopics.filter((topic) => topic.category === selectedCategory);

  const categories = ["all", "technology", "sports", "entertainment", "news"];

  return (
    <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-950">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Trending Now
          </CardTitle>
          <Badge variant="outline" className="px-2 py-0 text-xs font-normal">
            <Clock className="h-3 w-3 mr-1" />
            Updated 5m ago
          </Badge>
        </div>
      </CardHeader>

      <Tabs defaultValue="all" className="w-full">
        <div className="px-4">
          <TabsList className="w-full h-auto p-1 bg-muted/30 dark:bg-muted/20 rounded-lg mb-3">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                onClick={() => setSelectedCategory(category)}
                className="text-xs capitalize py-1.5 flex-1"
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
                    <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded animate-pulse w-1/4"></div>
                      <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="divide-y divide-border">
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
                      className="w-full justify-start p-4 rounded-none hover:bg-muted/50 dark:hover:bg-muted/20 group"
                    >
                      <div className="flex items-start w-full">
                        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary mr-3">
                          {topic.trend === "up" ? (
                            <Fire className="h-5 w-5" />
                          ) : topic.trend === "down" ? (
                            <BarChart3 className="h-5 w-5" />
                          ) : (
                            <Hash className="h-5 w-5" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <p className="text-xs font-medium text-muted-foreground">
                              #{topic.hashtag}
                            </p>
                            <Badge
                              variant={
                                topic.trend === "up"
                                  ? "default"
                                  : topic.trend === "down"
                                  ? "destructive"
                                  : "outline"
                              }
                              className="ml-2 px-1.5 py-0 h-4 text-[10px]"
                            >
                              {topic.trend === "up" && "+"}
                              {topic.percentageChange}%
                            </Badge>
                          </div>

                          <h4 className="mt-1 text-sm font-medium text-foreground truncate">
                            {topic.title}
                          </h4>

                          <div className="mt-1 flex items-center text-xs text-muted-foreground">
                            <span>{topic.posts.toLocaleString()} posts</span>
                            <span className="mx-1.5">•</span>
                            <span>{topic.timeframe}</span>
                          </div>
                        </div>

                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Button>
                  </motion.li>
                ))}
              </ul>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>

      <CardFooter className="p-4 border-t bg-muted/10">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs text-muted-foreground hover:text-foreground"
        >
          Show more
          <ExternalLink className="ml-2 h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}

// Sample data
const sampleTrendingTopics: TrendingTopic[] = [
  {
    id: "1",
    hashtag: "AI",
    title: "Artificial Intelligence breakthroughs in healthcare",
    category: "technology",
    posts: 24500,
    trend: "up",
    percentageChange: 32,
    timeframe: "Today",
  },
  {
    id: "2",
    hashtag: "WorldCup",
    title: "Highlights from yesterday's match",
    category: "sports",
    posts: 18300,
    trend: "up",
    percentageChange: 45,
    timeframe: "Today",
  },
  {
    id: "3",
    hashtag: "ClimateAction",
    title: "New environmental policies announced",
    category: "news",
    posts: 12700,
    trend: "stable",
    percentageChange: 5,
    timeframe: "This week",
  },
  {
    id: "4",
    hashtag: "MovieAwards",
    title: "Nominees announced for best picture",
    category: "entertainment",
    posts: 9800,
    trend: "up",
    percentageChange: 28,
    timeframe: "Today",
  },
  {
    id: "5",
    hashtag: "StockMarket",
    title: "Tech stocks plummet after earnings reports",
    category: "news",
    posts: 8500,
    trend: "down",
    percentageChange: 12,
    timeframe: "Today",
  },
  {
    id: "6",
    hashtag: "GamingNews",
    title: "Highly anticipated game release delayed",
    category: "entertainment",
    posts: 7200,
    trend: "up",
    percentageChange: 18,
    timeframe: "This week",
  },
  {
    id: "7",
    hashtag: "SpaceX",
    title: "Successful launch of new satellite constellation",
    category: "technology",
    posts: 6500,
    trend: "up",
    percentageChange: 22,
    timeframe: "Yesterday",
  },
  {
    id: "8",
    hashtag: "Olympics",
    title: "Training begins for summer games",
    category: "sports",
    posts: 5800,
    trend: "stable",
    percentageChange: 3,
    timeframe: "This week",
  },
];
