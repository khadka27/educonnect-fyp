"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Masonry from "react-masonry-css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Button } from "src/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import { Badge } from "src/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: "free" | "premium";
  bannerUrl: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [randomEvents, setRandomEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/events");
        if (!response.ok) throw new Error("Failed to fetch events");
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Invalid data format");
        setEvents(data);

        // Select 5 random events for the slider
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setRandomEvents(shuffled.slice(0, 5));
      } catch (error) {
        console.error("Error fetching events:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1,
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 text-center">
        Loading events...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Upcoming Events</h1>

      {/* Slider for random events */}
      {randomEvents.length > 0 && (
        <div className="mb-12">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000 }}
            className="rounded-lg overflow-hidden"
          >
            {randomEvents.map((event) => (
              <SwiperSlide key={event.id}>
                <div className="relative h-[400px]">
                  <Image
                    src={event.bannerUrl || "/default-events.jpg"}
                    alt={event.title}
                    layout="fill"
                    objectFit="cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-6">
                    <h2 className="text-white text-3xl font-bold mb-2">
                      {event.title}
                    </h2>
                    <p className="text-white mb-4">
                      {event.description.substring(0, 100)}...
                    </p>
                    <Button onClick={() => router.push(`/Events/${event.id}`)}>
                      View Details
                    </Button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Masonry layout for all events */}
      {events.length > 0 ? (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex w-auto -ml-4"
          columnClassName="pl-4 bg-clip-padding"
        >
          {events.map((event) => (
            <Card key={event.id} className="mb-4">
              <CardHeader className="relative p-0">
                <Image
                  src={event.bannerUrl || "/default-events.jpg"}
                  alt={event.title}
                  width={400}
                  height={200}
                  className="rounded-t-lg"
                />
                <Badge
                  variant={event.type === "free" ? "secondary" : "default"}
                  className="absolute top-2 right-2"
                >
                  {event.type}
                </Badge>
              </CardHeader>
              <CardContent className="pt-4">
                <CardTitle className="mb-2">{event.title}</CardTitle>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{format(new Date(event.date), "MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/Events/${event.id}`}>Get Tickets</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </Masonry>
      ) : (
        <div className="text-center">No events found.</div>
      )}
    </div>
  );
}
