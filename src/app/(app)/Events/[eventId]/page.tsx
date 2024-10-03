'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

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
  const router = useRouter();
  const { eventId } = useParams(); // Fetching the eventId from the URL

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
    </div>
  );
};

export default EventDetailPage;
