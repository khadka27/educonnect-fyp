"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useAdmin, adminActions } from "@/context/admin-context";
import { EventsTable } from "./events-table";
import { EventsFilters } from "./events-filters";
import { CreateEventDialog } from "./create-event-dialog";

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  startTime: string | null;
  registrationEndDate: string | null;
  location: string;
  type: "FREE" | "PREMIUM";
  bannerUrl: string | null;
  contactEmail: string;
  contactPhone: string;
  price: number | null;
  discountPercentage: number | null;
  createdAt: string;
  user: {
    name: string;
  };
  _count: {
    registrations: number;
    payments: number;
  };
}

interface EventsResponse {
  events: Event[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function EventsClient() {
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 8,
  });
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { dispatch } = useAdmin();

  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "8");
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        adminActions.setLoading(dispatch, true);
        setLoading(true);

        // Build query string
        const queryParams = new URLSearchParams();
        queryParams.set("page", page.toString());
        queryParams.set("limit", limit.toString());
        if (search) queryParams.set("search", search);
        if (type && type !== "ALL") queryParams.set("type", type);

        const response = await axios.get<EventsResponse>(
          `/api/admin/events?${queryParams.toString()}`
        );

        setEvents(response.data.events);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalItems: response.data.totalItems,
          itemsPerPage: response.data.itemsPerPage,
        });
      } catch (error) {
        console.error("Error fetching events:", error);
        adminActions.addAlert(dispatch, "Failed to fetch events", "error");
      } finally {
        setLoading(false);
        adminActions.setLoading(dispatch, false);
      }
    };

    fetchEvents();
  }, [page, limit, search, type, dispatch]);

  const handleEventCreated = () => {
    setIsCreateEventOpen(false);
    adminActions.addAlert(dispatch, "Event created successfully", "success");
    // Refresh the table
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Events Management</h1>
        <Button onClick={() => setIsCreateEventOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      <EventsFilters />

      <EventsTable events={events} pagination={pagination} loading={loading} />

      <CreateEventDialog
        open={isCreateEventOpen}
        onOpenChange={setIsCreateEventOpen}
        onSuccess={handleEventCreated}
      />
    </div>
  );
}
