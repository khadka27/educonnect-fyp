"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Calendar, ArrowRight, MapPin, Users, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format, isPast } from "date-fns";

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  attendees?: number;
  createdById?: string;
}

export function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/events");

        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const data = await response.json();

        // Filter out past events and sort by date
        const upcomingEvents = data
          .filter((event: Event) => !isPast(new Date(event.date)))
          .sort(
            (a: Event, b: Event) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          .slice(0, 3); // Limit to 3 events

        setEvents(upcomingEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch events");
        toast({
          title: "Error",
          description: "Failed to load upcoming events",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [toast]);

  const formatEventDate = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if the event is today
    if (eventDate.toDateString() === today.toDateString()) {
      return `Today, ${format(eventDate, "h:mm a")}`;
    }

    // Check if the event is tomorrow
    if (eventDate.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${format(eventDate, "h:mm a")}`;
    }

    // If within the next 7 days
    if (eventDate.getTime() - today.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return `${format(eventDate, "EEEE")}, ${format(eventDate, "h:mm a")}`;
    }

    // Otherwise, show the full date
    return format(eventDate, "MMM d, h:mm a");
  };

  if (loading) {
    return (
      <Card
        className={cn(
          "overflow-hidden shadow-md",
          theme === "dark"
            ? "bg-gray-900/90 border-emerald-900/20"
            : "bg-white/90 border-emerald-100"
        )}
      >
        <CardHeader
          className={cn(
            "pb-2",
            theme === "dark"
              ? "border-b border-gray-800"
              : "border-b border-emerald-100"
          )}
        >
          <CardTitle
            className={cn(
              "text-xl font-bold flex items-center",
              theme === "dark" ? "text-emerald-400" : "text-emerald-700"
            )}
          >
            <Calendar
              className={cn(
                "h-5 w-5 mr-2",
                theme === "dark" ? "text-emerald-500" : "text-emerald-600"
              )}
            />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <div
                  className={cn(
                    "h-12 w-12 rounded-lg animate-pulse flex-shrink-0",
                    theme === "dark" ? "bg-gray-800" : "bg-emerald-100"
                  )}
                ></div>
                <div className="space-y-2 flex-1">
                  <Skeleton
                    className={cn(
                      "h-5 rounded w-3/4",
                      theme === "dark" ? "bg-gray-800" : "bg-emerald-100"
                    )}
                  />
                  <Skeleton
                    className={cn(
                      "h-4 rounded w-1/2",
                      theme === "dark" ? "bg-gray-800" : "bg-emerald-100"
                    )}
                  />
                  <Skeleton
                    className={cn(
                      "h-4 rounded w-1/3",
                      theme === "dark" ? "bg-gray-800" : "bg-emerald-100"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        className={cn(
          "overflow-hidden shadow-md",
          theme === "dark"
            ? "bg-gray-900/90 border-emerald-900/20"
            : "bg-white/90 border-emerald-100"
        )}
      >
        <CardHeader
          className={cn(
            "pb-2",
            theme === "dark"
              ? "border-b border-gray-800"
              : "border-b border-emerald-100"
          )}
        >
          <CardTitle
            className={cn(
              "text-xl font-bold flex items-center",
              theme === "dark" ? "text-emerald-400" : "text-emerald-700"
            )}
          >
            <Calendar
              className={cn(
                "h-5 w-5 mr-2",
                theme === "dark" ? "text-emerald-500" : "text-emerald-600"
              )}
            />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div
            className={cn(
              "p-4 rounded-lg text-center",
              theme === "dark"
                ? "bg-rose-900/20 text-rose-400"
                : "bg-rose-50 text-rose-600"
            )}
          >
            <p>Could not load events. Please try again later.</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden shadow-md",
        theme === "dark"
          ? "bg-gray-900/90 border-emerald-900/20"
          : "bg-white/90 border-emerald-100"
      )}
    >
      <CardHeader
        className={cn(
          "pb-2",
          theme === "dark"
            ? "border-b border-gray-800"
            : "border-b border-emerald-100"
        )}
      >
        <CardTitle
          className={cn(
            "text-xl font-bold flex items-center",
            theme === "dark" ? "text-emerald-400" : "text-emerald-700"
          )}
        >
          <Calendar
            className={cn(
              "h-5 w-5 mr-2",
              theme === "dark" ? "text-emerald-500" : "text-emerald-600"
            )}
          />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {events.length === 0 ? (
          <div
            className={cn(
              "p-4 rounded-lg text-center",
              theme === "dark"
                ? "bg-emerald-900/20 text-emerald-400"
                : "bg-emerald-50/70 text-emerald-600"
            )}
          >
            <p>No upcoming events scheduled</p>
            <Button
              asChild
              variant="link"
              className={cn(
                "mt-2 p-0",
                theme === "dark" ? "text-emerald-400" : "text-emerald-600"
              )}
            >
              <Link href="/events/create">Create an event</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link href={`/events/${event.id}`} className="block">
                  <div
                    className={cn(
                      "p-4 rounded-lg transition-colors",
                      theme === "dark"
                        ? "bg-gray-800/60 hover:bg-gray-800"
                        : "bg-emerald-50/70 hover:bg-emerald-100/70"
                    )}
                  >
                    <div className="flex items-start">
                      <div
                        className={cn(
                          "flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg mr-4",
                          theme === "dark"
                            ? "bg-emerald-900/50"
                            : "bg-emerald-100"
                        )}
                      >
                        <Calendar
                          className={cn(
                            "h-6 w-6",
                            theme === "dark"
                              ? "text-emerald-400"
                              : "text-emerald-600"
                          )}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4
                          className={cn(
                            "text-base font-medium line-clamp-1",
                            theme === "dark" ? "text-white" : "text-emerald-800"
                          )}
                        >
                          {event.title}
                        </h4>

                        <div className="mt-2 flex flex-wrap gap-3">
                          <div
                            className={cn(
                              "flex items-center text-xs",
                              theme === "dark"
                                ? "text-emerald-400"
                                : "text-emerald-600"
                            )}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatEventDate(event.date)}</span>
                          </div>

                          {event.location && (
                            <div
                              className={cn(
                                "flex items-center text-xs",
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              )}
                            >
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="line-clamp-1">
                                {event.location}
                              </span>
                            </div>
                          )}

                          {event.attendees !== undefined && (
                            <div
                              className={cn(
                                "flex items-center text-xs",
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              )}
                            >
                              <Users className="h-3 w-3 mr-1" />
                              <span>
                                {event.attendees}{" "}
                                {event.attendees === 1
                                  ? "attendee"
                                  : "attendees"}
                              </span>
                            </div>
                          )}
                        </div>

                        {event.description && (
                          <p
                            className={cn(
                              "mt-2 text-xs line-clamp-2",
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            )}
                          >
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <Button
            asChild
            variant="link"
            className={cn(
              "p-0 h-auto flex items-center",
              theme === "dark"
                ? "text-emerald-400 hover:text-emerald-300"
                : "text-emerald-600 hover:text-emerald-700"
            )}
          >
            <Link href="/events">
              View all events
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
