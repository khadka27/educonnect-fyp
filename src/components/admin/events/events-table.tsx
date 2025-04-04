"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "src/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "src/components/ui/badge";
import { ChevronLeft, ChevronRight, MoreHorizontal, Edit, Trash, Eye, Users } from 'lucide-react';
import { format, isPast } from "date-fns";
import { EditEventDialog } from "./edit-event-dialog";
import { DeleteEventDialog } from "./delete-event-dialog";
import { useAdmin, adminActions } from "@/context/admin-context";
import axios from "axios";

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

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface EventsTableProps {
  events: Event[];
  pagination: PaginationData;
  loading: boolean;
}

export function EventsTable({ events, pagination, loading }: EventsTableProps) {
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { dispatch } = useAdmin();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleEventUpdated = () => {
    setEventToEdit(null);
    adminActions.addAlert(
      dispatch,
      "Event updated successfully",
      "success"
    );
    router.refresh();
  };

  const handleEventDeleted = async () => {
    if (!eventToDelete) return;
    
    try {
      adminActions.setLoading(dispatch, true);
      await axios.delete(`/api/admin/events/${eventToDelete.id}`);
      
      setEventToDelete(null);
      adminActions.addAlert(
        dispatch,
        "Event deleted successfully",
        "success"
      );
      router.refresh();
    } catch (error) {
      console.error("Error deleting event:", error);
      adminActions.addAlert(
        dispatch,
        "Failed to delete event",
        "error"
      );
    } finally {
      adminActions.setLoading(dispatch, false);
    }
  };

  const handleViewDetails = (eventId: string) => {
    router.push(`/admin/events/${eventId}`);
  };

  const handleViewRegistrations = (eventId: string) => {
    router.push(`/admin/events/${eventId}/registrations`);
  };

  const getEventStatusBadge = (event: Event) => {
    const eventDate = new Date(event.date);
    const isEventPast = isPast(eventDate);
    
    if (isEventPast) {
      return <Badge variant="outline">Completed</Badge>;
    }
    
    const hasRegistrationEnded = event.registrationEndDate && 
      isPast(new Date(event.registrationEndDate));
    
    if (hasRegistrationEnded) {
      return <Badge variant="secondary">Registration Closed</Badge>;
    }
    
    return <Badge variant="default">Upcoming</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registrations</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: pagination.itemsPerPage }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
                      <div className="h-3 w-24 animate-pulse rounded bg-muted"></div>
                    </div>
                  </TableCell>
                  <TableCell><div className="h-4 w-24 animate-pulse rounded bg-muted"></div></TableCell>
                  <TableCell><div className="h-4 w-24 animate-pulse rounded bg-muted"></div></TableCell>
                  <TableCell><div className="h-6 w-16 animate-pulse rounded bg-muted"></div></TableCell>
                  <TableCell><div className="h-6 w-16 animate-pulse rounded bg-muted"></div></TableCell>
                  <TableCell><div className="h-4 w-8 animate-pulse rounded bg-muted"></div></TableCell>
                  <TableCell><div className="h-8 w-8 animate-pulse rounded bg-muted"></div></TableCell>
                </TableRow>
              ))
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No events found.
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium leading-none">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        by {event.user.name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(event.date), "MMM d, yyyy")}
                    {event.startTime && (
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(event.startTime), "h:mm a")}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>
                    <Badge variant={event.type === "PREMIUM" ? "default" : "secondary"}>
                      {event.type}
                      {event.type === "PREMIUM" && event.price && (
                        <span className="ml-1">₹{event.price}</span>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getEventStatusBadge(event)}
                  </TableCell>
                  <TableCell>
                    <div className="text-center font-medium">
                      {event._count.registrations}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewDetails(event.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewRegistrations(event.id)}>
                          <Users className="mr-2 h-4 w-4" />
                          Registrations
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEventToEdit(event)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEventToDelete(event)}>
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-
          {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>
      
      {eventToEdit && (
        <EditEventDialog 
          event={eventToEdit} 
          open={!!eventToEdit} 
          onOpenChange={() => setEventToEdit(null)}
          onSuccess={handleEventUpdated}
        />
      )}
      
      {eventToDelete && (
        <DeleteEventDialog 
          event={eventToDelete}
          open={!!eventToDelete}
          onOpenChange={() => setEventToDelete(null)}
          onSuccess={handleEventDeleted}
        />
      )}
    </div>
  );
}
