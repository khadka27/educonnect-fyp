"use client"

import { useState, useEffect } from "react"
import { Calendar, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "src/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { format, isPast } from "date-fns"

interface Event {
  id: string
  title: string
  description?: string
  date: string
  location?: string
  attendees?: number
  createdById?: string
}

export function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/events")

        if (!response.ok) {
          throw new Error("Failed to fetch events")
        }

        const data = await response.json()

        // Filter out past events and sort by date
        const upcomingEvents = data
          .filter((event: Event) => !isPast(new Date(event.date)))
          .sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3) // Limit to 3 events

        setEvents(upcomingEvents)
      } catch (err) {
        console.error("Error fetching events:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch events")
        toast({
          title: "Error",
          description: "Failed to load upcoming events",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [toast])

  const formatEventDate = (dateString: string) => {
    const eventDate = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Check if the event is today
    if (eventDate.toDateString() === today.toDateString()) {
      return `Today, ${format(eventDate, "h:mm a")}`
    }

    // Check if the event is tomorrow
    if (eventDate.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${format(eventDate, "h:mm a")}`
    }

    // If within the next 7 days
    if (eventDate.getTime() - today.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return `${format(eventDate, "EEEE")}, ${format(eventDate, "h:mm a")}`
    }

    // Otherwise, show the full date
    return format(eventDate, "MMM d, h:mm a")
  }

  if (loading) {
    return (
      <Card className="bg-white/90 dark:bg-gray-800/90 border-emerald-100 dark:border-emerald-900/50 overflow-hidden shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center text-emerald-700 dark:text-emerald-300">
            <Calendar className="mr-2 h-4 w-4" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 bg-emerald-50/70 dark:bg-emerald-900/20 rounded-lg">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-white/90 dark:bg-gray-800/90 border-emerald-100 dark:border-emerald-900/50 overflow-hidden shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center text-emerald-700 dark:text-emerald-300">
            <Calendar className="mr-2 h-4 w-4" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-600 dark:text-rose-400 text-sm">
            <p>Could not load events. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 border-emerald-100 dark:border-emerald-900/50 overflow-hidden shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center text-emerald-700 dark:text-emerald-300">
          <Calendar className="mr-2 h-4 w-4" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        {events.length === 0 ? (
          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-900/20 rounded-lg text-center">
            <p className="text-emerald-600 dark:text-emerald-400 text-sm">No upcoming events</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <Link href={`/events/${event.id}`} key={event.id}>
                <div className="p-3 bg-emerald-50/70 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100/70 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer">
                  <h3 className="font-medium text-emerald-800 dark:text-emerald-200">{event.title}</h3>
                  <div className="flex justify-between items-center mt-1 text-sm">
                    <p className="text-emerald-600 dark:text-emerald-400">{formatEventDate(event.date)}</p>
                    <p className="text-emerald-600/70 dark:text-emerald-400/70">
                      {event.attendees || 0} {event.attendees === 1 ? "attendee" : "attendees"}
                    </p>
                  </div>
                  {event.location && (
                    <p className="text-xs text-emerald-500/70 dark:text-emerald-400/70 mt-1">{event.location}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
        <Button
          asChild
          variant="link"
          className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 p-0 h-auto mt-2 flex items-center"
        >
          <Link href="/events">
            View all events
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
