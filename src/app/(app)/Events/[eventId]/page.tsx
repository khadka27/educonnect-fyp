// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, useParams } from "next/navigation";
// import { useSession } from "next-auth/react";
// import Image from "next/image";
// import { Button } from "src/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "src/components/ui/card";
// import { Skeleton } from "src/components/ui/skeleton";
// import { useToast } from "src/hooks/use-toast";
// import { Calendar, MapPin, Mail, Phone, Tag, ArrowLeft } from "lucide-react";
// import RegistrationForm from "src/components/event/registration-form";

// interface Event {
//   id: string;
//   title: string;
//   description: string;
//   date: string;
//   location: string;
//   type: string;
//   bannerUrl?: string;
//   contactEmail: string;
//   contactPhone: string;
//   price: string;
// }

// export default function EventDetailPage() {
//   const [event, setEvent] = useState<Event | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [isRegistered, setIsRegistered] = useState(false);
//   const [formSubmitting, setFormSubmitting] = useState(false);
//   const [showRegistrationForm, setShowRegistrationForm] = useState(false);
//   const router = useRouter();
//   const { eventId } = useParams();
//   const { data: session } = useSession();
//   const { toast } = useToast();

//   useEffect(() => {
//     const fetchEvent = async () => {
//       if (!eventId) return;

//       setLoading(true);
//       try {
//         const res = await fetch(`/api/events/${eventId}`);
//         if (!res.ok) throw new Error("Failed to fetch event");
//         const data = await res.json();
//         setEvent(data.event);

//         if (session?.user?.id) {
//           const regRes = await fetch(
//             `/api/events/check-registration?eventId=${eventId}&userId=${session.user.id}`
//           );
//           if (!regRes.ok)
//             throw new Error("Failed to check registration status");
//           const regData = await regRes.json();
//           setIsRegistered(regData.isRegistered);
//         }
//       } catch (error) {
//         console.error("Error fetching event:", error);
//         toast({
//           title: "Error",
//           description: "Failed to load event details. Please try again.",
//           variant: "destructive",
//         });
//         router.push("/events");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEvent();
//   }, [eventId, session?.user?.id, router]);

//   const handleRegisterClick = () => {
//     if (!session) {
//       toast({
//         title: "Sign in required",
//         description: "You need to sign in before registering for this event.",
//         variant: "destructive",
//       });
//       router.push("/sign-in");
//       return;
//     }
//     setShowRegistrationForm(true);
//   };

//   const handleRegistrationSuccess = () => {
//     setIsRegistered(true);
//     setShowRegistrationForm(false);
//     setFormSubmitting(false);
//     toast({
//       title: "Thank You!",
//       description:
//         "You've successfully registered for the event. Check your email for the ticket.",
//       variant: "success",
//     });
//   };

//   if (loading) {
//     return (
//       <div className="container mx-auto px-4 py-8 w-1/2">
//         <Card>
//           <CardHeader>
//             <Skeleton className="h-12 w-3/4" />
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <Skeleton className="h-4 w-full" />
//             <Skeleton className="h-4 w-full" />
//             <Skeleton className="h-4 w-2/3" />
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   if (!event) {
//     return (
//       <div className="container mx-auto px-4 py-8 w-1/2">
//         <Card>
//           <CardContent>
//             <p className="text-center">Event not found</p>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8 w-1/2">
//       <Button variant="ghost" onClick={() => router.back()} className="mb-4">
//         <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
//       </Button>
//       <Card className="overflow-hidden">
//         {event.bannerUrl && (
//           <div className="relative h-64 w-full">
//             <Image
//               src={event.bannerUrl}
//               alt={event.title}
//               layout="fill"
//               objectFit="cover"
//               priority
//             />
//           </div>
//         )}
//         <CardHeader>
//           <CardTitle className="text-2xl md:text-3xl lg:text-4xl">
//             {event.title}
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <p className="text-muted-foreground">{event.description}</p>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="flex items-center">
//               <Calendar className="mr-2 h-4 w-4" />
//               <span>
//                 {new Date(event.date).toLocaleDateString(undefined, {
//                   weekday: "long",
//                   year: "numeric",
//                   month: "long",
//                   day: "numeric",
//                 })}
//               </span>
//             </div>
//             <div className="flex items-center">
//               <MapPin className="mr-2 h-4 w-4" />
//               <span>{event.location}</span>
//             </div>
//             <div className="flex items-center">
//               <Tag className="mr-2 h-4 w-4" />
//               <span className="capitalize">{event.type}</span>
//             </div>
//             <div className="flex items-center">
//               <Mail className="mr-2 h-4 w-4" />
//               <a
//                 href={`mailto:${event.contactEmail}`}
//                 className="hover:underline"
//               >
//                 {event.contactEmail}
//               </a>
//             </div>
//             <div className="flex items-center">
//               <Phone className="mr-2 h-4 w-4" />
//               <a href={`tel:${event.contactPhone}`} className="hover:underline">
//                 {event.contactPhone}
//               </a>
//             </div>

//             {/* price */}
//             <div className="flex items-center">
//               <Tag className="mr-2 h-4 w-4" />
//               <span className="capitalize">{event.price}</span>
//             </div>
//           </div>
//         </CardContent>
//         <CardFooter>
//           {!loading && !isRegistered ? (
//             <Button onClick={handleRegisterClick} className="w-full">
//               Register for Event
//             </Button>
//           ) : (
//             <p className="text-center w-full p-2 bg-green-100 text-green-800 rounded">
//               You are registered for this event!
//             </p>
//           )}
//         </CardFooter>
//       </Card>
//       {showRegistrationForm && (
//         <RegistrationForm
//           event={event}
//           onSuccess={handleRegistrationSuccess}
//           onClose={() => setShowRegistrationForm(false)}
//           submitting={formSubmitting}
//           setSubmitting={setFormSubmitting}
//         />
//       )}
//     </div>
//   );
// }


"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { Button } from "src/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "src/components/ui/card"
import { Skeleton } from "src/components/ui/skeleton"
import { Badge } from "src/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "src/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar"
import { useToast } from "src/hooks/use-toast"
import {
  Calendar,
  MapPin,
  Mail,
  Phone,
  Tag,
  ArrowLeft,
  Clock,
  Users,
  Share2,
  Heart,
  CalendarCheck,
  Info,
  MessageSquare,
  User,
  ExternalLink,
  AlertTriangle,
  Check,
} from "lucide-react"
import RegistrationForm from "src/components/event/registration-form"
import { format } from "date-fns"
import { motion } from "framer-motion"

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  type: string
  bannerUrl?: string
  contactEmail: string
  contactPhone: string
  price: string
  category?: string
  organizer?: {
    name: string
    image?: string
  }
  attendees?: number
  similarEvents?: Array<{
    id: string
    title: string
    date: string
    bannerUrl?: string
  }>
}

export default function EventDetailPage() {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRegistered, setIsRegistered] = useState(false)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [isLiked, setIsLiked] = useState(false)
  const router = useRouter()
  const { eventId } = useParams()
  const { data: session } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return

      setLoading(true)
      try {
        const res = await fetch(`/api/events/${eventId}`)
        if (!res.ok) throw new Error("Failed to fetch event")
        const data = await res.json()

        // Add some mock data for the enhanced UI if it doesn't exist
        const enhancedEvent = {
          ...data.event,
          category: data.event.category || "Conference",
          organizer: data.event.organizer || {
            name: "EduConnect",
            image: "/placeholder.svg?height=40&width=40",
          },
          attendees: data.event.attendees || Math.floor(Math.random() * 100) + 20,
          similarEvents: data.event.similarEvents || [
            {
              id: "event-1",
              title: "Web Development Workshop",
              date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              bannerUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop",
            },
            {
              id: "event-2",
              title: "AI and Machine Learning Conference",
              date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              bannerUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop",
            },
            {
              id: "event-3",
              title: "Digital Marketing Workshop",
              date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
              bannerUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop",
            },
          ],
        }

        setEvent(enhancedEvent)

        if (session?.user?.id) {
          const regRes = await fetch(`/api/events/check-registration?eventId=${eventId}&userId=${session.user.id}`)
          if (!regRes.ok) throw new Error("Failed to check registration status")
          const regData = await regRes.json()
          setIsRegistered(regData.isRegistered)
        }
      } catch (error) {
        console.error("Error fetching event:", error)
        toast({
          title: "Error",
          description: "Failed to load event details. Please try again.",
          variant: "destructive",
        })
        router.push("/events")
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId, session?.user?.id, router, toast])

  const handleRegisterClick = () => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "You need to sign in before registering for this event.",
        variant: "destructive",
      })
      router.push("/sign-in")
      return
    }
    setShowRegistrationForm(true)
  }

  const handleRegistrationSuccess = () => {
    setIsRegistered(true)
    setShowRegistrationForm(false)
    setFormSubmitting(false)
    toast({
      title: "Thank You!",
      description: "You've successfully registered for the event. Check your email for the ticket.",
      variant: "success",
    })
  }

  const handleShareEvent = () => {
    if (navigator.share) {
      navigator
        .share({
          title: event?.title,
          text: event?.description,
          url: window.location.href,
        })
        .then(() => console.log("Shared successfully"))
        .catch((error) => console.log("Error sharing:", error))
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied!",
        description: "Event link copied to clipboard",
      })
    }
  }

  const toggleLike = () => {
    setIsLiked(!isLiked)
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: isLiked ? "Event removed from your favorites" : "Event added to your favorites",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-32 mb-6" />
          <Skeleton className="h-[400px] w-full rounded-xl mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <div className="space-y-4 mb-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The event you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => router.push("/events")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const eventDate = new Date(event.date)
  const isPastEvent = eventDate < new Date()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 dark:hover:bg-emerald-900/20 dark:text-emerald-300 dark:hover:text-emerald-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Hero Section */}
          <div className="relative rounded-xl overflow-hidden mb-8 shadow-lg">
            <div className="relative h-[400px] w-full">
              <Image
                src={event.bannerUrl || "/default-events.jpg"}
                alt={event.title}
                layout="fill"
                objectFit="cover"
                priority
                className="transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">{event.category}</Badge>
                <Badge
                  className={
                    event.type === "free"
                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                      : "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/40"
                  }
                >
                  {event.type === "free" ? "Free Event" : "Premium Event"}
                </Badge>
                {isPastEvent && <Badge variant="destructive">Past Event</Badge>}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{event.title}</h1>
              <div className="flex flex-wrap gap-4 text-white/90">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{format(eventDate, "EEEE, MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{format(eventDate, "h:mm a")}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap gap-4 mb-8">
            {!isRegistered && !isPastEvent ? (
              <Button
                onClick={handleRegisterClick}
                className="flex-1 md:flex-none bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                size="lg"
              >
                <CalendarCheck className="mr-2 h-5 w-5" />
                Register Now
                {event.price !== "Free" && ` - ${event.price}`}
              </Button>
            ) : isRegistered ? (
              <Button
                className="flex-1 md:flex-none bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                size="lg"
                disabled
              >
                <Check className="mr-2 h-5 w-5" />
                You're Registered
              </Button>
            ) : (
              <Button
                className="flex-1 md:flex-none bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                size="lg"
                disabled
              >
                <AlertTriangle className="mr-2 h-5 w-5" />
                Event Ended
              </Button>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
                onClick={toggleLike}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-emerald-600 text-emerald-600" : ""}`} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
                onClick={handleShareEvent}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Event Details */}
            <div className="md:col-span-2">
              <Card className="border-emerald-100 dark:border-emerald-900/50 overflow-hidden shadow-md">
                <CardHeader className="pb-2 border-b border-emerald-100 dark:border-emerald-900/50">
                  <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-emerald-50/70 dark:bg-emerald-900/30">
                      <TabsTrigger
                        value="details"
                        className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white dark:data-[state=active]:bg-emerald-700"
                      >
                        <Info className="h-4 w-4 mr-2" />
                        Details
                      </TabsTrigger>
                      <TabsTrigger
                        value="attendees"
                        className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white dark:data-[state=active]:bg-emerald-700"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Attendees
                      </TabsTrigger>
                      <TabsTrigger
                        value="discussion"
                        className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white dark:data-[state=active]:bg-emerald-700"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Discussion
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>

                <CardContent className="p-6">
                  <TabsContent value="details" className="mt-0 space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-emerald-800 dark:text-emerald-200">
                        About This Event
                      </h3>
                      <div className="prose prose-emerald max-w-none dark:prose-invert">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                          {event.description}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-emerald-800 dark:text-emerald-200">
                        Date and Time
                      </h3>
                      <div className="bg-emerald-50/70 dark:bg-emerald-900/20 p-4 rounded-lg">
                        <div className="flex items-center text-emerald-800 dark:text-emerald-200 font-medium">
                          <Calendar className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          <span>{format(eventDate, "EEEE, MMMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center mt-2 text-emerald-700 dark:text-emerald-300">
                          <Clock className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          <span>{format(eventDate, "h:mm a")}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-emerald-800 dark:text-emerald-200">Location</h3>
                      <div className="bg-emerald-50/70 dark:bg-emerald-900/20 p-4 rounded-lg">
                        <div className="flex items-center text-emerald-800 dark:text-emerald-200 font-medium">
                          <MapPin className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          <span>{event.location}</span>
                        </div>
                        <div className="mt-2 rounded-md overflow-hidden h-40 relative">
                          <Image
                            src={`https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(
                              event.location,
                            )}&zoom=14&size=600x300&maptype=roadmap&markers=color:red%7C${encodeURIComponent(
                              event.location,
                            )}&key=YOUR_API_KEY`}
                            alt="Event location map"
                            layout="fill"
                            objectFit="cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Button
                              variant="secondary"
                              className="bg-white/90 hover:bg-white text-emerald-800"
                              onClick={() =>
                                window.open(
                                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`,
                                  "_blank",
                                )
                              }
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open in Maps
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-emerald-800 dark:text-emerald-200">
                        Contact Information
                      </h3>
                      <div className="bg-emerald-50/70 dark:bg-emerald-900/20 p-4 rounded-lg space-y-2">
                        <div className="flex items-center">
                          <Mail className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          <a
                            href={`mailto:${event.contactEmail}`}
                            className="text-emerald-700 hover:text-emerald-800 hover:underline dark:text-emerald-300 dark:hover:text-emerald-200"
                          >
                            {event.contactEmail}
                          </a>
                        </div>
                        <div className="flex items-center">
                          <Phone className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          <a
                            href={`tel:${event.contactPhone}`}
                            className="text-emerald-700 hover:text-emerald-800 hover:underline dark:text-emerald-300 dark:hover:text-emerald-200"
                          >
                            {event.contactPhone}
                          </a>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="attendees" className="mt-0">
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-emerald-500 mb-4" />
                      <h3 className="text-xl font-semibold mb-2 text-emerald-800 dark:text-emerald-200">
                        {event.attendees} People Attending
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Join them and be part of this amazing event!
                      </p>

                      {/* Mock attendees */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <Avatar className="h-16 w-16 mb-2">
                              <AvatarImage src={`https://i.pravatar.cc/150?img=${i + 10}`} />
                              <AvatarFallback>U{i}</AvatarFallback>
                            </Avatar>
                            <p className="text-sm font-medium">User {i + 1}</p>
                          </div>
                        ))}
                      </div>

                      {!isRegistered && !isPastEvent && (
                        <Button
                          onClick={handleRegisterClick}
                          className="mt-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Join This Event
                        </Button>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="discussion" className="mt-0">
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 mx-auto text-emerald-500 mb-4" />
                      <h3 className="text-xl font-semibold mb-2 text-emerald-800 dark:text-emerald-200">
                        Event Discussion
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Connect with other attendees and ask questions about the event.
                      </p>

                      {session ? (
                        <div className="text-left bg-emerald-50/70 dark:bg-emerald-900/20 p-4 rounded-lg">
                          <p className="text-emerald-700 dark:text-emerald-300 mb-4">
                            Discussion board will be available closer to the event date.
                          </p>
                          <Button
                            variant="outline"
                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Get Notified When Discussion Opens
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => router.push("/sign-in")}
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Sign In to Join Discussion
                        </Button>
                      )}
                    </div>
                  </TabsContent>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Organizer Card */}
              <Card className="border-emerald-100 dark:border-emerald-900/50 overflow-hidden shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <User className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    Event Organizer
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={event.organizer?.image || "/placeholder.svg"} />
                      <AvatarFallback>{event.organizer?.name?.charAt(0) || "O"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{event.organizer?.name || "EduConnect"}</p>
                      <p className="text-sm text-muted-foreground">Event Organizer</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    variant="outline"
                    className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Organizer
                  </Button>
                </CardFooter>
              </Card>

              {/* Price Card */}
              <Card className="border-emerald-100 dark:border-emerald-900/50 overflow-hidden shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Tag className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    Ticket Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="bg-emerald-50/70 dark:bg-emerald-900/20 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Price:</span>
                      <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                        {event.price === "Free" ? "Free" : event.price}
                      </span>
                    </div>
                    {event.price !== "Free" && (
                      <p className="text-sm text-muted-foreground mt-2">* Taxes and fees may apply</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  {!isRegistered && !isPastEvent ? (
                    <Button
                      onClick={handleRegisterClick}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                    >
                      <CalendarCheck className="mr-2 h-4 w-4" />
                      Register Now
                    </Button>
                  ) : isRegistered ? (
                    <Button
                      className="w-full bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                      disabled
                    >
                      <Check className="mr-2 h-4 w-4" />
                      You're Registered
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      disabled
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Event Ended
                    </Button>
                  )}
                </CardFooter>
              </Card>

              {/* Similar Events */}
              {event.similarEvents && event.similarEvents.length > 0 && (
                <Card className="border-emerald-100 dark:border-emerald-900/50 overflow-hidden shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <Calendar className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      Similar Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {event.similarEvents.map((similarEvent) => (
                      <div
                        key={similarEvent.id}
                        className="group cursor-pointer"
                        onClick={() => router.push(`/Events/${similarEvent.id}`)}
                      >
                        <div className="relative h-24 rounded-md overflow-hidden mb-2">
                          <Image
                            src={similarEvent.bannerUrl || "/default-events.jpg"}
                            alt={similarEvent.title}
                            layout="fill"
                            objectFit="cover"
                            className="group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <h4 className="font-medium text-emerald-700 dark:text-emerald-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-200 line-clamp-1">
                          {similarEvent.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(similarEvent.date), "MMM d, yyyy")}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button
                      variant="outline"
                      className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
                      onClick={() => router.push("/events")}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      View All Events
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <RegistrationForm
          event={event}
          onSuccess={handleRegistrationSuccess}
          onClose={() => setShowRegistrationForm(false)}
          submitting={formSubmitting}
          setSubmitting={setFormSubmitting}
        />
      )}
    </div>
  )
}
