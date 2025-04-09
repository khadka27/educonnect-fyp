// "use client";

// import { useState, useEffect } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { format } from "date-fns";
// import Masonry from "react-masonry-css";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation, Pagination, Autoplay } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";
// import { Button } from "src/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "src/components/ui/card";
// import { Badge } from "src/components/ui/badge";
// import { Calendar, MapPin, PlusCircle } from "lucide-react";

// interface Event {
//   id: string;
//   title: string;
//   description: string;
//   date: string;
//   location: string;
//   type: "free" | "premium";
//   bannerUrl: string;
// }

// export default function EventsPage() {
//   const [events, setEvents] = useState<Event[]>([]);
//   const [randomEvents, setRandomEvents] = useState<Event[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchEvents = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const response = await fetch("/api/events");
//         if (!response.ok) throw new Error("Failed to fetch events");
//         const data = await response.json();
//         if (!Array.isArray(data)) throw new Error("Invalid data format");
//         setEvents(data);

//         // Select 5 random events for the slider
//         const shuffled = [...data].sort(() => 0.5 - Math.random());
//         setRandomEvents(shuffled.slice(0, 5));
//       } catch (error) {
//         console.error("Error fetching events:", error);
//         setError(
//           error instanceof Error ? error.message : "An unknown error occurred"
//         );
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchEvents();
//   }, []);

//   const breakpointColumnsObj = {
//     default: 3,
//     1100: 2,
//     700: 1,
//   };

//   if (isLoading) {
//     return (
//       <div className="ml-[25%] pr-6 py-10 text-center">Loading events...</div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="ml-[25%] pr-6 py-10 text-center text-red-500">
//         Error: {error}
//       </div>
//     );
//   }

//   return (
//     <div className=" pr-6 py-10 mt-10">
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-4xl font-bold">Upcoming Events</h1>
//         <Button
//           className="flex items-center gap-2"
//           onClick={() => router.push("/events/create")}
//         >
//           <PlusCircle className="h-5 w-5" />
//           Create Event
//         </Button>
//       </div>

//       {/* Slider for random events */}
//       {randomEvents.length > 0 && (
//         <div className="mb-12">
//           <Swiper
//             modules={[Navigation, Pagination, Autoplay]}
//             spaceBetween={30}
//             slidesPerView={1}
//             navigation
//             pagination={{ clickable: true }}
//             autoplay={{ delay: 5000 }}
//             className="rounded-lg overflow-hidden"
//           >
//             {randomEvents.map((event) => (
//               <SwiperSlide key={event.id}>
//                 <div className="relative h-[400px]">
//                   <Image
//                     src={event.bannerUrl || "/default-events.jpg"}
//                     alt={event.title}
//                     layout="fill"
//                     objectFit="cover"
//                   />
//                   <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-6">
//                     <h2 className="text-white text-3xl font-bold mb-2">
//                       {event.title}
//                     </h2>
//                     <p className="text-white mb-4">
//                       {event.description.substring(0, 100)}...
//                     </p>
//                     <Button onClick={() => router.push(`/Events/${event.id}`)}>
//                       View Details
//                     </Button>
//                   </div>
//                 </div>
//               </SwiperSlide>
//             ))}
//           </Swiper>
//         </div>
//       )}

//       {/* Masonry layout for all events */}
//       {events.length > 0 ? (
//         <Masonry
//           breakpointCols={breakpointColumnsObj}
//           className="flex w-auto -ml-4"
//           columnClassName="pl-4 bg-clip-padding"
//         >
//           {events.map((event) => (
//             <Card
//               key={event.id}
//               className="mb-4 hover:shadow-lg transition-shadow duration-300"
//             >
//               <CardHeader className="relative p-0">
//                 <Image
//                   src={event.bannerUrl || "/default-events.jpg"}
//                   alt={event.title}
//                   width={400}
//                   height={200}
//                   className="rounded-t-lg"
//                 />
//                 <Badge
//                   variant={event.type === "free" ? "secondary" : "default"}
//                   className="absolute top-2 right-2"
//                 >
//                   {event.type}
//                 </Badge>
//               </CardHeader>
//               <CardContent className="pt-4">
//                 <CardTitle className="mb-2">{event.title}</CardTitle>
//                 <div className="flex items-center text-sm text-gray-500 mb-2">
//                   <Calendar className="mr-2 h-4 w-4" />
//                   <span>{format(new Date(event.date), "MMMM d, yyyy")}</span>
//                 </div>
//                 <div className="flex items-center text-sm text-gray-500">
//                   <MapPin className="mr-2 h-4 w-4" />
//                   <span>{event.location}</span>
//                 </div>
//               </CardContent>
//               <CardFooter>
//                 <Button asChild className="w-full">
//                   <Link href={`/Events/${event.id}`}>Get Tickets</Link>
//                 </Button>
//               </CardFooter>
//             </Card>
//           ))}
//         </Masonry>
//       ) : (
//         <div className="text-center p-10 bg-gray-50 rounded-lg">
//           <p className="text-lg mb-4">No events found.</p>
//           <Button onClick={() => router.push("/events/create")}>
//             Create Your First Event
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }


"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format, isAfter, isBefore } from "date-fns"
import Masonry from "react-masonry-css"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import { Button } from "src/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "src/components/ui/card"
import { Badge } from "src/components/ui/badge"
import { Input } from "src/components/ui/input"
import { Label } from "src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "src/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "src/components/ui/popover"
import { Calendar as CalendarComponent } from "src/components/ui/calendar"
import { Skeleton } from "src/components/ui/skeleton"
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
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  type: "free" | "premium"
  bannerUrl: string
  category?: string
  attendees?: number
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
]

// Sample locations for the filter
const locations = ["All Locations", "New York", "San Francisco", "London", "Berlin", "Tokyo", "Sydney", "Online"]

 function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories")
  const [selectedLocation, setSelectedLocation] = useState<string>("All Locations")
  const [selectedDateRange, setSelectedDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [sortBy, setSortBy] = useState<string>("date-asc")
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/events")
        if (!response.ok) throw new Error("Failed to fetch events")
        const data = await response.json()
        if (!Array.isArray(data)) throw new Error("Invalid data format")

        // Add sample categories and attendees if they don't exist
        const enhancedData = data.map((event: Event) => ({
          ...event,
          category: event.category || categories[Math.floor(Math.random() * categories.length)],
          attendees: event.attendees || Math.floor(Math.random() * 100) + 10,
        }))

        setEvents(enhancedData)

        // Select featured events (premium ones or random if no premium)
        const premium = enhancedData.filter((event) => event.type === "premium")
        const featured =
          premium.length >= 5
            ? premium.slice(0, 5)
            : [...premium, ...enhancedData.filter((event) => event.type === "free")]
                .sort(() => 0.5 - Math.random())
                .slice(0, 5)

        setFeaturedEvents(featured)
      } catch (error) {
        console.error("Error fetching events:", error)
        setError(error instanceof Error ? error.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Apply filters
  const applyFilters = useCallback(() => {
    if (events.length === 0) return

    let filtered = [...events]
    const activeFiltersList: string[] = []

    // Text search
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      activeFiltersList.push(`Search: "${searchQuery}"`)
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter((event) => event.type === selectedType)
      activeFiltersList.push(`Type: ${selectedType}`)
    }

    // Category filter
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter((event) => event.category === selectedCategory)
      activeFiltersList.push(`Category: ${selectedCategory}`)
    }

    // Location filter
    if (selectedLocation !== "All Locations") {
      filtered = filtered.filter((event) => event.location === selectedLocation)
      activeFiltersList.push(`Location: ${selectedLocation}`)
    }

    // Date range filter
    if (selectedDateRange.from) {
      filtered = filtered.filter((event) => isAfter(new Date(event.date), selectedDateRange.from as Date))
      activeFiltersList.push(`From: ${format(selectedDateRange.from, "MMM d, yyyy")}`)
    }

    if (selectedDateRange.to) {
      filtered = filtered.filter((event) => isBefore(new Date(event.date), selectedDateRange.to as Date))
      activeFiltersList.push(`To: ${format(selectedDateRange.to, "MMM d, yyyy")}`)
    }

    // Sorting
    switch (sortBy) {
      case "date-asc":
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        break
      case "date-desc":
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        break
      case "title-asc":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "title-desc":
        filtered.sort((a, b) => b.title.localeCompare(a.title))
        break
      case "attendees":
        filtered.sort((a, b) => (b.attendees || 0) - (a.attendees || 0))
        break
    }

    setFilteredEvents(filtered)
    setActiveFilters(activeFiltersList)
  }, [events, searchQuery, selectedType, selectedCategory, selectedLocation, selectedDateRange, sortBy])

  // Apply filters when any filter changes
  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("")
    setSelectedType("all")
    setSelectedCategory("All Categories")
    setSelectedLocation("All Locations")
    setSelectedDateRange({ from: undefined, to: undefined })
    setSortBy("date-asc")
    setActiveFilters([])
  }

  // Remove a specific filter
  const removeFilter = (filter: string) => {
    if (filter.startsWith("Search:")) {
      setSearchQuery("")
    } else if (filter.startsWith("Type:")) {
      setSelectedType("all")
    } else if (filter.startsWith("Category:")) {
      setSelectedCategory("All Categories")
    } else if (filter.startsWith("Location:")) {
      setSelectedLocation("All Locations")
    } else if (filter.startsWith("From:")) {
      setSelectedDateRange((prev) => ({ ...prev, from: undefined }))
    } else if (filter.startsWith("To:")) {
      setSelectedDateRange((prev) => ({ ...prev, to: undefined }))
    }
  }

  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1,
  }

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
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-2">Error Loading Events</h2>
          <p className="mb-4">{error}</p>
          <Button variant="destructive" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Discover Events
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Find and join amazing events in your area</p>
        </div>
        <Button
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
          onClick={() => router.push("/events/create")}
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Featured Events Slider */}
      {featuredEvents.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center mb-4">
            <Sparkles className="h-5 w-5 text-amber-500 mr-2" />
            <h2 className="text-2xl font-bold">Featured Events</h2>
          </div>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000 }}
            className="rounded-xl overflow-hidden shadow-lg"
          >
            {featuredEvents.map((event) => (
              <SwiperSlide key={event.id}>
                <div className="relative h-[400px] group">
                  <Image
                    src={event.bannerUrl || "/default-events.jpg"}
                    alt={event.title}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-8">
                    <Badge className="mb-4 self-start bg-emerald-600 hover:bg-emerald-700">{event.category}</Badge>
                    <h2 className="text-white text-3xl font-bold mb-2">{event.title}</h2>
                    <div className="flex flex-wrap gap-4 text-white/90 mb-4">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>{format(new Date(event.date), "MMMM d, yyyy")}</span>
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
                    <p className="text-white/80 mb-6 line-clamp-2">{event.description}</p>
                    <Button
                      onClick={() => router.push(`/Events/${event.id}`)}
                      className="self-start bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                      size="lg"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Advanced Search & Filters */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search input */}
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search events by title, description or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-emerald-200 focus-visible:ring-emerald-500 dark:border-emerald-800"
              />
            </div>

            {/* Quick filters */}
            <div className="flex gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[130px] border-emerald-200 focus:ring-emerald-500 dark:border-emerald-800">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[130px] border-emerald-200 focus:ring-emerald-500 dark:border-emerald-800">
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
                  "border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/20",
                  isFilterExpanded && "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
                )}
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                <ChevronDown
                  className={cn("h-4 w-4 ml-2 transition-transform", isFilterExpanded && "transform rotate-180")}
                />
              </Button>
            </div>
          </div>

          {/* Advanced filters (expandable) */}
          {isFilterExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category" className="text-sm font-medium mb-1.5 block">
                  Category
                </Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger
                    id="category"
                    className="w-full border-emerald-200 focus:ring-emerald-500 dark:border-emerald-800"
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
                <Label htmlFor="location" className="text-sm font-medium mb-1.5 block">
                  Location
                </Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger
                    id="location"
                    className="w-full border-emerald-200 focus:ring-emerald-500 dark:border-emerald-800"
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
                <Label className="text-sm font-medium mb-1.5 block">Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-emerald-200 focus:ring-emerald-500 dark:border-emerald-800"
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {selectedDateRange.from ? (
                        selectedDateRange.to ? (
                          <>
                            {format(selectedDateRange.from, "LLL dd, y")} - {format(selectedDateRange.to, "LLL dd, y")}
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
          )}

          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge
                  key={filter}
                  variant="secondary"
                  className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/40 px-3 py-1"
                >
                  {filter}
                  <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => removeFilter(filter)} />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-900/20 h-7"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Events Display */}
      {filteredEvents.length > 0 ? (
        <>
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center">
              <Tag className="mr-2 h-5 w-5 text-emerald-600" />
              {filteredEvents.length} {filteredEvents.length === 1 ? "Event" : "Events"} Found
            </h2>
          </div>

          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex w-auto -ml-4"
            columnClassName="pl-4 bg-clip-padding"
          >
            {filteredEvents.map((event) => (
              <Card
                key={event.id}
                className="mb-6 overflow-hidden hover:shadow-lg transition-all duration-300 border-emerald-100 dark:border-emerald-900/50"
              >
                <CardHeader className="relative p-0">
                  <div className="relative h-48 overflow-hidden group">
                    <Image
                      src={event.bannerUrl || "/default-events.jpg"}
                      alt={event.title}
                      layout="fill"
                      objectFit="cover"
                      className="group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="absolute top-0 left-0 right-0 p-3 flex justify-between">
                    <Badge
                      className={cn(
                        "bg-opacity-90 backdrop-blur-sm",
                        event.type === "free"
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "bg-amber-600 hover:bg-amber-700",
                      )}
                    >
                      {event.type === "free" ? "Free" : "Premium"}
                    </Badge>
                    <Badge variant="outline" className="bg-black/50 text-white border-transparent backdrop-blur-sm">
                      {event.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <CardTitle className="mb-2 line-clamp-1">{event.title}</CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{event.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{format(new Date(event.date), "MMMM d, yyyy")}</span>
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
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                  >
                    <Link href={`/Events/${event.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </Masonry>
        </>
      ) : (
        <div className="text-center p-10 bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-4">
            <Calendar className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No events found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            We couldn't find any events matching your search criteria. Try adjusting your filters or create your own
            event.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
            >
              <Filter className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
            <Button
              onClick={() => router.push("/events/create")}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventsPage