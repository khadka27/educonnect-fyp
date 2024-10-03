'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react'; // For user authentication

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

const EventDetailPage = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false); // Track registration status
  const router = useRouter();
  const { eventId } = useParams();
  const { data: session } = useSession(); // Check if the user is logged in

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        const data = await res.json();
        setEvent(data.event);
      } catch (error) {
        console.error('Error fetching event:', error);
        router.push('/events'); // Redirect to events page on error
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId, router]);

  const handleRegister = async () => {
    if (!session) {
      router.push('/login'); // Redirect to login if not logged in
      return;
    }

    try {
      const res = await fetch('/api/events/register', {
        method: 'POST',
        body: JSON.stringify({
          eventId: event?.id,
          userId: session?.user?.id, // The logged-in user ID from session
          name: session?.user?.name,
          email: session?.user?.email,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        setIsRegistered(true);
        alert('Successfully registered for the event!');
      } else {
        console.error('Failed to register for event');
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  if (loading) {
    return <p>Loading event details...</p>;
  }

  if (!event) {
    return <p>Event not found</p>;
  }

  return (
    <div>
      <h1>{event.title}</h1>
      <p>{event.description}</p>
      <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
      <p><strong>Location:</strong> {event.location}</p>
      <p><strong>Type:</strong> {event.type}</p>
      {event.bannerUrl && <img src={event.bannerUrl} alt={event.title} width="300" />}
      <p><strong>Contact Email:</strong> {event.contactEmail}</p>
      <p><strong>Contact Phone:</strong> {event.contactPhone}</p>

      {/* Show registration button only if user is not already registered */}
      {!isRegistered ? (
        <button onClick={handleRegister}>Register for Event</button>
      ) : (
        <p>You are already registered for this event!</p>
      )}
    </div>
  );
};

export default EventDetailPage;
