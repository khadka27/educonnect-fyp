"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "src/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import { Skeleton } from "src/components/ui/skeleton";
import { useToast } from "src/hooks/use-toast";
import { Calendar, MapPin, Mail, Phone, Tag, ArrowLeft } from "lucide-react";
import RegistrationForm from "src/components/event/registration-form";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: string;
  bannerUrl?: string;
  contactEmail: string;
  contactPhone: string;
}

export default function EventDetailPage() {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const router = useRouter();
  const { eventId } = useParams();
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;

      setLoading(true);
      try {
        const res = await fetch(`/api/events/${eventId}`);
        if (!res.ok) throw new Error("Failed to fetch event");
        const data = await res.json();
        setEvent(data.event);

        if (session?.user?.id) {
          const regRes = await fetch(
            `/api/events/check-registration?eventId=${eventId}&userId=${session.user.id}`
          );
          if (!regRes.ok)
            throw new Error("Failed to check registration status");
          const regData = await regRes.json();
          setIsRegistered(regData.isRegistered);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        toast({
          title: "Error",
          description: "Failed to load event details. Please try again.",
          variant: "destructive",
        });
        router.push("/events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, session?.user?.id, router]);

  const handleRegisterClick = () => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "You need to sign in before registering for this event.",
        variant: "destructive",
      });
      router.push("/sign-in");
      return;
    }
    setShowRegistrationForm(true);
  };

  const handleRegistrationSuccess = () => {
    setIsRegistered(true);
    setShowRegistrationForm(false);
    setFormSubmitting(false);
    toast({
      title: "Thank You!",
      description:
        "You've successfully registered for the event. Check your email for the ticket.",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 w-1/2">
        <Card>
          <CardHeader>
            <Skeleton className="h-12 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8 w-1/2">
        <Card>
          <CardContent>
            <p className="text-center">Event not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 w-1/2">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
      </Button>
      <Card className="overflow-hidden">
        {event.bannerUrl && (
          <div className="relative h-64 w-full">
            <Image
              src={event.bannerUrl}
              alt={event.title}
              layout="fill"
              objectFit="cover"
              priority
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl lg:text-4xl">
            {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{event.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span>
                {new Date(event.date).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center">
              <Tag className="mr-2 h-4 w-4" />
              <span className="capitalize">{event.type}</span>
            </div>
            <div className="flex items-center">
              <Mail className="mr-2 h-4 w-4" />
              <a
                href={`mailto:${event.contactEmail}`}
                className="hover:underline"
              >
                {event.contactEmail}
              </a>
            </div>
            <div className="flex items-center">
              <Phone className="mr-2 h-4 w-4" />
              <a href={`tel:${event.contactPhone}`} className="hover:underline">
                {event.contactPhone}
              </a>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {!loading && !isRegistered ? (
            <Button onClick={handleRegisterClick} className="w-full">
              Register for Event
            </Button>
          ) : (
            <p className="text-center w-full p-2 bg-green-100 text-green-800 rounded">
              You are registered for this event!
            </p>
          )}
        </CardFooter>
      </Card>
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
  );
}
