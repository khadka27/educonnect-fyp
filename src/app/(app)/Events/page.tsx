'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: string;
  bannerUrl?: string;
}

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        setEvents(data.events);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <p>Loading events...</p>;
  }

  return (
    <div>
      <h1>Upcoming Events</h1>
      {events.length === 0 ? (
        <p>No events available</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event.id} className="event-card">
              <h2>{event.title}</h2>
              <p>{event.description}</p>
              <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
              <p><strong>Location:</strong> {event.location}</p>
              <p><strong>Type:</strong> {event.type}</p>
              {event.bannerUrl && <img src={event.bannerUrl} alt={event.title} width="200" />}
              <Link href={`/events/${event.id}`}>View Details</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventsPage;
