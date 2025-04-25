"use client";

import type React from "react";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, isAfter, isBefore } from "date-fns";
import Masonry from "react-masonry-css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calendar,
  MapPin,
  PlusCircle,
  Search,
  Filter,
  SlidersHorizontal,
  Tag,
  Users,
  X,
  ChevronDown,
  CalendarDays,
  Sparkles,
  ArrowUpDown,
  Heart,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: "free" | "premium";
  bannerUrl: string;
  category?: string;
  attendees?: number;
}

// Sample categories for the filter
const categories = [
  "All Categories",
  "Workshop",
  "Conference",
  "Webinar",
  "Meetup",
  "Hackathon",
  "Seminar",
  "Training",
  "Other",
];

// Sample locations for the filter
const locations = [
  "All Locations",
  "New York",
  "San Francisco",
  "London",
  "Berlin",
  "Tokyo",
  "Sydney",
  "Online",
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedEvents, setLikedEvents] = useState<Set<string>>(new Set());
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] =
    useState<string>("All Categories");
  const [selectedLocation, setSelectedLocation] =
    useState<string>("All Locations");
  const [selectedDateRange, setSelectedDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [sortBy, setSortBy] = useState<string>("date-asc");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Update the fetchEvents function to dynamically fetch data without reloading the page
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Construct query parameters for search and filters
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("search", searchQuery);
      if (selectedType !== "all") params.append("type", selectedType);
      if (selectedCategory !== "All Categories")
        params.append("category", selectedCategory);
      if (selectedLocation !== "All Locations")
        params.append("location", selectedLocation);
      if (selectedDateRange.from)
        params.append("from", selectedDateRange.from.toISOString());
      if (selectedDateRange.to)
        params.append("to", selectedDateRange.to.toISOString());
      params.append("sortBy", sortBy);

      // Fetch events from the API with query parameters
      const response = await fetch(`/api/events?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid data format");

      setEvents(data);
      setFilteredEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    searchQuery,
    selectedType,
    selectedCategory,
    selectedLocation,
    selectedDateRange,
    sortBy,
  ]);

  // Trigger fetchEvents dynamically when searchQuery or filters change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Apply filters
  const applyFilters = useCallback(() => {
    if (events.length === 0) return;

    let filtered = [...events];
    const activeFiltersList: string[] = [];

    // Text search
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      activeFiltersList.push(`Search: "${searchQuery}"`);
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter((event) => event.type === selectedType);
      activeFiltersList.push(`Type: ${selectedType}`);
    }

    // Category filter
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(
        (event) => event.category === selectedCategory
      );
      activeFiltersList.push(`Category: ${selectedCategory}`);
    }

    // Location filter
    if (selectedLocation !== "All Locations") {
      filtered = filtered.filter(
        (event) => event.location === selectedLocation
      );
      activeFiltersList.push(`Location: ${selectedLocation}`);
    }

    // Date range filter
    if (selectedDateRange.from) {
      filtered = filtered.filter((event) =>
        isAfter(new Date(event.date), selectedDateRange.from as Date)
      );
      activeFiltersList.push(
        `From: ${format(selectedDateRange.from, "MMM d, yyyy")}`
      );
    }

    if (selectedDateRange.to) {
      filtered = filtered.filter((event) =>
        isBefore(new Date(event.date), selectedDateRange.to as Date)
      );
      activeFiltersList.push(
        `To: ${format(selectedDateRange.to, "MMM d, yyyy")}`
      );
    }

    // Sorting
    switch (sortBy) {
      case "date-asc":
        filtered.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        break;
      case "date-desc":
        filtered.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;
      case "title-asc":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "attendees":
        filtered.sort((a, b) => (b.attendees || 0) - (a.attendees || 0));
        break;
    }

    setFilteredEvents(filtered);
    setActiveFilters(activeFiltersList);
  }, [
    events,
    searchQuery,
    selectedType,
    selectedCategory,
    selectedLocation,
    selectedDateRange,
    sortBy,
  ]);

  // Apply filters when any filter changes
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedCategory("All Categories");
    setSelectedLocation("All Locations");
    setSelectedDateRange({ from: undefined, to: undefined });
    setSortBy("date-asc");
    setActiveFilters([]);
  };

  // Remove a specific filter
  const removeFilter = (filter: string) => {
    if (filter.startsWith("Search:")) {
      setSearchQuery("");
    } else if (filter.startsWith("Type:")) {
      setSelectedType("all");
    } else if (filter.startsWith("Category:")) {
      setSelectedCategory("All Categories");
    } else if (filter.startsWith("Location:")) {
      setSelectedLocation("All Locations");
    } else if (filter.startsWith("From:")) {
      setSelectedDateRange((prev) => ({ ...prev, from: undefined }));
    } else if (filter.startsWith("To:")) {
      setSelectedDateRange((prev) => ({ ...prev, to: undefined }));
    }
  };

  const toggleLikeEvent = (eventId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newLikedEvents = new Set(likedEvents);
    if (newLikedEvents.has(eventId)) {
      newLikedEvents.delete(eventId);
    } else {
      newLikedEvents.add(eventId);
    }

    setLikedEvents(newLikedEvents);
    localStorage.setItem("likedEvents", JSON.stringify([...newLikedEvents]));
  };

  const shareEvent = (event: Event, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      navigator
        .share({
          title: event.title,
          text: `Check out this event: ${event.title}`,
          url: `${window.location.origin}/Events/${event.id}`,
        })
        .catch((error) => console.log("Error sharing", error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(
        `${window.location.origin}/Events/${event.id}`
      );
      alert("Link copied to clipboard!");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1,
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Skeleton for slider */}
        <Skeleton className="w-full h-[400px] rounded-lg mb-12" />

        {/* Skeleton for search bar */}
        <Skeleton className="w-full h-16 rounded-lg mb-8" />

        {/* Skeleton for events */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-[350px] rounded-lg" />
            ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg shadow-sm dark:bg-red-900/20 dark:text-red-300">
          <h2 className="text-2xl font-bold mb-2">Error Loading Events</h2>
          <p className="mb-4">{error}</p>
          <Button
            variant="destructive"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto px-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-900 py-10"
      ref={scrollRef}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Discover Events
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Find and join amazing events in your area
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300 transform hover:scale-105"
            onClick={() => router.push("/Events/create")}
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Create Event
          </Button>
        </div>
      </motion.div>

      {/* Featured Events Slider */}
      {featuredEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-center mb-4">
            <Sparkles className="h-5 w-5 text-amber-500 mr-2" />
            <h2 className="text-2xl font-bold">Featured Events</h2>
          </div>
          <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectFade]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000 }} // Set autoplay delay to 3 seconds
            effect="fade"
            className="rounded-xl overflow-hidden shadow-lg"
          >
            {featuredEvents.map((event) => (
              <SwiperSlide key={event.id}>
                <div
                  className="relative h-[300px] md:h-[400px] group cursor-pointer"
                  onClick={() => router.push(`/Events/${event.id}`)}
                >
                  <Image
                    src={event.bannerUrl || "/default-events.jpg"}
                    alt={event.title}
                    fill
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-4 md:p-8">
                    <Badge className="mb-4 self-start bg-emerald-600 hover:bg-emerald-700">
                      {event.category}
                    </Badge>
                    <h2 className="text-white text-xl md:text-3xl font-bold mb-2">
                      {event.title}
                    </h2>
                    <div className="flex flex-wrap gap-2 md:gap-4 text-white/90 mb-4">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>
                          {format(new Date(event.date), "MMMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        <span>{event.attendees} attending</span>
                      </div>
                    </div>
                    <p className="text-white/80 mb-6 line-clamp-2 text-sm md:text-base">
                      {event.description}
                    </p>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/Events/${event.id}`);
                      }}
                      className="self-start bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300 transform hover:scale-105"
                      size="lg"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      )}

      {/* Advanced Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 transition-all duration-300 hover:shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search input */}
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search events by title, description or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-emerald-200 focus-visible:ring-emerald-500 dark:border-emerald-800 transition-all duration-200"
              />
            </div>

            {/* Quick filters */}
            <div className="flex flex-wrap gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[130px] border-emerald-200 focus:ring-emerald-500 dark:border-emerald-800 transition-all duration-200">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[130px] border-emerald-200 focus:ring-emerald-500 dark:border-emerald-800 transition-all duration-200">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-asc">Date (Earliest)</SelectItem>
                  <SelectItem value="date-desc">Date (Latest)</SelectItem>
                  <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                  <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                  <SelectItem value="attendees">Most Popular</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className={cn(
                  "border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/20 transition-all duration-200",
                  isFilterExpanded &&
                    "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                )}
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Filters</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 ml-2 transition-transform",
                    isFilterExpanded && "transform rotate-180"
                  )}
                />
              </Button>
            </div>
          </div>

          {/* Advanced filters (expandable) */}
          <AnimatePresence>
            {isFilterExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label
                      htmlFor="category"
                      className="text-sm font-medium mb-1.5 block"
                    >
                      Category
                    </Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger
                        id="category"
                        className="w-full border-emerald-200 focus:ring-emerald-500 dark:border-emerald-800 transition-all duration-200"
                      >
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor="location"
                      className="text-sm font-medium mb-1.5 block"
                    >
                      Location
                    </Label>
                    <Select
                      value={selectedLocation}
                      onValueChange={setSelectedLocation}
                    >
                      <SelectTrigger
                        id="location"
                        className="w-full border-emerald-200 focus:ring-emerald-500 dark:border-emerald-800 transition-all duration-200"
                      >
                        <SelectValue placeholder="Select Location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Date Range
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal border-emerald-200 focus:ring-emerald-500 dark:border-emerald-800 transition-all duration-200"
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {selectedDateRange.from ? (
                            selectedDateRange.to ? (
                              <>
                                {format(selectedDateRange.from, "LLL dd, y")} -{" "}
                                {format(selectedDateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(selectedDateRange.from, "LLL dd, y")
                            )
                          ) : (
                            "Pick a date range"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          initialFocus
                          mode="range"
                          defaultMonth={selectedDateRange.from}
                          selected={selectedDateRange}
                          onSelect={setSelectedDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active filters */}
          <AnimatePresence>
            {activeFilters.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="mt-4 flex flex-wrap gap-2"
              >
                {activeFilters.map((filter) => (
                  <Badge
                    key={filter}
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/40 px-3 py-1 transition-all duration-200"
                  >
                    {filter}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer hover:text-red-500 transition-colors duration-200"
                      onClick={() => removeFilter(filter)}
                    />
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-900/20 h-7 transition-all duration-200"
                >
                  Clear All
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Events Display */}
      {filteredEvents.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center">
              <Tag className="mr-2 h-5 w-5 text-emerald-600" />
              {filteredEvents.length}{" "}
              {filteredEvents.length === 1 ? "Event" : "Events"} Found
            </h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSortBy(
                        sortBy.includes("asc")
                          ? sortBy.replace("asc", "desc")
                          : sortBy.replace("desc", "asc")
                      )
                    }
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                  >
                    <ArrowUpDown className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Toggle Sort</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Change sort direction</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex w-auto -ml-4"
            columnClassName="pl-4 bg-clip-padding"
          >
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
                layout
              >
                <Card
                  className="mb-6 overflow-hidden hover:shadow-lg transition-all duration-300 border-emerald-100 dark:border-emerald-900/50 relative"
                  onMouseEnter={() => setActiveEventId(event.id)}
                  onMouseLeave={() => setActiveEventId(null)}
                >
                  <CardHeader className="relative p-0">
                    <div className="relative h-48 overflow-hidden group">
                      <Image
                        src={event.bannerUrl || "/default-events.jpg"}
                        alt={event.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Interactive buttons that appear on hover */}
                      <div
                        className={cn(
                          "absolute top-2 right-2 flex gap-2 transition-opacity duration-300",
                          activeEventId === event.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
                                onClick={(e) => toggleLikeEvent(event.id, e)}
                              >
                                <Heart
                                  className={cn(
                                    "h-4 w-4",
                                    likedEvents.has(event.id)
                                      ? "fill-red-500 text-red-500"
                                      : "text-white"
                                  )}
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {likedEvents.has(event.id) ? "Unlike" : "Like"}{" "}
                                event
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
                                onClick={(e) => shareEvent(event, e)}
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Share event</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <div className="absolute top-0 left-0 right-0 p-3 flex justify-between">
                      <Badge
                        className={cn(
                          "bg-opacity-90 backdrop-blur-sm transition-all duration-300",
                          event.type === "free"
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-amber-600 hover:bg-amber-700"
                        )}
                      >
                        {event.type === "free" ? "Free" : "Premium"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-black/50 text-white border-transparent backdrop-blur-sm"
                      >
                        {event.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <CardTitle className="mb-2 line-clamp-1 group">
                      <Link
                        href={`/Events/${event.id}`}
                        className="hover:text-emerald-600 transition-colors duration-200"
                      >
                        {event.title}
                      </Link>
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>
                          {format(new Date(event.date), "MMMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <MapPin className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Users className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{event.attendees} attending</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300 transform hover:scale-105"
                    >
                      <Link href={`/Events/${event.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </Masonry>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center p-10 bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow-sm"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-4">
            <Calendar className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No events found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            We couldn't find any events matching your search criteria. Try
            adjusting your filters or create your own event.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/20 transition-all duration-300"
            >
              <Filter className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
            <Button
              onClick={() => router.push("/Events/create")}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300 transform hover:scale-105"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>
        </motion.div>
      )}

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollToTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className="h-10 w-10 rounded-full shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={scrollToTop}
                  >
                    <ArrowUpDown className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Scroll to top</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
