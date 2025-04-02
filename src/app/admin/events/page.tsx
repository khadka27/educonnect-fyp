import type { Metadata } from "next";
import EventsClient from "src/components/admin/events/events-client";

export const metadata: Metadata = {
  title: "Events Management | EduConnect Admin",
  description: "Manage events on the EduConnect platform",
};

export default function EventsPage() {
  return <EventsClient />;
}
