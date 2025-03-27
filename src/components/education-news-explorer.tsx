"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  BookOpen,
  Calendar,
  User,
  ExternalLink,
  Newspaper,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "src/components/ui/card";
import { Badge } from "src/components/ui/badge";
import { Input } from "src/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const EducationNewsExplorer = () => {
  const [news, setNews] = useState<{ source?: { name?: string }; title?: string; description?: string; url?: string; publishedAt?: string; author?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchQuery, setSearchQuery] = useState("education");
  const [searchInput, setSearchInput] = useState("education");
  const { toast } = useToast();

  const apiKey = "f6095531c7d146fa8eb6f87e6337c446";

  useEffect(() => {
    fetchNews();
  }, [page, searchQuery]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${searchQuery}&apiKey=${apiKey}&pageSize=10&page=${page}&language=en&sortBy=publishedAt`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch news");
      }

      const data = await response.json();

      if (data.status === "error") {
        throw new Error(data.message || "Failed to fetch news");
      }

      setNews(data.articles || []);
      setTotalResults(data.totalResults || 0);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching news:", err);
      toast({
        title: "Error fetching news",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleRefresh = () => {
    fetchNews();
    toast({
      title: "Refreshed",
      description: "Latest education news loaded",
    });
  };

  const handleNextPage = () => {
    if (page * 10 < totalResults) {
      setPage(page + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim());
      setPage(1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-900 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <Card className="border-emerald-100 dark:border-emerald-900/50 overflow-hidden shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-800 dark:to-teal-800 text-white p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Newspaper size={28} />
                <CardTitle className="text-2xl font-bold">
                  Education News Explorer
                </CardTitle>
              </div>
              <Button
                onClick={handleRefresh}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <RefreshCw size={16} className="mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </CardHeader>

          <div className="p-4 border-b border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/20">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Search education news..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500"
              />
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-800"
                disabled={loading || !searchInput.trim()}
              >
                Search
              </Button>
            </form>
          </div>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center p-16">
                <div className="flex flex-col items-center">
                  <Loader2
                    size={40}
                    className="animate-spin text-emerald-500 dark:text-emerald-400 mb-4"
                  />
                  <p className="text-emerald-600 dark:text-emerald-400">
                    Loading latest education news...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <div className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 p-6 rounded-md flex flex-col items-center">
                  <AlertCircle size={40} className="mb-4" />
                  <p className="font-medium mb-4">Error: {error}</p>
                  <Button
                    onClick={handleRefresh}
                    variant="destructive"
                    className="bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-800"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            ) : news.length === 0 ? (
              <div className="p-6 text-center">
                <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 p-6 rounded-md">
                  <p className="font-medium">
                    No news articles found for "{searchQuery}"
                  </p>
                  <Button
                    onClick={() => {
                      setSearchInput("education");
                      setSearchQuery("education");
                    }}
                    variant="outline"
                    className="mt-4 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-900/30"
                  >
                    Reset Search
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-emerald-100 dark:border-emerald-900/50 bg-white/60 dark:bg-gray-800/40">
                  <p className="text-emerald-700 dark:text-emerald-300">
                    Showing{" "}
                    <span className="font-medium">
                      {(page - 1) * 10 + 1}-{Math.min(page * 10, totalResults)}
                    </span>{" "}
                    of <span className="font-medium">{totalResults}</span>{" "}
                    results for "{searchQuery}"
                  </p>
                </div>

                <div className="divide-y divide-emerald-100 dark:divide-emerald-900/50">
                  {news.map((article, index) => (
                    <article
                      key={index}
                      className="p-6 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors"
                    >
                      <div className="flex flex-col space-y-3">
                        <h2 className="text-xl font-semibold text-emerald-800 dark:text-emerald-200">
                          {article.title}
                        </h2>

                        <div className="flex flex-wrap items-center text-sm text-emerald-600/80 dark:text-emerald-400/80 gap-4">
                          {article.source?.name && (
                            <Badge
                              variant="outline"
                              className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-normal"
                            >
                              <BookOpen size={14} className="mr-1" />
                              {article.source.name}
                            </Badge>
                          )}

                          {article.publishedAt && (
                            <span className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {formatDate(article.publishedAt)}
                            </span>
                          )}

                          {article.author && (
                            <span className="flex items-center">
                              <User size={14} className="mr-1" />
                              {article.author}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                          {article.description}
                        </p>

                        <div className="pt-2">
                          <Button
                            asChild
                            variant="link"
                            className="p-0 h-auto text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                          >
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Read full article{" "}
                              <ExternalLink size={14} className="ml-1" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </CardContent>

          {!loading && !error && news.length > 0 && (
            <CardFooter className="flex justify-between items-center p-4 border-t border-emerald-100 dark:border-emerald-900/50 bg-white/60 dark:bg-gray-800/40">
              <Button
                onClick={handlePrevPage}
                disabled={page === 1}
                variant="outline"
                className={`
                  border-emerald-200 dark:border-emerald-800
                  ${
                    page === 1
                      ? "text-emerald-400 dark:text-emerald-700 cursor-not-allowed"
                      : "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                  }
                `}
              >
                <ChevronLeft size={16} className="mr-2" />
                Previous
              </Button>
              <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                Page {page} of {Math.ceil(totalResults / 10)}
              </span>
              <Button
                onClick={handleNextPage}
                disabled={page * 10 >= totalResults}
                variant="outline"
                className={`
                  border-emerald-200 dark:border-emerald-800
                  ${
                    page * 10 >= totalResults
                      ? "text-emerald-400 dark:text-emerald-700 cursor-not-allowed"
                      : "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                  }
                `}
              >
                Next
                <ChevronRight size={16} className="ml-2" />
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default EducationNewsExplorer;
